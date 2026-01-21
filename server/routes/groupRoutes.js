const express = require("express");
const {
  createGroup,
  getUserGroups,
  getGroupDetails,
  updateGroup,
  addMembers,
  removeMember,
  leaveGroup,
  deleteGroup,
} = require("../controllers/groupController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create new group
router.post("/create", createGroup);

// Get all groups for user
router.get("/", getUserGroups);

// Get single group details
router.get("/:groupId", getGroupDetails);

// Update group details (admin only)
router.put("/:groupId", updateGroup);

// Add members to group (admin only)
router.post("/:groupId/add-members", addMembers);

// Remove member from group (admin only)
router.delete("/:groupId/remove/:memberId", removeMember);

// Leave group (any member except admin)
router.post("/:groupId/leave", leaveGroup);

// Delete group (admin only)
router.delete("/:groupId", deleteGroup);

module.exports = router;