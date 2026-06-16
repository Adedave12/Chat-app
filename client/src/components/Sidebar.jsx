import "react";
import { 
  HiMiniChatBubbleOvalLeftEllipsis, 
  HiEllipsisVertical 
} from "react-icons/hi2";
import { FaUserPlus, FaUsers, FaCog } from "react-icons/fa";
import { MdArchive } from "react-icons/md";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import api from "../helpers/api";
import Avatar from "./Avatar";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { FiArrowUpLeft, FiDownload } from "react-icons/fi";
import SearchUser from "./SearchUser";
import { FaImage, FaVideo } from "react-icons/fa6";
import InstallModal from "./InstallModal";
import CreateGroupModal from "./CreateGroupModal";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Sidebar = () => {
  const user = useSelector((state) => state?.user);
  const navigate = useNavigate();
  const [allUser, setAllUser] = useState([]);
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const location = useLocation();
  const isGroupsMode = location.pathname.startsWith('/groups');
  // True when user is at the root sidebar (no chat open) — used to refresh group counts on mobile back-navigation
  const isAtBasePath = location.pathname === '/' || location.pathname === '/groups';
  const [allGroups, setAllGroups] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );

  const handleInstallClick = () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        window.deferredPrompt = null;
      });
    } else {
      setShowInstallModal(true);
    }
  };

  useEffect(() => {
    if (isGroupsMode) {
      const fetchGroups = async () => {
        try {
          const response = await api.get("/api/groups");
          if (response.data.success) {
            setAllGroups(response.data.data);
          }
        } catch (error) {
          console.error("Fetch groups error:", error);
        }
      };
      
      // Always fetch when entering groups mode; also refresh when user navigates back to sidebar root
      if (isAtBasePath || allGroups.length === 0) {
        fetchGroups();
      }
      
      if (socketConnection) {
        const handleGroupSeenCleared = (clearedGroupId) => {
          setAllGroups((prev) => 
            prev.map(group => 
              group._id === clearedGroupId 
                ? { ...group, unseenMsg: 0 } 
                : group
            )
          );
        };
        socketConnection.on("group_seen_cleared", handleGroupSeenCleared);
        
        return () => {
          socketConnection.off("group_seen_cleared", handleGroupSeenCleared);
        };
      }
    }
  }, [isGroupsMode, socketConnection, isAtBasePath]);

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
          setAllUser(conversationUserData.filter(conv => !conv.isArchived));
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
    <div className="w-full h-full grid grid-cols-[64px,1fr] bg-zinc-900 shadow-lg">
      {/* Left Icon Bar */}
      <div className="bg-zinc-900 w-16 h-full py-5 flex flex-col justify-between items-center border-r border-zinc-800/50">
        <div className="space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `w-12 h-12 cursor-pointer flex justify-center items-center rounded-xl transition-all duration-300 ${
                isActive && !isGroupsMode
                  ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`
            }
            title="Chats"
          >
            <HiMiniChatBubbleOvalLeftEllipsis size={22} />
          </NavLink>

          <NavLink
            to="/groups"
            className={({ isActive }) =>
              `w-12 h-12 cursor-pointer flex justify-center items-center rounded-xl transition-all duration-300 ${
                isActive || isGroupsMode
                  ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`
            }
            title="Groups"
          >
            <FaUsers size={20} />
          </NavLink>

          <NavLink
            to="/archived"
            className="w-12 h-12 cursor-pointer flex justify-center items-center rounded-xl text-zinc-400 hover:bg-zinc-800 transition-all duration-300"
            title="Archived Chats"
          >
            <MdArchive size={20} />
          </NavLink>

          {/* We don't have a BlockedPage yet, so just use a toast or nav if it existed */}
          <button
            onClick={() => toast("Blocked users feature coming soon!")}
            className="w-12 h-12 cursor-pointer flex justify-center items-center rounded-xl text-zinc-400 hover:bg-zinc-800 transition-all duration-300"
            title="Blocked Users"
          >
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0 0 114.6 0 256s114.6 256 256 256zM116.4 395.6C82 358 64 308.2 64 256c0-106 86-192 192-192 52.2 0 102 18 139.6 52.4l-279.2 279.2zM395.6 116.4C430 154 448 203.8 448 256c0 106-86 192-192 192-52.2 0-102-18-139.6-52.4l279.2-279.2z"></path></svg>
          </button>

          <div
            onClick={() => isGroupsMode ? setShowCreateGroup(true) : setOpenSearchUser(true)}
            className="w-12 h-12 cursor-pointer flex justify-center items-center rounded-xl text-zinc-400 hover:bg-zinc-800 transition-all duration-300"
            title={isGroupsMode ? "Create Group" : "Add Friends"}
          >
            <FaUserPlus size={20} />
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `w-12 h-12 cursor-pointer flex justify-center items-center rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`
            }
            title="Settings"
          >
            <FaCog size={20} />
          </NavLink>

          {/* Clickable Avatar - Navigate to Profile */}
          <button
            onClick={() => navigate("/profile")}
            className="w-12 h-12 hover:ring-2 hover:ring-indigo-500 rounded-full transition-all duration-300"
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
          
          {/* Install App Button */}
          <button
            onClick={handleInstallClick}
            className="w-12 h-12 flex justify-center items-center rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.3)] mt-2"
            title="Install App"
          >
            <FiDownload size={20} />
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="w-full bg-[#09090b]">
        {/* Header with 3-dot menu (VISIBLE ON MOBILE, HIDDEN ON DESKTOP) */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800/50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            {isGroupsMode ? "Groups" : "Messages"}
          </h2>

          {/* 3-Dot Menu - Only visible on mobile (hidden on lg screens) */}
          <div className="lg:hidden relative sidebar-options-menu">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              title="Options"
            >
              <HiEllipsisVertical size={22} className="text-zinc-300" />
            </button>

            {/* Options Dropdown */}
            {showOptionsMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 bg-zinc-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-zinc-800 w-56 py-2 z-30"
              >
                <button
                  onClick={() => handleMenuOption("sort")}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-800/80 transition-colors flex items-center gap-3 text-zinc-300"
                >
                  <span className="text-lg">↕️</span>
                  <div>
                    <p className="font-semibold text-zinc-100">Sort Conversations</p>
                    <p className="text-xs text-zinc-500">By date or unread</p>
                  </div>
                </button>
                
                <button
                  onClick={() => handleMenuOption("filter")}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-800/80 transition-colors flex items-center gap-3 text-zinc-300"
                >
                  <span className="text-lg">🔍</span>
                  <div>
                    <p className="font-semibold text-zinc-100">Filter Chats</p>
                    <p className="text-xs text-zinc-500">By groups or tags</p>
                  </div>
                </button>
                
                <button
                  onClick={() => handleMenuOption("search")}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-800/80 transition-colors flex items-center gap-3 text-zinc-300"
                >
                  <span className="text-lg">💬</span>
                  <div>
                    <p className="font-semibold text-zinc-100">Search Messages</p>
                    <p className="text-xs text-zinc-500">Find in all chats</p>
                  </div>
                </button>

                <div className="border-t border-zinc-800 my-2"></div>
                
                <button
                  onClick={() => handleMenuOption("archive")}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-800/80 transition-colors flex items-center gap-3 text-zinc-300"
                >
                  <span className="text-lg">📁</span>
                  <div>
                    <p className="font-semibold text-zinc-100">Archived Chats</p>
                    <p className="text-xs text-zinc-500">View hidden chats</p>
                  </div>
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <div className="h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar">
          {!isGroupsMode && allUser.length === 0 && (
            <div className="mt-12">
              <div className="flex justify-center items-center my-4 text-zinc-600">
                <FiArrowUpLeft size={50} />
              </div>
              <div>
                <p className="text-lg text-center text-zinc-500 px-4">
                  Click <strong className="text-indigo-500">Add Friends</strong> to
                  start a conversation
                </p>
              </div>
            </div>
          )}

          {isGroupsMode && allGroups.length === 0 && (
            <div className="mt-12">
              <div className="flex justify-center items-center my-4 text-zinc-600">
                <FiArrowUpLeft size={50} />
              </div>
              <div>
                <p className="text-lg text-center text-zinc-500 px-4">
                  Click <strong className="text-indigo-500">Create Group</strong> to
                  start a group chat
                </p>
              </div>
            </div>
          )}

          {!isGroupsMode && allUser.map((conv) => {
            return (
              <NavLink
                to={"/" + conv?.userDetails?._id}
                key={conv?._id}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-4 px-4 border-l-4 transition-all duration-300 ${
                    isActive
                      ? "bg-zinc-800/50 border-indigo-500"
                      : "border-transparent hover:bg-zinc-800/30"
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
                  <h3 className="text-ellipsis line-clamp-1 font-semibold text-zinc-100">
                    {conv?.userDetails?.name}
                  </h3>

                  <div className="text-zinc-500 text-sm flex items-center gap-1">
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
                    <span className="bg-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {conv?.unseenMsg}
                    </span>
                  </div>
                )}
              </NavLink>
            );
          })}

          {isGroupsMode && allGroups.map((group) => {
            return (
              <NavLink
                to={"/groups/" + group?._id}
                key={group?._id}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-4 px-4 border-l-4 transition-all duration-300 ${
                    isActive
                      ? "bg-zinc-800/50 border-indigo-500"
                      : "border-transparent hover:bg-zinc-800/30"
                  }`
                }
              >
                <div className="relative">
                  {group.groupIcon ? (
                    <img
                      src={group.groupIcon}
                      alt={group.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <FaUsers size={20} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-ellipsis line-clamp-1 font-semibold text-zinc-100">
                    {group?.name}
                  </h3>
                  <div className="text-zinc-500 text-sm flex items-center gap-1">
                    <p className="text-ellipsis line-clamp-1 italic">
                      {group?.members?.length || 0} members
                    </p>
                  </div>
                </div>
                {Boolean(group?.unseenMsg) && (
                  <div className="flex-shrink-0">
                    <span className="bg-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {group?.unseenMsg}
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

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={(newGroup) => {
            setAllGroups((prev) => [newGroup, ...prev]);
            setShowCreateGroup(false);
          }}
        />
      )}

      {/* Install App Modal */}
      {showInstallModal && (
        <InstallModal onClose={() => setShowInstallModal(false)} />
      )}
    </div>
  );
};

export default Sidebar;