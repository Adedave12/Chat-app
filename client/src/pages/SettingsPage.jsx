import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoChevronForward } from "react-icons/io5";
import { BiSun, BiMoon, BiLogOut, BiLockAlt } from "react-icons/bi";
import { FaBell, FaShieldAlt, FaInfoCircle } from "react-icons/fa";
import { MdLanguage } from "react-icons/md";
import { useTheme } from "../context/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/userSlice";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const settingsMenu = [
    {
      id: "password",
      title: "Change Password",
      description: "Update your password",
      icon: <BiLockAlt size={24} />,
      path: "/settings/password",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: "theme",
      title: "Appearance",
      description: `${isDarkMode ? "Dark" : "Light"} mode active`,
      icon: isDarkMode ? <BiMoon size={24} /> : <BiSun size={24} />,
      path: "/settings/theme",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Manage notification preferences",
      icon: <FaBell size={22} />,
      path: "/settings/notifications",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      description: "Control your privacy settings",
      icon: <FaShieldAlt size={22} />,
      path: "/settings/privacy",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      id: "language",
      title: "Language",
      description: "English (US)",
      icon: <MdLanguage size={24} />,
      path: "/settings/language",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      id: "about",
      title: "About",
      description: "App version and information",
      icon: <FaInfoCircle size={22} />,
      path: "/settings/about",
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-50 dark:bg-gray-700/20",
    },
  ];

  const handleLogout = () => {
    const socketConnection = user.socketConnection;
    if (socketConnection) {
      socketConnection.disconnect();
    }

    dispatch(logout());
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <IoArrowBack size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Settings
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Settings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6"
        >
          {settingsMenu.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-4 p-4 transition-all duration-300
                hover:bg-gray-50 dark:hover:bg-gray-700/50
                ${index !== settingsMenu.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}
              `}
            >
              <div className={`p-3 rounded-xl ${item.bgColor} ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              <IoChevronForward 
                size={20} 
                className="text-gray-400 dark:text-gray-500" 
              />
            </motion.button>
          ))}
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Account Actions
          </h2>

          <button
            onClick={() => setShowLogoutDialog(true)}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-semibold"
          >
            <BiLogOut size={24} />
            Logout
          </button>
        </motion.div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Confirm Logout
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-semibold"
                onClick={() => setShowLogoutDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg font-semibold"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;