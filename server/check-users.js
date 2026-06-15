const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const User = require('./models/UserModel');
    const users = await User.find({}, 'name profile_pic');
    console.log('Users:', users);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
});
