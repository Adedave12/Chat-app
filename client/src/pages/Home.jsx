import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  logout,
  setOnlineUser,
  setSocketConnection,
  setUser,
} from "../redux/userSlice";
import Sidebar from "../components/Sidebar";
import io from "socket.io-client";
import api from "../helpers/api";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const Home = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Socket Connection with better error handling
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.log("❌ No token found");
      return;
    }

    console.log("🔌 Connecting to socket...");

    const socketConnection = io(import.meta.env.VITE_BACKEND_URL, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"], // Add both transports
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection successful
    socketConnection.on("connect", () => {
      console.log("✅ Socket connected:", socketConnection.id);
      dispatch(setSocketConnection(socketConnection));
    });

    // Handle online users
    socketConnection.on("onlineUser", (data) => {
      console.log("👥 Online users received:", data);
      dispatch(setOnlineUser(data));
    });

    // Handle auth errors
    socketConnection.on("auth_error", (data) => {
      console.error("❌ Auth error:", data.message);
      toast.error(data.message);
      dispatch(logout());
      navigate("/login");
    });

    // Handle connection errors
    socketConnection.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      toast.error("Failed to connect to server. Please refresh.");
    });

    // Handle disconnection
    socketConnection.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
    });

    // Cleanup on unmount
    return () => {
      console.log("🔌 Cleaning up socket connection");
      socketConnection.disconnect();
    };
  }, [dispatch, navigate]);

  const basePath = location.pathname === "/";

  return (
    <div className="grid lg:grid-cols-[320px,1fr] h-screen max-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-black">
      <section className={`${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      <section className={`${basePath && "hidden"}`}>
        <Outlet />
      </section>

      {/* Welcome Screen */}
      <div
        className={`justify-center items-center flex-col gap-6 ${
          !basePath ? "hidden" : "lg:flex"
        } relative overflow-hidden`}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: "4s" }}></div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mb-6"
          >
            <div className="text-8xl mb-4">💬</div>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Welcome to Chat App
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Select a conversation from the sidebar to start chatting with your
            friends
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                {user.onlineUser?.length || 0} users online
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Icons */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-32 right-32 text-6xl opacity-10"
        >
          📱
        </motion.div>
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-32 left-32 text-5xl opacity-10"
        >
          ✨
        </motion.div>
      </div>
    </div>
  );
};

export default Home;