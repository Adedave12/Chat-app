import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout, setUser } from "../redux/userSlice";
import { HiDotsVertical } from "react-icons/hi";
import Sidebar from "../components/Sidebar";
import api from "../helpers/api";
import { motion } from "framer-motion";
import { toast } from "sonner";

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

  const basePath = location.pathname === "/" || location.pathname === "/groups";

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
    <div className="grid lg:grid-cols-[320px,1fr] h-screen max-h-screen bg-transparent">
      {/* Sidebar - ALWAYS VISIBLE on mobile when basePath, hidden on desktop unless basePath */}
      <section className={`${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      {/* Message/Other Pages */}
      <section className={`${basePath && "hidden"}`}>
        <Outlet />
      </section>

      {/* Beautiful Welcome Screen - HIDDEN ON MOBILE, VISIBLE ON DESKTOP */}
      <div
        className={`justify-center items-center flex-col gap-4 md:gap-8 ${
          !basePath ? "hidden" : "hidden lg:flex"
        } relative overflow-hidden p-4 md:p-8 bg-[#09090b]`}
      >
        {/* Options Menu Button - ONLY VISIBLE ON DESKTOP (lg and above) */}
        <div className="absolute top-4 right-4 z-20 home-options-menu">
          <button
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="p-3 bg-zinc-900/50 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-zinc-800 border border-zinc-800/50 backdrop-blur-md"
            title="Options"
          >
            <HiDotsVertical size={22} className="text-zinc-300" />
          </button>

          {/* Options Dropdown */}
          {showOptionsMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-14 bg-zinc-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-zinc-800 w-56 py-2 z-30"
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
            <div className="text-6xl md:text-8xl drop-shadow-2xl">⚡</div>
          </motion.div>

          {/* Title with Gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent leading-tight"
          >
            Welcome Back,
            <br />
            <span className="text-2xl md:text-4xl lg:text-5xl">{user.name}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base md:text-xl text-zinc-400 mb-6 md:mb-8 leading-relaxed font-light"
          >
            Select a conversation from the sidebar or{" "}
            <span className="font-semibold text-zinc-200">add a friend</span> to start chatting
          </motion.p>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-8 md:mt-12"
          >
            {/* Online Users */}
            <div className="bg-zinc-900/50 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-zinc-800/50 hover:bg-zinc-900 transition-colors">
              <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                <span className="text-2xl md:text-3xl font-bold text-zinc-100">
                  {user.onlineUser?.length || 0}
                </span>
              </div>
              <p className="text-xs md:text-sm font-medium text-zinc-500">
                Users Online
              </p>
            </div>

            {/* Messages Icon */}
            <div className="bg-zinc-800 rounded-2xl p-4 md:p-6 border border-zinc-700/50 flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl mb-2 text-zinc-300">💬</div>
              <p className="text-xs md:text-sm font-semibold text-zinc-300">
                Start Chatting
              </p>
            </div>

            {/* Secure Icon */}
            <div className="bg-zinc-900/50 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-zinc-800/50 hover:bg-zinc-900 transition-colors flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl mb-2 text-zinc-300">🔒</div>
              <p className="text-xs md:text-sm font-medium text-zinc-500">
                End-to-End Secure
              </p>
            </div>
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 md:mt-12 bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-4 md:p-6 text-left hover:bg-zinc-900 transition-colors"
          >
            <p className="text-xs md:text-sm text-zinc-400 font-medium">
              <span className="text-zinc-200">💡 Quick Tip:</span> Click the{" "}
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded text-zinc-300 font-semibold text-xs border border-zinc-700">
                + Add Friends
              </span>{" "}
              button to find users and start new conversations!
            </p>
          </motion.div>
        </motion.div>

        {/* Floating Decorative Icons */}
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
          className="absolute top-24 right-24 text-7xl opacity-20 pointer-events-none"
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
          className="absolute bottom-24 left-24 text-6xl opacity-20 pointer-events-none"
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
          className="absolute top-1/2 right-12 text-5xl opacity-20 pointer-events-none"
        >
          💫
        </motion.div>
      </div>
    </div>
  );
};

export default Home;