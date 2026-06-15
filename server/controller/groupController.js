const GroupModel = require("../models/GroupModel");
const UserModel = require("../models/UserModel");
const { MessageModel } = require("../models/ConversationModel");

// Create a new group
async function createGroup(req, res) {
  try {
    const { name, description, groupIcon, members } = req.body;
    const adminId = req.userId; // From auth middleware

    if (!name) {
      return res.status(400).json({
        message: "Group name is required",
        error: true,
      });
    }

    if (!members || members.length === 0) {
      return res.status(400).json({
        message: "At least one member is required",
        error: true,
      });
    }

    // Add admin to members if not included
    const allMembers = members.includes(adminId) 
      ? members 
      : [adminId, ...members];

    const newGroup = new GroupModel({
      name,
      description: description || "",
      groupIcon: groupIcon || "",
      admin: adminId,
      members: allMembers,
    });

    await newGroup.save();

    // Populate group details
    const populatedGroup = await GroupModel.findById(newGroup._id)
      .populate("admin", "name email profile_pic")
      .populate("members", "name email profile_pic");

    return res.status(201).json({
      message: "Group created successfully",
      data: populatedGroup,
      success: true,
    });
  } catch (error) {
    console.error("Create group error:", error);
    return res.status(500).json({
      message: error.message || "Failed to create group",
      error: true,
    });
  }
}

// Get all groups for a user
async function getUserGroups(req, res) {
  try {
    const userId = req.userId;

    const groups = await GroupModel.find({
      members: userId,
      isActive: true,
    })
      .populate("admin", "name email profile_pic")
      .populate("members", "name email profile_pic")
      .populate({
        path: "lastMessage",
        populate: {
          path: "msgByUserId",
          select: "name profile_pic",
        },
      })
      .sort({ updatedAt: -1 });

    // Calculate unseen messages for each group
    const groupsWithUnseen = await Promise.all(groups.map(async (group) => {
      const unseenMsgCount = await MessageModel.countDocuments({
        groupId: group._id,
        msgByUserId: { $ne: userId },
        seen: false,
      });

      return {
        ...group.toObject(),
        unseenMsg: unseenMsgCount,
      };
    }));

    return res.status(200).json({
      message: "Groups fetched successfully",
      data: groupsWithUnseen,
      success: true,
    });
  } catch (error) {
    console.error("Get groups error:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch groups",
      error: true,
    });
  }
}

// Get single group details
async function getGroupDetails(req, res) {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    const group = await GroupModel.findById(groupId)
      .populate("admin", "name email profile_pic")
      .populate("members", "name email profile_pic");

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        error: true,
      });
    }

    // Check if user is a member
    if (!group.members.some((member) => member._id.toString() === userId)) {
      return res.status(403).json({
        message: "You are not a member of this group",
        error: true,
      });
    }

    return res.status(200).json({
      message: "Group details fetched successfully",
      data: group,
      success: true,
    });
  } catch (error) {
    console.error("Get group details error:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch group details",
      error: true,
    });
  }
}

// Update group (admin only)
async function updateGroup(req, res) {
  try {
    const { groupId } = req.params;
    const { name, description, groupIcon } = req.body;
    const userId = req.userId;

    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        error: true,
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId) {
      return res.status(403).json({
        message: "Only admin can update group details",
        error: true,
      });
    }

    // Update fields
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (groupIcon !== undefined) group.groupIcon = groupIcon;

    await group.save();

    const updatedGroup = await GroupModel.findById(groupId)
      .populate("admin", "name email profile_pic")
      .populate("members", "name email profile_pic");

    return res.status(200).json({
      message: "Group updated successfully",
      data: updatedGroup,
      success: true,
    });
  } catch (error) {
    console.error("Update group error:", error);
    return res.status(500).json({
      message: error.message || "Failed to update group",
      error: true,
    });
  }
}

// Add members to group (admin only)
async function addMembers(req, res) {
  try {
    const { groupId } = req.params;
    const { members } = req.body; // Array of user IDs
    const userId = req.userId;

    if (!members || members.length === 0) {
      return res.status(400).json({
        message: "Please provide members to add",
        error: true,
      });
    }

    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        error: true,
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId) {
      return res.status(403).json({
        message: "Only admin can add members",
        error: true,
      });
    }

    // Add only new members
    const newMembers = members.filter(
      (memberId) => !group.members.includes(memberId)
    );

    group.members.push(...newMembers);
    await group.save();

    const updatedGroup = await GroupModel.findById(groupId)
      .populate("admin", "name email profile_pic")
      .populate("members", "name email profile_pic");

    return res.status(200).json({
      message: `${newMembers.length} member(s) added successfully`,
      data: updatedGroup,
      success: true,
    });
  } catch (error) {
    console.error("Add members error:", error);
    return res.status(500).json({
      message: error.message || "Failed to add members",
      error: true,
    });
  }
}

// Remove member from group (admin only)
async function removeMember(req, res) {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.userId;

    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        error: true,
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId) {
      return res.status(403).json({
        message: "Only admin can remove members",
        error: true,
      });
    }

    // Can't remove admin
    if (memberId === userId) {
      return res.status(400).json({
        message: "Admin cannot be removed. Transfer admin rights or delete group.",
        error: true,
      });
    }

    group.members = group.members.filter(
      (member) => member.toString() !== memberId
    );
    await group.save();

    const updatedGroup = await GroupModel.findById(groupId)
      .populate("admin", "name email profile_pic")
      .populate("members", "name email profile_pic");

    return res.status(200).json({
      message: "Member removed successfully",
      data: updatedGroup,
      success: true,
    });
  } catch (error) {
    console.error("Remove member error:", error);
    return res.status(500).json({
      message: error.message || "Failed to remove member",
      error: true,
    });
  }
}

// Leave group (any member except admin)
async function leaveGroup(req, res) {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        error: true,
      });
    }

    // Admin can't leave, must delete or transfer
    if (group.admin.toString() === userId) {
      return res.status(400).json({
        message: "Admin cannot leave the group. Transfer admin rights or delete group.",
        error: true,
      });
    }

    group.members = group.members.filter(
      (member) => member.toString() !== userId
    );
    await group.save();

    return res.status(200).json({
      message: "You left the group successfully",
      success: true,
    });
  } catch (error) {
    console.error("Leave group error:", error);
    return res.status(500).json({
      message: error.message || "Failed to leave group",
      error: true,
    });
  }
}

// Delete group (admin only)
async function deleteGroup(req, res) {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        error: true,
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId) {
      return res.status(403).json({
        message: "Only admin can delete the group",
        error: true,
      });
    }

    // Soft delete
    group.isActive = false;
    await group.save();

    return res.status(200).json({
      message: "Group deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Delete group error:", error);
    return res.status(500).json({
      message: error.message || "Failed to delete group",
      error: true,
    });
  }
}

module.exports = {
  createGroup,
  getUserGroups,
  getGroupDetails,
  updateGroup,
  addMembers,
  removeMember,
  leaveGroup,
  deleteGroup,
};