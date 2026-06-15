const UserModel = require("../models/UserModel");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

async function toggleArchiveUser(req, res) {
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
    const archivedArray = currentUser.archivedUsers || [];
    const isArchived = archivedArray.some(id => id.toString() === targetUserId.toString());

    if (isArchived) {
      // Unarchive
      currentUser.archivedUsers = archivedArray.filter(id => id.toString() !== targetUserId.toString());
    } else {
      // Archive
      currentUser.archivedUsers = [...archivedArray, targetUserId];
    }

    await currentUser.save();

    return res.status(200).json({
      message: isArchived ? "Chat unarchived successfully" : "Chat archived successfully",
      isArchived: !isArchived,
      success: true
    });

  } catch (error) {
    console.error("Toggle archive error:", error);
    return res.status(500).json({
      message: error.message || "Failed to archive/unarchive chat",
      error: true
    });
  }
}

module.exports = toggleArchiveUser;
