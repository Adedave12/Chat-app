const { ConversationModel } = require("../models/ConversationModel");
const UserModel = require("../models/UserModel");

const getConversation = async (currentUserId) => {
  if (!currentUserId || currentUserId === "") {
    return [];
  }
  
  const currentUser = await UserModel.findById(currentUserId);
  const archivedUsers = currentUser?.archivedUsers?.map(id => id.toString()) || [];

  const currentUserConversation = await ConversationModel.find({
    $or: [
      {
        sender: currentUserId,
      },
      {
        receiver: currentUserId,
      },
    ],
  })
    .sort({ updatedAt: -1 })
    .populate("messages")
    .populate("sender")
    .populate("receiver");

  if (currentUserConversation && currentUserConversation.length > 0) {
    const conversation = currentUserConversation.map((conv) => {
      const countUnseenMsg = conv?.messages?.reduce((prev, curr) => {
        const msgByUserId = curr?.msgByUserId?.toString();
        if (msgByUserId !== currentUserId) {
          return prev + (curr?.seen ? 0 : 1);
        } else {
          return prev;
        }
      }, 0);
      
      const otherUserId = conv.sender?._id?.toString() === currentUserId 
        ? conv.receiver?._id?.toString() 
        : conv.sender?._id?.toString();
        
      const isArchived = archivedUsers.includes(otherUserId);
      const isBlocked = currentUser?.blockedUsers?.map(id => id.toString()).includes(otherUserId) || false;

      return {
        _id: conv?._id,
        sender: conv?.sender,
        receiver: conv?.receiver,
        unseenMsg: countUnseenMsg,
        lastMsg: conv.messages[conv?.messages?.length - 1],
        isArchived,
        isBlocked
      };
    });

    return conversation;
  } else {
    return [];
  }
};

module.exports = getConversation;
