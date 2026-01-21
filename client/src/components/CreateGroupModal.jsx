/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
import { IoClose, IoCamera, IoCheckmark } from "react-icons/io5";
import { FaSearch, FaUsers } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../helpers/api";
import uploadFile from "../helpers/uploadFile";
import Avatar from "./Avatar";

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
  const [step, setStep] = useState(1); // 1: Group details, 2: Add members
  const [loading, setLoading] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    groupIcon: "",
  });
  
  const [selectedMembers, setSelectedMembers] = useState([]);
  const fileInputRef = useRef();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle group icon upload
  const handleIconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingIcon(true);
      const uploadedIcon = await uploadFile(file);
      setGroupData((prev) => ({ ...prev, groupIcon: uploadedIcon.url }));
      toast.success("Icon uploaded!");
    } catch (error) {
      console.error("Icon upload error:", error);
      toast.error("Failed to upload icon");
    } finally {
      setUploadingIcon(false);
    }
  };

  // Search users
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await api.post("/api/search-user", { search: query });
      
      if (response.data.success) {
        // Filter out already selected members
        const filtered = response.data.data.filter(
          (user) => !selectedMembers.find((m) => m._id === user._id)
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  // Toggle member selection
  const toggleMember = (user) => {
    setSelectedMembers((prev) => {
      const exists = prev.find((m) => m._id === user._id);
      if (exists) {
        return prev.filter((m) => m._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  // Remove member
  const removeMember = (userId) => {
    setSelectedMembers((prev) => prev.filter((m) => m._id !== userId));
  };

  // Create group
  const handleCreateGroup = async () => {
    if (!groupData.name.trim()) {
      toast.error("Group name is required");
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error("Please add at least one member");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/groups/create", {
        name: groupData.name,
        description: groupData.description,
        groupIcon: groupData.groupIcon,
        members: selectedMembers.map((m) => m._id),
      });

      if (response.data.success) {
        toast.success("Group created successfully!");
        onGroupCreated(response.data.data);
      }
    } catch (error) {
      console.error("Create group error:", error);
      toast.error(error?.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {step === 1 ? "Create New Group" : "Add Members"}
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              {step === 1 ? "Set up your group details" : `${selectedMembers.length} member(s) selected`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <IoClose size={28} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              // Step 1: Group Details
              <motion.div
                key="step1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="space-y-6"
              >
                {/* Group Icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    {groupData.groupIcon ? (
                      <img
                        src={groupData.groupIcon}
                        alt="Group icon"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <FaUsers size={48} className="text-white" />
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingIcon}
                      className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      {uploadingIcon ? (
                        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                      ) : (
                        <IoCamera size={20} className="text-primary" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Group Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={groupData.name}
                    onChange={handleInputChange}
                    placeholder="Enter group name"
                    maxLength={50}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {groupData.name.length}/50 characters
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={groupData.description}
                    onChange={handleInputChange}
                    placeholder="What's this group about?"
                    rows="3"
                    maxLength={200}
                    className="input-field resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {groupData.description.length}/200 characters
                  </p>
                </div>
              </motion.div>
            ) : (
              // Step 2: Add Members
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-4"
              >
                {/* Search */}
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search users to add..."
                    className="input-field pl-12"
                  />
                </div>

                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Selected Members ({selectedMembers.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full pl-2 pr-3 py-1 shadow-sm"
                        >
                          <Avatar
                            imageUrl={member.profile_pic}
                            name={member.name}
                            userId={member._id}
                            width={24}
                            height={24}
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </span>
                          <button
                            onClick={() => removeMember(member._id)}
                            className="hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full p-1 transition-colors"
                          >
                            <IoClose size={16} className="text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                <div className="space-y-2">
                  {searching ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user) => {
                      const isSelected = selectedMembers.find((m) => m._id === user._id);
                      return (
                        <button
                          key={user._id}
                          onClick={() => toggleMember(user)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                            isSelected
                              ? "bg-primary/10 dark:bg-primary/20 border-2 border-primary"
                              : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent"
                          }`}
                        >
                          <Avatar
                            imageUrl={user.profile_pic}
                            name={user.name}
                            userId={user._id}
                            width={40}
                            height={40}
                          />
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="bg-primary text-white rounded-full p-1">
                              <IoCheckmark size={20} />
                            </div>
                          )}
                        </button>
                      );
                    })
                  ) : searchQuery ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No users found
                    </p>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      Search for users to add to your group
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-between gap-3">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="btn-secondary"
            >
              Back
            </button>
          )}
          
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            
            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                disabled={!groupData.name.trim()}
                className="btn-primary disabled:opacity-50"
              >
                Next: Add Members
              </button>
            ) : (
              <button
                onClick={handleCreateGroup}
                disabled={loading || selectedMembers.length === 0}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Group"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateGroupModal;