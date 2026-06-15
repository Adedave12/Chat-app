import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const GroupsPage = () => {
  const user = useSelector((state) => state.user);

  return (
    <div className="justify-center items-center flex-col gap-4 md:gap-8 hidden lg:flex h-screen max-h-screen relative overflow-hidden p-4 md:p-8 bg-[#09090b]">
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-2xl w-full px-4"
      >
        {/* Animated Icon */}
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
          <div className="text-6xl md:text-8xl drop-shadow-2xl">👥</div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent leading-tight"
        >
          Groups Hub,
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
          Select a group from the sidebar or{" "}
          <span className="font-semibold text-zinc-200">create a new group</span> to chat with everyone
        </motion.p>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 md:mt-12 bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-4 md:p-6 text-left hover:bg-zinc-900 transition-colors inline-block"
        >
          <p className="text-xs md:text-sm text-zinc-400 font-medium">
            <span className="text-zinc-200">💡 Quick Tip:</span> Click the{" "}
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded text-zinc-300 font-semibold text-xs border border-zinc-700">
              + Create Group
            </span>{" "}
            button in the sidebar to start a new community!
          </p>
        </motion.div>
      </motion.div>

      {/* Floating Decorative Icons */}
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 360] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-24 right-24 text-7xl opacity-20 pointer-events-none"
      >
        🌟
      </motion.div>
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-24 left-24 text-6xl opacity-20 pointer-events-none"
      >
        ✨
      </motion.div>
    </div>
  );
};

export default GroupsPage;