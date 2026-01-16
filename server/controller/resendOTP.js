const UserModel = require("../models/UserModel");
const { generateOTP, sendOTPEmail } = require("../helpers/emailService");

async function resendOTP(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        error: true,
      });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email already verified",
        error: true,
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.email, otp, user.name);

    return res.status(200).json({
      message: "New OTP sent to your email",
      success: true,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      message: error.message || "Failed to resend OTP",
      error: true,
    });
  }
}

module.exports = resendOTP;