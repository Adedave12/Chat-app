const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../models/UserModel");
const {
  ConversationModel,
  MessageModel,
} = require("../models/ConversationModel");
const getConversation = require("../helpers/getConversation.js");
const app = express();

// Socket Connection
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Socket is running at http://localhost:8000/

// Online User
const onlineUser = new Set();
io.on("connection", async (socket) => {
  console.log("Connect User", socket.id);

  let user;

  try {
    const token = socket.handshake.auth.token;

    // Current User Details
    user = await getUserDetailsFromToken(token);

    if (!user) {
      // If token verification fails, disconnect with an error
      socket.emit("auth_error", {
        message: "Authentication failed. Please log in again.",
      });
      socket.disconnect(true);
      return;
    }

    // Rest of your connection code
    socket.join(user._id.toString());
    onlineUser.add(user._id.toString());

    io.emit("onlineUser", Array.from(onlineUser));

    // Send undelivered messages to the user
    const conversations = await ConversationModel.find({
      receiver: user._id
    }).populate("messages");

    for (const conv of conversations) {
      const undeliveredMessages = conv.messages.filter(msg => !msg.delivered && msg.msgByUserId !== user._id);
      for (const msg of undeliveredMessages) {
        socket.emit("receive_message", {
          _id: msg._id,
          text: msg.text,
          imageUrl: msg.imageUrl,
          videoUrl: msg.videoUrl,
          msgByUserId: msg.msgByUserId,
          delivered: true,
          seen: msg.seen,
          createdAt: msg.createdAt,
        });
        // Mark as delivered
        await MessageModel.updateOne({ _id: msg._id }, { delivered: true });
      }
    }

    socket.on("message-page", async (userId) => {
      console.log("userId", userId);
      const userDetails = await UserModel.findById(userId).select("-password");

      const payload = {
        _id: userDetails?._id,
        name: userDetails?.name,
        email: userDetails?.email,
        profile_pic: userDetails?.profile_pic,
        online: onlineUser.has(userId),
      };

      socket.emit("message-user", payload);

      // To load previous messages
      const getConversationMessage = await ConversationModel.findOne({
        $or: [
          {
            sender: user?.id,
            receiver: userId,
          },
          {
            sender: userId,
            receiver: user?.id,
          },
        ],
      })
        .populate("messages")
        .sort({ updatedAt: -1 });

      // Check if conversation exists before accessing messages
      if (getConversationMessage) {
        socket.emit("message", getConversationMessage.messages);
        
        // When a user opens a chat, mark all messages from the other user as seen
        await MessageModel.updateMany(
          { 
            _id: { $in: getConversationMessage.messages },
            msgByUserId: userId,
            seen: false 
          },
          { $set: { seen: true } }
        );
        
        // Notify the sender that their messages have been seen
        io.to(userId).emit("messages_seen_by", {
          conversationId: getConversationMessage._id,
          seenBy: user?._id
        });
        
        // Update sidebar for both users
        updateSidebarForUser(user?._id);
        updateSidebarForUser(userId);
      } else {
        // If no conversation exists, emit an empty array
        socket.emit("message", []);
      }
    });

    // New message handler
    socket.on("new message", async (data) => {
      try {
        // Check if conversation is available for both users
        let conversation = await ConversationModel.findOne({
          $or: [
            {
              sender: data?.sender,
              receiver: data?.receiver,
            },
            {
              sender: data?.receiver,
              receiver: data?.sender,
            },
          ],
        });

        // If conversation is not available
        if (!conversation) {
          const createConversation = await ConversationModel({
            sender: data?.sender,
            receiver: data?.receiver,
          });
          conversation = await createConversation.save();
        }

        // Check if receiver is online
        const isReceiverOnline = onlineUser.has(data.receiver);

        // Create and save the new message
        const message = new MessageModel({
          text: data.text,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          msgByUserId: data?.msgByUserId,
          delivered: isReceiverOnline, // Mark as delivered if receiver is online
          seen: false
        });

        const savedMessage = await message.save();

        // Update the conversation with the new message
        await ConversationModel.updateOne(
          { _id: conversation?._id },
          {
            $push: { messages: savedMessage?._id },
          }
        );

        // Prepare the message to send back to clients
        const messageToSend = {
          _id: savedMessage._id,
          text: savedMessage.text,
          imageUrl: savedMessage.imageUrl,
          videoUrl: savedMessage.videoUrl,
          msgByUserId: savedMessage.msgByUserId,
          delivered: savedMessage.delivered,
          seen: savedMessage.seen,
          createdAt: savedMessage.createdAt,
        };

        io.to(data?.sender).emit("message_sent", messageToSend);
        io.to(data?.receiver).emit("receive_message", messageToSend);

        // Update sidebar conversations for both users
        updateSidebarForUser(data?.sender);
        updateSidebarForUser(data?.receiver);
      } catch (error) {
        console.error("Error handling new message:", error);
        socket.emit("message_error", {
          message: "Failed to send message. Please try again.",
        });
      }
    });

    // Mark messages as delivered when receiver comes online
    socket.on("mark_as_delivered", async (senderId) => {
      try {
        // Find the conversation between the two users
        const conversation = await ConversationModel.findOne({
          $or: [
            { sender: user._id, receiver: senderId },
            { sender: senderId, receiver: user._id },
          ]
        }).populate("messages");
        
        if (conversation) {
          // Update all undelivered messages from the other user
          const updatedMessages = await MessageModel.updateMany(
            { 
              _id: { $in: conversation.messages },
              msgByUserId: senderId,
              delivered: false 
            },
            { $set: { delivered: true } }
          );
          
          if (updatedMessages.modifiedCount > 0) {
            // Notify the sender that their messages have been delivered
            io.to(senderId).emit("messages_delivered", {
              conversationId: conversation._id,
              deliveredTo: user._id
            });
          }
        }
      } catch (error) {
        console.error("Error marking messages as delivered:", error);
      }
    });

    // Mark messages as seen
    socket.on("seen", async (senderId) => {
      try {
        // Find the conversation
        const conversation = await ConversationModel.findOne({
          $or: [
            { sender: user._id, receiver: senderId },
            { sender: senderId, receiver: user._id },
          ]
        }).populate("messages");
        
        if (conversation) {
          // Update all unseen messages from the other user
          const updatedMessages = await MessageModel.updateMany(
            { 
              _id: { $in: conversation.messages },
              msgByUserId: senderId,
              seen: false 
            },
            { $set: { seen: true } }
          );
          
          if (updatedMessages.modifiedCount > 0) {
            // Notify the sender that their messages have been seen
            io.to(senderId).emit("messages_seen_by", {
              conversationId: conversation._id,
              seenBy: user._id
            });
            
            // Update sidebar for both users
            updateSidebarForUser(user._id);
            updateSidebarForUser(senderId);
          }
        }
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    });

    // Helper function to update sidebar conversations for a user
    async function updateSidebarForUser(userId) {
      try {
        const conversations = await getConversation(userId);
        io.to(userId).emit("conversation", conversations);
      } catch (error) {
        console.error(`Error updating sidebar for user ${userId}:`, error);
      }
    }

    // Sidebar conversations request
    socket.on("sidebar", async (userId) => {
      try {
        const conversations = await getConversation(userId);
        socket.emit("conversation", conversations); // This should always be an array
      } catch (error) {
        console.error("Error fetching conversations:", error);
        socket.emit("conversation", []); // Send empty array on error
      }
    });

    // User typing indicator
    socket.on("typing", (data) => {
      socket.to(data.receiver).emit("user_typing", {
        senderId: data.sender,
        isTyping: data.isTyping,
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      onlineUser.delete(user?._id);
      io.emit("onlineUser", Array.from(onlineUser)); // Update online users list for everyone
      console.log("disconnect user", socket.id);
    });
  } catch (error) {
    console.error("Socket error:", error.message);
    socket.emit("auth_error", {
      message: "An error occurred. Please try again.",
    });
    socket.disconnect(true);
  }
});

module.exports = {
  app,
  server,
};