import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoArrowBack } from "react-icons/io5";
import { MdArchive } from "react-icons/md";
import { motion } from "framer-motion";
import Avatar from "../components/Avatar";
import { FaImage, FaVideo } from "react-icons/fa6";

const ArchivedPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const socketConnection = useSelector((state) => state?.user?.socketConnection);
  const [archivedChats, setArchivedChats] = useState([]);

  useEffect(() => {
    if (socketConnection && user && user._id) {
      // Re-use the sidebar socket event but filter for isArchived === true
      socketConnection.emit("sidebar", user._id);
      
      const handleConversation = (data) => {
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
          // Filter ONLY archived chats
          setArchivedChats(conversationUserData.filter(conv => conv.isArchived));
        }
      };

      socketConnection.on("conversation", handleConversation);

      return () => {
        socketConnection.off("conversation", handleConversation);
      };
    }
  }, [socketConnection, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <IoArrowBack size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
            <MdArchive /> Archived Chats
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {archivedChats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <MdArchive size={80} className="mx-auto text-gray-300 dark:text-gray-600 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No archived chats
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Conversations you archive will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {archivedChats.map((conv, index) => (
              <motion.div
                key={conv._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/${conv?.userDetails?._id}`)}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-gray-700 flex items-center gap-4"
              >
                <div className="relative">
                  <Avatar
                    imageUrl={conv?.userDetails?.profile_pic}
                    name={conv?.userDetails?.name}
                    userId={conv?.userDetails?._id}
                    width={56}
                    height={56}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                    {conv?.userDetails?.name}
                  </h3>
                  <div className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1 mt-1">
                    {conv?.lastMsg?.imageUrl && <FaImage />}
                    {conv?.lastMsg?.videoUrl && <FaVideo />}
                    <p className="truncate italic">
                      {conv?.lastMsg?.text || (conv?.lastMsg?.imageUrl ? "Image" : conv?.lastMsg?.videoUrl ? "Video" : "")}
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivedPage;
