const UserModel = require("../models/UserModel");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../helpers/emailService");

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        error: true,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
        error: true,
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
        error: true,
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(user.email, resetToken, user.name);

    return res.status(200).json({
      message: "Password reset link sent to your email",
      success: true,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: error.message || "Failed to process request",
      error: true,
    });
  }
}

module.exports = forgotPassword;