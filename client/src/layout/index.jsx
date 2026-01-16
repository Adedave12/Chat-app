/* eslint-disable react/prop-types */
import "react";
import { motion } from "framer-motion";

const AuthLayouts = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md"
      >
        <div className="container mx-auto px-4 py-4 flex justify-center items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <div className="text-4xl">💬</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Chat App
            </h1>
          </motion.div>
        </div>
      </motion.header>
      
      <main className="min-h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  );
};

export default AuthLayouts;