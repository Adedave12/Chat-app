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
    origin: ["http://localhost:5173", "http://localhost:4173", "https://chat-app-front-sbk6.onrender.com"],
    credentials: true,
    methods: ["GET", "POST"]
  },
});

// Online User - Using Map for better tracking
const onlineUser = new Map(); // userId -> socketId

io.on("connection", async (socket) => {
  console.log("🔌 NEW CONNECTION:", socket.id);

  try {
    const token = socket.handshake.auth.token;

    // Get user from token
    const user = await getUserDetailsFromToken(token);

    if (!user || !user._id) {
      console.log("❌ NO USER - Auth failed");
      socket.emit("auth_error", {
        message: "Authentication failed. Please log in again.",
      });
      socket.disconnect(true);
      return;
    }

    const userId = user._id.toString();
    console.log("✅ USER AUTHENTICATED:", user.name, userId);

    // Join user's personal room
    socket.join(userId);
    
    // Add to online users
    onlineUser.set(userId, socket.id);

    // Send updated online list to ALL users
    const onlineUserIds = Array.from(onlineUser.keys());
    console.log("👥 ONLINE USERS:", onlineUserIds.length, "users");
    io.emit("onlineUser", onlineUserIds);

    // Update database status
    await UserModel.findByIdAndUpdate(user._id, { status: "online" });

    // ============ MESSAGE PAGE ============
    socket.on("message-page", async (otherUserId) => {
      console.log("\n📄 MESSAGE-PAGE EVENT");
      console.log("Current user:", userId, user.name);
      console.log("Opening chat with:", otherUserId);
      console.log("Online users before check:", Array.from(onlineUser.keys()));
      
      try {
        // Get other user details
        const userDetails = await UserModel.findById(otherUserId).select("-password");

        if (!userDetails) {
          console.log("❌ Other user not found in database");
          socket.emit("message-user", null);
          return;
        }

        // Check if other user is online
        const isOtherUserOnline = onlineUser.has(otherUserId);
        console.log("Is", userDetails.name, "online?", isOtherUserOnline);
        console.log("Their socket ID:", onlineUser.get(otherUserId) || "not connected");

        const payload = {
          _id: userDetails._id,
          name: userDetails.name,
          email: userDetails.email,
          profile_pic: userDetails.profile_pic,
          online: isOtherUserOnline,
        };

        socket.emit("message-user", payload);

        // Load conversation messages
        const conversation = await ConversationModel.findOne({
          $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId },
          ],
        }).populate("messages");

        if (conversation && conversation.messages) {
          console.log("📜 LOADED", conversation.messages.length, "messages");
          socket.emit("message", conversation.messages);

          // Mark messages as seen
          await MessageModel.updateMany(
            {
              _id: { $in: conversation.messages.map(m => m._id) },
              msgByUserId: otherUserId,
              seen: false,
            },
            { $set: { seen: true } }
          );

          // Notify other user their messages were seen
          if (onlineUser.has(otherUserId)) {
            io.to(otherUserId).emit("messages_seen_by", {
              conversationId: conversation._id,
              seenBy: userId,
            });
          }
        } else {
          console.log("📜 NO MESSAGES - New conversation");
          socket.emit("message", []);
        }
      } catch (error) {
        console.error("❌ MESSAGE-PAGE ERROR:", error);
        socket.emit("message", []);
      }
    });

    // ============ NEW MESSAGE ============
    socket.on("new message", async (data) => {
      console.log("\n💬 NEW MESSAGE EVENT");
      console.log("From:", userId, user.name);
      console.log("To:", data.receiver);
      console.log("Text:", data.text?.substring(0, 30) || "media");
      
      try {
        // Find or create conversation
        let conversation = await ConversationModel.findOne({
          $or: [
            { sender: data.sender, receiver: data.receiver },
            { sender: data.receiver, receiver: data.sender },
          ],
        });

        if (!conversation) {
          console.log("📝 Creating NEW conversation");
          conversation = await ConversationModel.create({
            sender: data.sender,
            receiver: data.receiver,
          });
        } else {
          console.log("📝 Using EXISTING conversation:", conversation._id);
        }

        // Check if receiver is online
        const isReceiverOnline = onlineUser.has(data.receiver);
        console.log("🟢 Receiver online?", isReceiverOnline);

        // Create and save message
        const message = new MessageModel({
          text: data.text || "",
          imageUrl: data.imageUrl || "",
          videoUrl: data.videoUrl || "",
          msgByUserId: data.msgByUserId,
          delivered: isReceiverOnline,
          seen: false,
        });

        const savedMessage = await message.save();
        console.log("✅ MESSAGE SAVED:", savedMessage._id);

        // Add message to conversation
        await ConversationModel.updateOne(
          { _id: conversation._id },
          { $push: { messages: savedMessage._id } }
        );

        // Prepare message object to send
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

        console.log("📤 EMITTING message_sent to sender:", data.sender);
        io.to(data.sender).emit("message_sent", messageToSend);

        console.log("📤 EMITTING receive_message to receiver:", data.receiver);
        io.to(data.receiver).emit("receive_message", messageToSend);

        // Update sidebars
        await updateSidebarForUser(data.sender);
        await updateSidebarForUser(data.receiver);

        console.log("✅ MESSAGE DELIVERY COMPLETE\n");
      } catch (error) {
        console.error("❌ NEW MESSAGE ERROR:", error);
        socket.emit("message_error", {
          message: "Failed to send message",
        });
      }
    });

    // ============ MARK AS DELIVERED ============
    socket.on("mark_as_delivered", async (senderId) => {
      try {
        const conversation = await ConversationModel.findOne({
          $or: [
            { sender: userId, receiver: senderId },
            { sender: senderId, receiver: userId },
          ],
        }).populate("messages");

        if (conversation) {
          const result = await MessageModel.updateMany(
            {
              _id: { $in: conversation.messages.map(m => m._id) },
              msgByUserId: senderId,
              delivered: false,
            },
            { $set: { delivered: true } }
          );

          if (result.modifiedCount > 0) {
            io.to(senderId).emit("messages_delivered", {
              conversationId: conversation._id,
              deliveredTo: userId,
            });
          }
        }
      } catch (error) {
        console.error("❌ MARK DELIVERED ERROR:", error);
      }
    });

    // ============ SEEN ============
    socket.on("seen", async (senderId) => {
      try {
        const conversation = await ConversationModel.findOne({
          $or: [
            { sender: userId, receiver: senderId },
            { sender: senderId, receiver: userId },
          ],
        }).populate("messages");

        if (conversation) {
          const result = await MessageModel.updateMany(
            {
              _id: { $in: conversation.messages.map(m => m._id) },
              msgByUserId: senderId,
              seen: false,
            },
            { $set: { seen: true } }
          );

          if (result.modifiedCount > 0) {
            io.to(senderId).emit("messages_seen_by", {
              conversationId: conversation._id,
              seenBy: userId,
            });

            await updateSidebarForUser(userId);
            await updateSidebarForUser(senderId);
          }
        }
      } catch (error) {
        console.error("❌ SEEN ERROR:", error);
      }
    });

    // ============ SIDEBAR ============
    socket.on("sidebar", async (currentUserId) => {
      console.log("📋 SIDEBAR REQUEST for:", currentUserId);
      try {
        const conversations = await getConversation(currentUserId);
        socket.emit("conversation", conversations);
      } catch (error) {
        console.error("❌ SIDEBAR ERROR:", error);
        socket.emit("conversation", []);
      }
    });

    // ============ TYPING INDICATOR ============
    socket.on("typing", (data) => {
      console.log("⌨️ TYPING EVENT:", {
        from: data.sender,
        to: data.receiver,
        isTyping: data.isTyping
      });
      
      // Send typing status to receiver
      if (onlineUser.has(data.receiver)) {
        io.to(data.receiver).emit("user_typing", {
          senderId: data.sender,
          isTyping: data.isTyping,
        });
        console.log("✅ Typing indicator sent to:", data.receiver);
      } else {
        console.log("❌ Receiver not online:", data.receiver);
      }
    });

    // Helper function to update sidebar
    async function updateSidebarForUser(targetUserId) {
      try {
        const conversations = await getConversation(targetUserId);
        io.to(targetUserId).emit("conversation", conversations);
      } catch (error) {
        console.error("❌ UPDATE SIDEBAR ERROR:", error);
      }
    }

    // ============ DISCONNECT ============
    socket.on("disconnect", () => {
      console.log("🔌 DISCONNECTED:", socket.id, user.name);
      onlineUser.delete(userId);
      
      // Broadcast updated online list
      const onlineUserIds = Array.from(onlineUser.keys());
      io.emit("onlineUser", onlineUserIds);
      
      // Update database
      UserModel.findByIdAndUpdate(user._id, { status: "offline" }).catch(console.error);
    });

  } catch (error) {
    console.error("❌ SOCKET ERROR:", error);
    socket.emit("auth_error", {
      message: "An error occurred",
    });
    socket.disconnect(true);
  }
});

module.exports = {
  app,
  server,
};