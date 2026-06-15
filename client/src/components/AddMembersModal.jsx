/* eslint-disable react/prop-types */
import { useState } from "react";
import { IoClose, IoCheckmark } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import api from "../helpers/api";
import Avatar from "./Avatar";

const AddMembersModal = ({ groupId, existingMembers, onClose, onMembersAdded }) => {
  const socketConnection = useSelector((state) => state.user.socketConnection);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

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
        // Filter out existing members
        const filtered = response.data.data.filter(
          (user) => !existingMembers.find((m) => m._id === user._id)
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

  // Add members to group
  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/api/groups/${groupId}/add-members`, {
        members: selectedMembers.map((m) => m._id),
      });

      if (response.data.success) {
        toast.success(`${selectedMembers.length} member(s) added successfully!`);
        
        // Notify via socket
        if (socketConnection) {
          selectedMembers.forEach((member) => {
            socketConnection.emit("group_member_update", {
              groupId,
              action: "added",
              updatedUserId: member._id,
            });
          });
        }
        
        onMembersAdded(response.data.data);
      }
    } catch (error) {
      console.error("Add members error:", error);
      toast.error(error?.response?.data?.message || "Failed to add members");
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
            <h2 className="text-2xl font-bold text-white">Add Members</h2>
            <p className="text-purple-100 text-sm mt-1">
              {selectedMembers.length} member(s) selected
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
          {/* Search */}
          <div className="relative mb-4">
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
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
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
                Search for users to add to the group
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleAddMembers}
            disabled={loading || selectedMembers.length === 0}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? "Adding..." : `Add ${selectedMembers.length} Member(s)`}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddMembersModal;