const UserModel = require("../models/UserModel");
const bcryptjs = require("bcryptjs");

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
        error: true,
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
        error: true,
      });
    }

    // Find user with valid reset token
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
        error: true,
      });
    }

    // Hash new password
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    // Update password and clear reset token
    user.password = hashPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    return res.status(200).json({
      message: "Password reset successful. You can now login with your new password.",
      success: true,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      message: error.message || "Failed to reset password",
      error: true,
    });
  }
}

module.exports = resetPassword;