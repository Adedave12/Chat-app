import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "sonner"; // Changed from sonner
import { toast } from "sonner"; // Changed from sonner
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

    // Audio Unlock for Mobile Browsers
    const unlockAudio = () => {
      if (!window.audioUnlocked) {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0;
        audio.play().then(() => {
          window.audioUnlocked = true;
          audio.pause();
        }).catch(() => {});
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('click', unlockAudio);
      }
    };
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('click', unlockAudio);

    // PWA Install Prompt Handler
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      window.dispatchEvent(new Event('pwa-prompt-ready'));
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
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

    // Handle global notification sound
    socketConnection.on("receive_message", (newMessage) => {
      if (newMessage.msgByUserId !== user._id) {
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(err => console.log('Audio play failed:', err));
        } catch {
          console.log('Notification sound not available');
        }
      }
    });

    // Handle global notification sound for groups
    socketConnection.on("group_new_message", (data) => {
      if (data.message && data.message.msgByUserId && data.message.msgByUserId._id !== user._id) {
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(err => console.log('Audio play failed:', err));
        } catch {
          console.log('Notification sound not available');
        }
      }
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
      <div className="min-h-screen bg-transparent transition-colors duration-300">
        {/* Sonner Toast - Modern & Beautiful */}
        <Toaster
          position="top-left"
          richColors
          expand={true}
          closeButton
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(24, 24, 27, 0.8)', // Zinc 900
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.05)'
            },
            className: 'my-toast-class font-outfit'
          }}
        />
        <Outlet />
      </div>
    </ThemeProvider>
  );
};

export default App;