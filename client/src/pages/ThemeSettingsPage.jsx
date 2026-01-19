import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { BiSun, BiMoon } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";

const ThemeSettingsPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/settings")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <IoArrowBack size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Appearance
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Theme Settings
          </h2>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <BiMoon size={24} className="text-purple-600 dark:text-purple-400" />
              ) : (
                <BiSun size={24} className="text-yellow-500" />
              )}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {isDarkMode ? "Dark Mode" : "Light Mode"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${isDarkMode ? 'bg-purple-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ThemeSettingsPage;