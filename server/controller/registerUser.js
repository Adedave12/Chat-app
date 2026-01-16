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

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("Generated OTP:", otp);

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    if (existingUser && !existingUser.isVerified) {
      // Update existing unverified user
      existingUser.name = name;
      existingUser.password = hashPassword;
      existingUser.profile_pic = profile_pic || "";
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();

      console.log("Updated existing user:", existingUser._id);

      // Send OTP email
      try {
        await sendOTPEmail(email, otp, name);
        console.log("OTP email sent successfully");
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        return res.status(500).json({
          message: "Failed to send verification email. Please try again.",
          error: true,
        });
      }

      return res.status(200).json({
        message: "OTP sent to your email. Please verify to complete registration.",
        userId: existingUser._id,
        success: true,
      });
    }

    // Create new user
    const newUser = new UserModel({
      name,
      email,
      password: hashPassword,
      profile_pic: profile_pic || "",
      otp,
      otpExpiry,
      isVerified: false,
    });

    await newUser.save();
    console.log("New user created:", newUser._id);

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, name);
      console.log("OTP email sent successfully");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Delete the user if email fails
      await UserModel.findByIdAndDelete(newUser._id);
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
        error: true,
      });
    }

    return res.status(201).json({
      message: "Registration successful! OTP sent to your email.",
      userId: newUser._id,
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