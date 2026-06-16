/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaAngleLeft, FaPlus, FaImage, FaVideo, FaInfoCircle } from "react-icons/fa";
import { IoMdSend, IoIosClose } from "react-icons/io";
import { HiDotsVertical } from "react-icons/hi";
import { motion } from "framer-motion";
import { toast } from "sonner";
import moment from "moment";
import Avatar from "../components/Avatar";
import uploadFile from "../helpers/uploadFile";

import api from "../helpers/api";

const GroupChatPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const socketConnection = useSelector((state) => state.user.socketConnection);
  
  const [groupData, setGroupData] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [message, setMessage] = useState({ text: "", imageUrl: "", videoUrl: "" });
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  const currentMessage = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [allMessages]);

  // Fetch group data
  useEffect(() => {
    if (!groupId) return;
    const fetchGroupData = async () => {
      try {
        const response = await api.get(`/api/groups/${groupId}`);
        if (response.data.success) {
          setGroupData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch group data:", error);
      }
    };
    fetchGroupData();
  }, [groupId]);

  // Socket setup
  useEffect(() => {
    if (!socketConnection || !groupId) return;

    console.log("🔌 Setting up group chat:", groupId);

    setLoading(true);

    // Join group room
    socketConnection.emit("join_group", groupId);

    // Request group messages
    socketConnection.emit("group_messages", groupId);
    
    // Mark messages as seen
    socketConnection.emit("group_seen", groupId);

    // Listen for group messages loaded
    const handleMessagesLoaded = (data) => {
      if (data.groupId === groupId) {
        console.log("📜 Group messages loaded:", data.messages.length);
        setAllMessages(data.messages);
        setLoading(false);
      }
    };

    // Listen for new group messages
    const handleNewMessage = (data) => {
      if (data.groupId === groupId) {
        console.log("📩 New group message received");
        setAllMessages((prev) => {
          const exists = prev.some((msg) => msg._id === data.message._id);
          if (exists) return prev;
          return [...prev, data.message];
        });
      }
    };

    // Listen for message sent confirmation
    const handleMessageSent = (data) => {
      if (data.groupId === groupId) {
        console.log("✅ Group message sent");
        setAllMessages((prev) => {
          const exists = prev.some((msg) => msg._id === data.message._id);
          if (exists) return prev;
          return [...prev, data.message];
        });
      }
    };

    // Listen for typing indicators
    const handleUserTyping = (data) => {
      if (data.groupId === groupId && data.userId !== user._id) {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            if (!prev.includes(data.userName)) {
              return [...prev, data.userName];
            }
          } else {
            return prev.filter((name) => name !== data.userName);
          }
          return prev;
        });
      }
    };

    // Listen for errors
    const handleError = (error) => {
      console.error("❌ Group error:", error);
      toast.error(error.message);
    };

    socketConnection.on("group_messages_loaded", handleMessagesLoaded);
    socketConnection.on("group_new_message", handleNewMessage);
    socketConnection.on("group_message_sent", handleMessageSent);
    socketConnection.on("group_user_typing", handleUserTyping);
    socketConnection.on("group_message_error", handleError);
    socketConnection.on("group_messages_error", handleError);

    return () => {
      console.log("🧹 Cleaning up group chat");
      socketConnection.emit("leave_group", groupId);
      socketConnection.off("group_messages_loaded", handleMessagesLoaded);
      socketConnection.off("group_new_message", handleNewMessage);
      socketConnection.off("group_message_sent", handleMessageSent);
      socketConnection.off("group_user_typing", handleUserTyping);
      socketConnection.off("group_message_error", handleError);
      socketConnection.off("group_messages_error", handleError);
    };
  }, [socketConnection, groupId, user._id]);

  // Handle typing
  const handleTyping = (e) => {
    const { value } = e.target;
    setMessage((prev) => ({ ...prev, text: value }));

    if (socketConnection && groupId) {
      if (typingTimeout) clearTimeout(typingTimeout);

      socketConnection.emit("group_typing", {
        groupId,
        isTyping: true,
      });

      const timeout = setTimeout(() => {
        socketConnection.emit("group_typing", {
          groupId,
          isTyping: false,
        });
      }, 1000);

      setTypingTimeout(timeout);
    }
  };

  // Upload handlers
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadPhoto = await uploadFile(file);
      setMessage((prev) => ({ ...prev, imageUrl: uploadPhoto.url, videoUrl: "" }));
      toast.success("Image uploaded!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      setOpenImageVideoUpload(false);
    }
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadVideo = await uploadFile(file);
      setMessage((prev) => ({ ...prev, videoUrl: uploadVideo.url, imageUrl: "" }));
      toast.success("Video uploaded!");
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload video");
    } finally {
      setIsUploading(false);
      setOpenImageVideoUpload(false);
    }
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!socketConnection) {
      toast.error("Not connected to server");
      return;
    }

    if (!message.text && !message.imageUrl && !message.videoUrl) {
      return;
    }

    const newMessage = {
      groupId,
      text: message.text,
      imageUrl: message.imageUrl,
      videoUrl: message.videoUrl,
    };

    socketConnection.emit("group_message", newMessage);

    setMessage({ text: "", imageUrl: "", videoUrl: "" });
  };

  return (
    <div className="h-screen flex flex-col bg-[#09090b]">
      {/* Header */}
      <header className="sticky top-0 h-16 bg-zinc-900/80 backdrop-blur-xl flex justify-between items-center px-4 shadow-md z-50 border-b border-zinc-800/50">
        <div className="flex items-center gap-4">
          <Link to="/groups" className="lg:hidden hover:text-emerald-400 transition-colors">
            <FaAngleLeft size={25} />
          </Link>
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/groups/${groupId}/info`)}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
              {groupData?.name?.[0]?.toUpperCase() || "G"}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-zinc-100">
                {groupData?.name || "Group"}
              </h3>
              <p className="text-sm text-zinc-400">
                {typingUsers.length > 0
                  ? `${typingUsers.join(", ")} typing...`
                  : `${groupData?.members?.length || 0} members`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/groups/${groupId}/info`)}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <FaInfoCircle size={22} className="text-zinc-400" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <HiDotsVertical size={22} className="text-zinc-400" />
            </button>

            {showOptionsMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 w-48 py-2 z-30"
              >
                <button
                  onClick={() => {
                    navigate(`/groups/${groupId}/info`);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-zinc-800 transition-colors text-zinc-300"
                >
                  Group Info
                </button>
                <button
                  onClick={() => {
                    toast("Exit group feature coming soon!");
                    setShowOptionsMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-zinc-800 transition-colors text-red-400"
                >
                  Exit Group
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <section 
        className="h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative"
        style={{
          backgroundImage: `url('/wallpaper.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none z-0"></div>
        
        <div className="flex flex-col gap-2 py-4 px-2 relative z-10" ref={currentMessage}>
          {loading ? (
            <div className="flex flex-col items-center justify-center mt-20">
              <div className="w-10 h-10 border-4 border-zinc-600 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-zinc-400 mt-4 text-sm animate-pulse">Loading messages...</p>
            </div>
          ) : allMessages.length === 0 ? (
            <div className="text-center text-zinc-500 mt-10">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Start the conversation! 👋</p>
            </div>
          ) : null}

          {allMessages.map((msg) => (
            <div
              key={msg._id}
              className={`
                p-3 rounded-2xl w-fit max-w-[280px] md:max-w-sm lg:max-w-md transition-all duration-300
                ${
                  user._id === (msg.msgByUserId?._id || msg.msgByUserId)
                    ? "ml-auto bg-emerald-600 text-white rounded-br-sm"
                    : "bg-zinc-800 text-zinc-100 rounded-bl-sm border border-zinc-700/50"
                }
              `}
            >
              {user._id !== (msg.msgByUserId?._id || msg.msgByUserId) && (
                <p className="text-xs font-semibold mb-1 text-emerald-400">
                  {msg.msgByUserId?.name || "Unknown User"}
                </p>
              )}
              
              <div className="w-full">
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    className="w-full h-full object-scale-down rounded-lg mb-2"
                    alt="Sent image"
                  />
                )}
                {msg.videoUrl && (
                  <video
                    src={msg.videoUrl}
                    className="w-full h-full object-scale-down rounded-lg mb-2"
                    controls
                    muted
                  />
                )}
              </div>
              
              {msg.text && <p className="px-1 break-words">{msg.text}</p>}
              
              <p className="text-xs mt-1 opacity-75 text-right">
                {moment(msg.createdAt).format("hh:mm A")}
              </p>
            </div>
          ))}
        </div>

        {/* Loading */}
        {isUploading && (
          <div className="w-full h-full bg-slate-700/60 backdrop-blur-sm flex justify-center items-center rounded overflow-hidden absolute top-0 left-0 z-10">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col items-center">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-primary mt-3 font-semibold">Uploading media...</p>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {message.imageUrl && (
          <div className="w-full sticky bottom-0 h-full bg-slate-700/60 backdrop-blur-sm flex justify-center items-center rounded overflow-hidden">
            <div
              className="absolute top-4 right-4 cursor-pointer hover:text-red-600 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg"
              onClick={() => setMessage((prev) => ({ ...prev, imageUrl: "" }))}
            >
              <IoIosClose size={30} />
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl">
              <img
                src={message.imageUrl}
                alt="upload preview"
                className="max-w-sm w-full h-auto rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Video Preview */}
        {message.videoUrl && (
          <div className="w-full sticky bottom-0 h-full bg-slate-700/60 backdrop-blur-sm flex justify-center items-center rounded overflow-hidden">
            <div
              className="absolute top-4 right-4 cursor-pointer hover:text-red-600 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg"
              onClick={() => setMessage((prev) => ({ ...prev, videoUrl: "" }))}
            >
              <IoIosClose size={30} />
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl">
              <video
                src={message.videoUrl}
                className="max-w-sm w-full h-auto rounded-lg"
                controls
                muted
              />
            </div>
          </div>
        )}
      </section>

      {/* Input Section */}
      <section className="h-16 bg-zinc-900/80 backdrop-blur-xl flex items-center px-4 border-t border-zinc-800/50 shadow-lg">
        <div className="relative">
          <button
            onClick={() => setOpenImageVideoUpload((prev) => !prev)}
            className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-zinc-800 transition-all text-zinc-400 hover:text-emerald-400"
          >
            <FaPlus size={18} />
          </button>

          {openImageVideoUpload && (
            <div className="bg-zinc-900 shadow-2xl rounded-xl absolute bottom-14 w-40 p-2 z-20 border border-zinc-800">
              <label
                htmlFor="uploadImage"
                className="flex items-center px-3 py-2 gap-3 hover:bg-zinc-800 cursor-pointer rounded-lg transition-all"
              >
                <FaImage className="text-emerald-400" size={18} />
                <p className="text-zinc-300">Image</p>
              </label>
              <label
                htmlFor="uploadVideo"
                className="flex items-center px-3 py-2 gap-3 hover:bg-zinc-800 cursor-pointer rounded-lg transition-all"
              >
                <FaVideo className="text-purple-400" size={18} />
                <p className="text-zinc-300">Video</p>
              </label>
              <input
                type="file"
                id="uploadImage"
                accept="image/*"
                onChange={handleUploadImage}
                className="hidden"
              />
              <input
                type="file"
                id="uploadVideo"
                accept="video/*"
                onChange={handleUploadVideo}
                className="hidden"
              />
            </div>
          )}
        </div>

        <form className="h-full w-full flex gap-2 items-center" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full bg-zinc-800 text-zinc-100 placeholder-zinc-500 outline-none focus:ring-1 focus:ring-emerald-500 transition-all border border-zinc-700"
            value={message.text}
            onChange={handleTyping}
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 transition-colors flex items-center justify-center disabled:opacity-50"
            disabled={!message.text && !message.imageUrl && !message.videoUrl}
          >
            <IoMdSend size={20} className="ml-1" />
          </button>
        </form>
      </section>
    </div>
  );
};

export default GroupChatPage;