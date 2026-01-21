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

    // Hash password - REDUCE SALT ROUNDS FOR SPEED
    const salt = await bcryptjs.genSalt(8); // Changed from 10 to 8 (faster, still secure)
    const hashPassword = await bcryptjs.hash(password, salt);

    let userId;

    if (existingUser && !existingUser.isVerified) {
      // Update existing unverified user
      existingUser.name = name;
      existingUser.password = hashPassword;
      existingUser.profile_pic = profile_pic || "";
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();

      userId = existingUser._id;
      console.log("Updated existing user:", userId);
    } else {
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
      userId = newUser._id;
      console.log("New user created:", userId);
    }

    // ⚡ CRITICAL FIX: Send response IMMEDIATELY, send email in background
    // Respond to user first
    res.status(201).json({
      message: "Registration successful! OTP sent to your email.",
      userId: userId,
      success: true,
    });

    // ⚡ Send email asynchronously (don't await, don't block response)
    sendOTPEmail(email, otp, name)
      .then(() => {
        console.log("✅ OTP email sent successfully to:", email);
      })
      .catch((emailError) => {
        console.error("❌ Email sending failed (non-blocking):", emailError);
        // Email failed but user is already registered
        // You could implement a retry mechanism or manual resend option
      });

    // Note: We're not deleting the user if email fails anymore
    // because we already responded. Instead, implement a "Resend OTP" feature.

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: error.message || "Registration failed",
      error: true,
    });
  }
}

module.exports = registerUser;