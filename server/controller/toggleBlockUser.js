const UserModel = require("../models/UserModel");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

async function toggleBlockUser(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : "";

    const user = await getUserDetailsFromToken(token);
    if (user.logout) {
      return res.status(401).json({ message: "Session expired", error: true });
    }

    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ message: "Target User ID is required", error: true });
    }

    const currentUser = await UserModel.findById(user._id);

    // Toggle logic
    const blockedArray = currentUser.blockedUsers || [];
    const isBlocked = blockedArray.some(id => id.toString() === targetUserId.toString());

    if (isBlocked) {
      // Unblock
      currentUser.blockedUsers = blockedArray.filter(id => id.toString() !== targetUserId.toString());
    } else {
      // Block
      currentUser.blockedUsers = [...blockedArray, targetUserId];
    }

    await currentUser.save();

    return res.status(200).json({
      message: isBlocked ? "User unblocked successfully" : "User blocked successfully",
      isBlocked: !isBlocked,
      success: true
    });

  } catch (error) {
    console.error("Toggle block error:", error);
    return res.status(500).json({
      message: error.message || "Failed to block/unblock user",
      error: true
    });
  }
}

module.exports = toggleBlockUser;
