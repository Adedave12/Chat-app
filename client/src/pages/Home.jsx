import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout, setUser } from "../redux/userSlice";
import { HiDotsVertical } from "react-icons/hi";
import Sidebar from "../components/Sidebar";
import api from "../helpers/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
const Home = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get("/api/user-details");

      if (response.data.data.logout) {
        dispatch(logout());
        navigate("/login");
        return;
      }

      dispatch(setUser(response.data.data));
    } catch (error) {
      console.error("Error fetching user details:", error);
      if (error.response?.status === 401) {
        dispatch(logout());
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptionsMenu && !event.target.closest('.home-options-menu')) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptionsMenu]);

  const basePath = location.pathname === "/";

  const handleMenuOption = (option) => {
    setShowOptionsMenu(false);
    
    switch(option) {
      case "sort":
        toast.info("Sort feature coming soon!");
        break;
      case "filter":
        toast.info("Filter by groups feature coming soon!");
        break;
      case "search":
        toast.info("Search messages feature coming soon!");
        break;
      case "archive":
        navigate("/archived");
        break;
      default:
        break;
    }
  };

  return (
    <div className="grid lg:grid-cols-[320px,1fr] h-screen max-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-black">
      <section className={`${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      <section className={`${basePath && "hidden"}`}>
        <Outlet />
      </section>

      {/* Beautiful Welcome Screen - MOBILE FRIENDLY */}
      <div
        className={`flex justify-center items-center flex-col gap-4 md:gap-8 ${
          !basePath ? "hidden" : "flex"
        } relative overflow-hidden p-4 md:p-8`}
      >
        {/* Options Menu Button - Top Right */}
        <div className="absolute top-4 right-4 z-20 home-options-menu">
          <button
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
            title="Options"
          >
            <HiDotsVertical size={22} className="text-gray-700 dark:text-gray-300" />
          </button>

          {/* Options Dropdown */}
          {showOptionsMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-14 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-56 py-2 z-30"
            >
              <button
                onClick={() => handleMenuOption("sort")}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
              >
                <span className="text-lg">↕️</span>
                <div>
                  <p className="font-semibold">Sort Conversations</p>
                  <p className="text-xs text-gray-500">By date or unread</p>
                </div>
              </button>
              
              <button
                onClick={() => handleMenuOption("filter")}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
              >
                <span className="text-lg">🔍</span>
                <div>
                  <p className="font-semibold">Filter Chats</p>
                  <p className="text-xs text-gray-500">By groups or tags</p>
                </div>
              </button>
              
              <button
                onClick={() => handleMenuOption("search")}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
              >
                <span className="text-lg">💬</span>
                <div>
                  <p className="font-semibold">Search Messages</p>
                  <p className="text-xs text-gray-500">Find in all chats</p>
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
                  <p className="text-xs text-gray-500">View hidden chats</p>
                </div>
              </button>
            </motion.div>
          )}
        </div>

        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
          <motion.div
            animate={{
              x: [0, 50, 0],
              y: [0, -100, 0],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-2xl w-full px-4"
        >
          {/* Animated Chat Icon */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mb-4 md:mb-8"
          >
            <div className="text-6xl md:text-9xl drop-shadow-2xl">💬</div>
          </motion.div>

          {/* Title with Gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent leading-tight"
          >
            Welcome Back,
            <br />
            <span className="text-2xl md:text-4xl lg:text-5xl">{user.name}! 👋</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-8 leading-relaxed"
          >
            Select a conversation from the sidebar or{" "}
            <span className="font-semibold text-primary">add a friend</span> to start chatting
          </motion.p>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-8 md:mt-12"
          >
            {/* Online Users */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {user.onlineUser?.length || 0}
                </span>
              </div>
              <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                Users Online
              </p>
            </div>

            {/* Messages Icon */}
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-4 md:p-6 shadow-xl">
              <div className="text-4xl md:text-5xl mb-2">💌</div>
              <p className="text-xs md:text-sm font-semibold text-white">
                Start Chatting
              </p>
            </div>

            {/* Secure Icon */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-4xl md:text-5xl mb-2">🔒</div>
              <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                End-to-End Secure
              </p>
            </div>
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 md:mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 md:p-6"
          >
            <p className="text-xs md:text-sm text-blue-800 dark:text-blue-200 font-medium">
              💡 <strong>Quick Tip:</strong> Click the{" "}
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 rounded text-primary font-semibold text-xs">
                + Add Friends
              </span>{" "}
              button to find users and start new conversations!
            </p>
          </motion.div>
        </motion.div>

        {/* Floating Decorative Icons - Hidden on mobile */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="hidden lg:block absolute top-24 right-24 text-7xl opacity-20 pointer-events-none"
        >
          📱
        </motion.div>
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="hidden lg:block absolute bottom-24 left-24 text-6xl opacity-20 pointer-events-none"
        >
          ✨
        </motion.div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="hidden lg:block absolute top-1/2 right-12 text-5xl opacity-20 pointer-events-none"
        >
          💫
        </motion.div>
      </div>
    </div>
  );
};

export default Home;