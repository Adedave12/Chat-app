import "react";
import { 
  HiMiniChatBubbleOvalLeftEllipsis, 
  HiEllipsisVertical 
} from "react-icons/hi2";
import { FaUserPlus, FaUsers, FaCog } from "react-icons/fa";
import { MdArchive } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from "./SearchUser";
import { FaImage, FaVideo } from "react-icons/fa6";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Sidebar = () => {
  const user = useSelector((state) => state?.user);
  const navigate = useNavigate();
  const [allUser, setAllUser] = useState([]);
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );

  useEffect(() => {
    if (socketConnection && user && user._id) {
      console.log("📋 Requesting sidebar for user:", user._id);
      socketConnection.emit("sidebar", user._id);
      
      socketConnection.on("conversation", (data) => {
        console.log("📥 Received conversations:", data?.length || 0);
        if (Array.isArray(data)) {
          const conversationUserData = data.map((conversationUser) => {
            if (
              conversationUser?.sender?._id === conversationUser?.receiver?._id
            ) {
              return {
                ...conversationUser,
                userDetails: conversationUser?.sender,
              };
            } else if (conversationUser?.receiver._id !== user?._id) {
              return {
                ...conversationUser,
                userDetails: conversationUser?.receiver,
              };
            } else {
              return {
                ...conversationUser,
                userDetails: conversationUser.sender,
              };
            }
          });
          setAllUser(conversationUserData);
        } else {
          console.error("Expected array but received:", typeof data);
          setAllUser([]);
        }
      });
    }

    return () => {
      if (socketConnection) {
        socketConnection.off("conversation");
      }
    };
  }, [socketConnection, user, user?._id]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptionsMenu && !event.target.closest('.sidebar-options-menu')) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptionsMenu]);

  const handleMenuOption = (option) => {
    setShowOptionsMenu(false);
    
    switch(option) {
      case "sort":
        toast("Sort feature coming soon!");
        break;
      case "filter":
        toast("Filter by groups feature coming soon!");
        break;
      case "search":
        toast("Search messages feature coming soon!");
        break;
      case "archive":
        navigate("/archived");
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full h-full grid grid-cols-[64px,1fr] bg-white dark:bg-gray-900 shadow-lg">
      {/* Left Icon Bar */}
      <div className="bg-gradient-to-b from-primary/10 to-secondary/10 dark:from-gray-800 dark:to-gray-900 w-16 h-full py-5 flex flex-col justify-between items-center border-r border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `w-12 h-12 cursor-pointer flex justify-center items-center rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-primary text-white shadow-glow"
                  : "text-gray-600 dark:text-gray-400 hover:bg-primary/20 dark:hover:bg-gray-700"
              }`
            }
            title="Chats"
          >
            <HiMiniChatBubbleOvalLeftEllipsis size={22} />
          </NavLink>

          <div
            onClick={() => setOpenSearchUser(true)}
            className="w-12 h-12 cursor-pointer flex justify-center items-center rounded-xl text-gray-600 dark:text-gray-400 hover:bg-primary/20 dark:hover:bg-gray-700 transition-all duration-300"
            title="Add Friends"
          >
            <FaUserPlus size={20} />
          </div>

          <NavLink
            to="/groups"
            className="w-12 h-12 cursor-pointer flex justify-center items-center rounded-xl text-gray-600 dark:text-gray-400 hover:bg-primary/20 dark:hover:bg-gray-700 transition-all duration-300"
            title="Groups (Coming Soon)"
          >
            <FaUsers size={20} />
          </NavLink>

          <NavLink
            to="/archived"
            className="w-12 h-12 cursor-pointer flex justify-center items-center rounded-xl text-gray-600 dark:text-gray-400 hover:bg-primary/20 dark:hover:bg-gray-700 transition-all duration-300"
            title="Archived Chats"
          >
            <MdArchive size={20} />
          </NavLink>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `w-12 h-12 cursor-pointer flex justify-center items-center rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-primary text-white shadow-glow"
                  : "text-gray-600 dark:text-gray-400 hover:bg-primary/20 dark:hover:bg-gray-700"
              }`
            }
            title="Settings"
          >
            <FaCog size={20} />
          </NavLink>

          {/* Clickable Avatar - Navigate to Profile */}
          <button
            onClick={() => navigate("/profile")}
            className="w-12 h-12 hover:ring-2 hover:ring-primary rounded-full transition-all duration-300"
            title={`${user?.name} - View Profile`}
          >
            <Avatar
              width={48}
              height={48}
              name={user?.name}
              imageUrl={user?.profile_pic}
              userId={user?._id}
            />
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="w-full bg-gray-50 dark:bg-gray-800">
        {/* Header with 3-dot menu (VISIBLE ON MOBILE, HIDDEN ON DESKTOP) */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Messages
          </h2>

          {/* 3-Dot Menu - Only visible on mobile (hidden on lg screens) */}
          <div className="lg:hidden relative sidebar-options-menu">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Options"
            >
              <HiEllipsisVertical size={22} className="text-gray-700 dark:text-gray-300" />
            </button>

            {/* Options Dropdown */}
            {showOptionsMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-56 py-2 z-30"
              >
                <button
                  onClick={() => handleMenuOption("sort")}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <span className="text-lg">↕️</span>
                  <div>
                    <p className="font-semibold">Sort Conversations</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">By date or unread</p>
                  </div>
                </button>
                
                <button
                  onClick={() => handleMenuOption("filter")}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <span className="text-lg">🔍</span>
                  <div>
                    <p className="font-semibold">Filter Chats</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">By groups or tags</p>
                  </div>
                </button>
                
                <button
                  onClick={() => handleMenuOption("search")}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <span className="text-lg">💬</span>
                  <div>
                    <p className="font-semibold">Search Messages</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Find in all chats</p>
                  </div>
                </button>

                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                
                <button
                  onClick={() => handleMenuOption("archive")}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <span className="text-lg">📁</span>
                  <div>
                    <p className="font-semibold">Archived Chats</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">View hidden chats</p>
                  </div>
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <div className="h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar">
          {allUser.length === 0 && (
            <div className="mt-12">
              <div className="flex justify-center items-center my-4 text-gray-400">
                <FiArrowUpLeft size={50} />
              </div>
              <div>
                <p className="text-lg text-center text-gray-500 dark:text-gray-400 px-4">
                  Click <strong className="text-primary">Add Friends</strong> to
                  start a conversation
                </p>
              </div>
            </div>
          )}

          {allUser.map((conv) => {
            return (
              <NavLink
                to={"/" + conv?.userDetails?._id}
                key={conv?._id}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-4 px-4 border-l-4 transition-all duration-300 ${
                    isActive
                      ? "bg-primary/10 dark:bg-primary/20 border-primary"
                      : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                <div className="relative">
                  <Avatar
                    imageUrl={conv?.userDetails?.profile_pic}
                    name={conv?.userDetails?.name}
                    userId={conv?.userDetails?._id}
                    width={48}
                    height={48}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-ellipsis line-clamp-1 font-semibold text-gray-900 dark:text-gray-100">
                    {conv?.userDetails?.name}
                  </h3>

                  <div className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
                    <div>
                      {conv?.lastMsg?.imageUrl && (
                        <div className="flex items-center gap-1">
                          <FaImage />
                          {!conv?.lastMsg?.text && <span>Image</span>}
                        </div>
                      )}
                      {conv?.lastMsg?.videoUrl && (
                        <div className="flex items-center gap-1">
                          <FaVideo />
                          {!conv?.lastMsg?.text && <span>Video</span>}
                        </div>
                      )}
                    </div>
                    <p className="text-ellipsis line-clamp-1 italic">
                      {conv?.lastMsg?.text}
                    </p>
                  </div>
                </div>
                {Boolean(conv?.unseenMsg) && (
                  <div className="flex-shrink-0">
                    <span className="bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-glow">
                      {conv?.unseenMsg}
                    </span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Search User Modal */}
      {openSearchUser && (
        <SearchUser onClose={() => setOpenSearchUser(false)} />
      )}
    </div>
  );
};

export default Sidebar;