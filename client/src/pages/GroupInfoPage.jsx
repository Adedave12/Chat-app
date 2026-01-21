import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoArrowBack, IoCamera, IoTrash, IoExit, IoPersonAdd } from "react-icons/io5";
import { FaUsers, FaCrown, FaEdit } from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../helpers/api";
import uploadFile from "../helpers/uploadFile";
import Avatar from "../components/Avatar";
import ConfirmationDialog from "../components/ConfirmationDialog";
import AddMembersModal from "../components/AddMembersModal";

const GroupInfoPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const socketConnection = useSelector((state) => state.user.socketConnection);
  
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(null);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    groupIcon: "",
  });
  
  const fileInputRef = useRef();

  // Fetch group details
  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/groups/${groupId}`);
      
      if (response.data.success) {
        setGroupData(response.data.data);
        setFormData({
          name: response.data.data.name,
          description: response.data.data.description || "",
          groupIcon: response.data.data.groupIcon || "",
        });
      }
    } catch (error) {
      console.error("Fetch group error:", error);
      toast.error("Failed to load group details");
      navigate("/groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const isAdmin = groupData?.admin?._id === user._id;

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Upload group icon
  const handleIconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isAdmin) {
      toast.error("Only admin can change group icon");
      return;
    }

    try {
      setUploadingIcon(true);
      const uploadedIcon = await uploadFile(file);
      setFormData((prev) => ({ ...prev, groupIcon: uploadedIcon.url }));
      
      // Auto-save icon
      await handleSaveChanges({ groupIcon: uploadedIcon.url });
      toast.success("Group icon updated!");
    } catch (error) {
      console.error("Icon upload error:", error);
      toast.error("Failed to upload icon");
    } finally {
      setUploadingIcon(false);
    }
  };

  // Save group changes
  const handleSaveChanges = async (overrideData = null) => {
    if (!isAdmin) {
      toast.error("Only admin can edit group details");
      return;
    }

    try {
      const dataToSend = overrideData || formData;
      const response = await api.put(`/api/groups/${groupId}`, dataToSend);
      
      if (response.data.success) {
        setGroupData(response.data.data);
        setIsEditing(false);
        toast.success("Group updated successfully!");
      }
    } catch (error) {
      console.error("Update group error:", error);
      toast.error(error?.response?.data?.message || "Failed to update group");
    }
  };

  // Remove member
  const handleRemoveMember = async (memberId) => {
    if (!isAdmin) {
      toast.error("Only admin can remove members");
      return;
    }

    try {
      const response = await api.delete(`/api/groups/${groupId}/remove/${memberId}`);
      
      if (response.data.success) {
        setGroupData(response.data.data);
        toast.success("Member removed successfully!");
        
        // Notify via socket
        if (socketConnection) {
          socketConnection.emit("group_member_update", {
            groupId,
            action: "removed",
            updatedUserId: memberId,
          });
        }
      }
    } catch (error) {
      console.error("Remove member error:", error);
      toast.error(error?.response?.data?.message || "Failed to remove member");
    } finally {
      setShowRemoveMemberDialog(null);
    }
  };

  // Leave group
  const handleLeaveGroup = async () => {
    try {
      const response = await api.post(`/api/groups/${groupId}/leave`);
      
      if (response.data.success) {
        toast.success("You left the group");
        navigate("/groups");
      }
    } catch (error) {
      console.error("Leave group error:", error);
      toast.error(error?.response?.data?.message || "Failed to leave group");
    } finally {
      setShowLeaveDialog(false);
    }
  };

  // Delete group
  const handleDeleteGroup = async () => {
    if (!isAdmin) {
      toast.error("Only admin can delete group");
      return;
    }

    try {
      const response = await api.delete(`/api/groups/${groupId}`);
      
      if (response.data.success) {
        toast.success("Group deleted successfully!");
        navigate("/groups");
      }
    } catch (error) {
      console.error("Delete group error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete group");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  // Handle members added
  const handleMembersAdded = (updatedGroup) => {
    setGroupData(updatedGroup);
    setShowAddMembersModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(`/groups/${groupId}`)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <IoArrowBack size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Group Info
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Group Icon & Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              {formData.groupIcon ? (
                <img
                  src={formData.groupIcon}
                  alt={formData.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <FaUsers size={48} className="text-white" />
                </div>
              )}
              
              {isAdmin && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingIcon}
                  className="absolute bottom-0 right-0 bg-primary text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {uploadingIcon ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <IoCamera size={20} />
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleIconUpload}
                className="hidden"
              />
            </div>

            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-sm font-semibold mb-4">
                <FaCrown size={14} />
                Group Admin
              </span>
            )}
          </div>

          {/* Group Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Group Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing || !isAdmin}
                  className="input-field flex-1 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  maxLength={50}
                />
                {isAdmin && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary"
                  >
                    <FaEdit />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={!isEditing || !isAdmin}
                placeholder="Add a description..."
                rows="3"
                maxLength={200}
                className="input-field resize-none disabled:bg-gray-100 dark:disabled:bg-gray-700"
              />
            </div>

            {isEditing && isAdmin && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleSaveChanges()}
                  className="btn-primary flex-1"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: groupData.name,
                      description: groupData.description || "",
                      groupIcon: groupData.groupIcon || "",
                    });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Members Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Members ({groupData?.members?.length || 0})
            </h2>
            
            {isAdmin && (
              <button
                onClick={() => setShowAddMembersModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <IoPersonAdd size={20} />
                Add Members
              </button>
            )}
          </div>

          <div className="space-y-3">
            {groupData?.members?.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Avatar
                  imageUrl={member.profile_pic}
                  name={member.name}
                  userId={member._id}
                  width={48}
                  height={48}
                />
                
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {member.name}
                    {member._id === user._id && (
                      <span className="text-sm text-gray-500 ml-2">(You)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {member.email}
                  </p>
                </div>

                {member._id === groupData.admin._id && (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    <FaCrown size={20} />
                  </span>
                )}

                {isAdmin && member._id !== groupData.admin._id && (
                  <button
                    onClick={() => setShowRemoveMemberDialog(member)}
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"
                    title="Remove member"
                  >
                    <IoTrash size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Actions
          </h2>

          <div className="space-y-3">
            {!isAdmin && (
              <button
                onClick={() => setShowLeaveDialog(true)}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors font-semibold"
              >
                <IoExit size={24} />
                Leave Group
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-semibold"
              >
                <IoTrash size={24} />
                Delete Group
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Group Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteGroup}
        title="Delete Group"
        message="Are you sure you want to delete this group? This action cannot be undone and all messages will be lost."
      />

      {/* Leave Group Confirmation */}
      <ConfirmationDialog
        isOpen={showLeaveDialog}
        onClose={() => setShowLeaveDialog(false)}
        onConfirm={handleLeaveGroup}
        title="Leave Group"
        message="Are you sure you want to leave this group? You'll need to be re-added by an admin to join again."
      />

      {/* Remove Member Confirmation */}
      <ConfirmationDialog
        isOpen={!!showRemoveMemberDialog}
        onClose={() => setShowRemoveMemberDialog(null)}
        onConfirm={() => handleRemoveMember(showRemoveMemberDialog?._id)}
        title="Remove Member"
        message={`Are you sure you want to remove ${showRemoveMemberDialog?.name} from this group?`}
      />

      {/* Add Members Modal */}
      {showAddMembersModal && (
        <AddMembersModal
          groupId={groupId}
          existingMembers={groupData?.members || []}
          onClose={() => setShowAddMembersModal(false)}
          onMembersAdded={handleMembersAdded}
        />
      )}
    </div>
  );
};

export default GroupInfoPage;