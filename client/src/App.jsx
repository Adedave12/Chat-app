import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast"; // Changed from sonner
import toast from "react-hot-toast"; // Changed from sonner
import { Outlet, useNavigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { setToken, setOnlineUser, setSocketConnection, logout } from "./redux/userSlice";
import AOS from "aos";
import "aos/dist/aos.css";
import io from "socket.io-client";

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-cubic",
    });

    // Check for existing token
    const token = sessionStorage.getItem("token");
    if (token) {
      dispatch(setToken(token));
    }
  }, [dispatch]);

  // Socket Connection - MOVED HERE FROM Home.jsx
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token || !user._id) {
      console.log("❌ No token or user - skipping socket");
      return;
    }

    // Check if already connected
    if (user.socketConnection?.connected) {
      console.log("✅ Socket already connected");
      return;
    }

    console.log("🔌 Connecting to socket...");

    const socketConnection = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
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
    });

    // Handle disconnection
    socketConnection.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
    });

    // Cleanup ONLY on unmount or logout
    return () => {
      console.log("🔌 Cleaning up socket connection");
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, [dispatch, navigate, user._id]); // Only reconnect when user changes

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* React Hot Toast - Modern & Beautiful */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            // Default duration
            duration: 3000,
            
            // Default style - modern glass effect
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#1f2937',
              padding: '16px 24px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            },
            
            // Success toast
            success: {
              duration: 3000,
              style: {
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            
            // Error toast
            error: {
              duration: 4000,
              style: {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#fff',
                boxShadow: '0 10px 40px rgba(239, 68, 68, 0.3)',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
            
            // Loading toast
            loading: {
              style: {
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#fff',
                boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#3b82f6',
              },
            },
          }}
        />
        <Outlet />
      </div>
    </ThemeProvider>
  );
};

export default App;