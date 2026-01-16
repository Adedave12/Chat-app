const UserModel = require("../models/UserModel");

async function verifyOTP(req, res) {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        message: "User ID and OTP are required",
        error: true,
      });
    }

    // Find user
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "Email already verified",
        error: true,
      });
    }

    // Check if OTP is expired
    if (!user.otp || !user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
        error: true,
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP. Please try again.",
        error: true,
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully! You can now login.",
      success: true,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      message: error.message || "Verification failed",
      error: true,
    });
  }
}

module.exports = verifyOTP;