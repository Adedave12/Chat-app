import "react";
import { HiMiniChatBubbleOvalLeftEllipsis } from "react-icons/hi2";
import { FaUserPlus, FaUsers } from "react-icons/fa";
import { MdArchive } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { BiLogOut, BiSun, BiMoon } from "react-icons/bi";
import Avatar from "./Avatar";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import EditUserDetails from "./EditUserDetails";
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from "./SearchUser";
import { FaImage, FaVideo } from "react-icons/fa6";
import { useTheme } from "../context/ThemeContext";

const Sidebar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const user = useSelector((state) => state?.user);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [allUser, setAllUser] = useState([]);
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (socketConnection && user && user._id) {
      socketConnection.emit("sidebar", user._id);
      socketConnection.on("conversation", (data) => {
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
  }, [socketConnection, user]);

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    if (socketConnection) {
      socketConnection.disconnect();
    }

    dispatch({ type: "LOGOUT_USER" });

    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    navigate("/login");

    setLogoutConfirmOpen(false);
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
          <button
            className="w-12 h-12"
            title={user?.name}
            onClick={() => setEditUserOpen(true)}
          >
            <Avatar
              width={48}
              height={48}
              name={user?.name}
              imageUrl={user?.profile_pic}
              userId={user?._id}
            />
          </button>

          <button
            className="w-12 h-12 cursor-pointer flex justify-center items-center rounded-xl text-gray-600 dark:text-gray-400 hover:bg-primary/20 dark:hover:bg-gray-700 transition-all duration-300"
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
            onClick={toggleTheme}
          >
            {isDarkMode ? <BiSun size={20} /> : <BiMoon size={20} />}
          </button>

          <button
            className="w-12 h-12 cursor-pointer flex justify-center items-center rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition-all duration-300"
            title="Logout"
            onClick={handleLogout}
          >
            <BiLogOut size={20} />
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="w-full bg-gray-50 dark:bg-gray-800">
        <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Messages
          </h2>
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

      {/* Edit User Details Modal */}
      {editUserOpen && (
        <EditUserDetails onClose={() => setEditUserOpen(false)} user={user} />
      )}

      {/* Search User Modal */}
      {openSearchUser && (
        <SearchUser onClose={() => setOpenSearchUser(false)} />
      )}

      {/* Logout Confirmation Dialog */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Confirm Logout
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-semibold"
                onClick={() => setLogoutConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg font-semibold"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;