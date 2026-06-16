const UserModel = require("../models/UserModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        error: true,
      });
    }

    // Find user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register first.",
        error: true,
      });
    }

    // Check if email is verified
    // (Verification is now disabled, allowing all users to login immediately)

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password",
        error: true,
      });
    }

    // Generate JWT token
    const tokenData = {
      id: user._id,
      email: user.email,
    };

    const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d", // 7 days
    });

    // Update user status to online
    user.status = "online";
    await user.save();

    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profile_pic: user.profile_pic,
      status: user.status,
    };

    return res.status(200).json({
      message: "Login successful",
      token: token,
      data: userData,
      success: true,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: error.message || "Login failed",
      error: true,
    });
  }
}

module.exports = login;