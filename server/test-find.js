const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const { MessageModel } = require('./models/ConversationModel');
    const groupId = '6a301b3a2986e5e38ecc0fa6';
    const messages = await MessageModel.find({ groupId })
          .populate("msgByUserId", "name profile_pic")
          .sort({ createdAt: 1 });
    console.log('Messages loaded:', messages.length);
    if(messages.length > 0) {
      console.log('Populated msgByUserId:', messages[0].msgByUserId);
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
});
