const UserModel = require("../models/UserModel");
const bcryptjs = require("bcryptjs");
const { generateOTP, sendOTPEmail } = require("../helpers/emailService");

async function registerUser(req, res) {
  try {
    const { name, email, password, profile_pic } = req.body;

    console.log("Registration attempt:", { name, email, has_password: !!password });

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
        error: true,
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        message: "User already exists with this email",
        error: true,
      });
    }

    // Hash password - REDUCE SALT ROUNDS FOR SPEED
    const salt = await bcryptjs.genSalt(8); // Changed from 10 to 8 (faster, still secure)
    const hashPassword = await bcryptjs.hash(password, salt);

    let userId;

    if (existingUser && !existingUser.isVerified) {
      // Update existing unverified user to verified
      existingUser.name = name;
      existingUser.password = hashPassword;
      existingUser.profile_pic = profile_pic || "";
      existingUser.isVerified = true;
      existingUser.otp = "";
      existingUser.otpExpiry = null;
      await existingUser.save();

      userId = existingUser._id;
      console.log("Updated existing user to verified:", userId);
    } else {
      // Create new verified user
      const newUser = new UserModel({
        name,
        email,
        password: hashPassword,
        profile_pic: profile_pic || "",
        isVerified: true,
      });

      await newUser.save();
      userId = newUser._id;
      console.log("New user created and verified:", userId);
    }

    // Respond to user
    res.status(201).json({
      message: "Registration successful! You can now log in.",
      userId: userId,
      success: true,
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: error.message || "Registration failed",
      error: true,
    });
  }
}

module.exports = registerUser;