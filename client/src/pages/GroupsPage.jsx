/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoArrowBack, IoAddCircle } from "react-icons/io5";
import { FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../helpers/api";
import Avatar from "../components/Avatar";
import CreateGroupModal from "../components/CreateGroupModal";

const GroupsPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/groups");
      
      if (response.data.success) {
        setGroups(response.data.data);
      }
    } catch (error) {
      console.error("Fetch groups error:", error);
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [newGroup, ...prev]);
    setShowCreateModal(false);
    toast.success("Group created successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <IoArrowBack size={24} className="text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Groups
            </h1>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <IoAddCircle size={20} />
            <span className="hidden sm:inline">Create Group</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : groups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <FaUsers size={80} className="mx-auto text-gray-300 dark:text-gray-600 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No groups yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Create your first group to start chatting with multiple people
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <IoAddCircle size={20} className="inline mr-2" />
              Create Your First Group
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {groups.map((group, index) => (
              <motion.div
                key={group._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/groups/${group._id}`)}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all cursor-pointer border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-4">
                  {/* Group Icon */}
                  <div className="relative">
                    {group.groupIcon ? (
                      <img
                        src={group.groupIcon}
                        alt={group.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <FaUsers size={28} className="text-white" />
                      </div>
                    )}
                    
                    {/* Admin badge */}
                    {group.admin._id === user._id && (
                      <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
                        <span className="text-xs font-bold text-white">👑</span>
                      </div>
                    )}
                  </div>

                  {/* Group Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {group.description || "No description"}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{group.members.length} members</span>
                      {group.lastMessage && (
                        <span className="truncate">
                          Last message: {new Date(group.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Members Preview */}
                  <div className="hidden sm:flex items-center -space-x-2">
                    {group.members.slice(0, 3).map((member, idx) => (
                      <Avatar
                        key={member._id}
                        imageUrl={member.profile_pic}
                        name={member.name}
                        userId={member._id}
                        width={32}
                        height={32}
                      />
                    ))}
                    {group.members.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                        +{group.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}
    </div>
  );
};

export default GroupsPage;