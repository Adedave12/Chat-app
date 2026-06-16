/* eslint-disable react/prop-types */
import "react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft, FaPlus, FaImage, FaVideo } from "react-icons/fa6";
import { IoCheckmarkDoneSharp, IoCheckmarkSharp } from "react-icons/io5";
import { IoMdSend, IoIosClose } from "react-icons/io";
import uploadFile from "../helpers/uploadFile";
import Loading from "./Loading";
import moment from "moment";
import { toast } from "sonner";
import api from "../helpers/api";
import { setToken, logout, toggleArchivedUser, toggleBlockedUser } from "../redux/userSlice";
import { useDispatch } from "react-redux";

const MessagePage = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const socketConnection = useSelector((state) => state?.user?.socketConnection);
  const user = useSelector((state) => state?.user);
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: "",
  });
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isBlockedLocal, setIsBlockedLocal] = useState(false);
  const [isArchivedLocal, setIsArchivedLocal] = useState(false);
  const currentMessage = useRef(null);

  useEffect(() => {
    if (user?.blockedUsers) {
      setIsBlockedLocal(user.blockedUsers.includes(params.userId));
    }
    if (user?.archivedUsers) {
      setIsArchivedLocal(user.archivedUsers.includes(params.userId));
    }
  }, [user, params.userId]);

  const toggleBlockUser = async () => {
    try {
      const response = await api.post("/api/toggle-block-user", { targetUserId: params.userId });
      if (response.data.success) {
        setIsBlockedLocal(response.data.isBlocked);
        dispatch(toggleBlockedUser(params.userId));
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to toggle block");
    }
    setShowOptionsMenu(false);
  };

  const toggleArchiveUser = async () => {
    try {
      const response = await api.post("/api/toggle-archive-user", { targetUserId: params.userId });
      if (response.data.success) {
        setIsArchivedLocal(response.data.isArchived);
        dispatch(toggleArchivedUser(params.userId));
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to toggle archive");
    }
    setShowOptionsMenu(false);
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [allMessage]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptionsMenu && !event.target.closest('.relative')) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptionsMenu]);

  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload((prev) => !prev);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadPhoto = await uploadFile(file);
      setMessage((prev) => ({
        ...prev,
        imageUrl: uploadPhoto.url,
        videoUrl: "",
      }));
      toast.success("Image uploaded!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      setOpenImageVideoUpload(false);
    }
  };

  const handleClearUploadImage = () => {
    setMessage((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleClearUploadVideo = () => {
    setMessage((prev) => ({ ...prev, videoUrl: "" }));
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadPhoto = await uploadFile(file);
      setMessage((prev) => ({
        ...prev,
        videoUrl: uploadPhoto.url,
        imageUrl: "",
      }));
      toast.success("Video uploaded!");
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload video");
    } finally {
      setIsUploading(false);
      setOpenImageVideoUpload(false);
    }
  };

  // Message Status Component
  const MessageStatus = ({ msg }) => {
    if (user._id !== msg.msgByUserId) {
      return null;
    }

    if (msg.seen) {
      return (
        <span className="text-sky-400 ml-1" title="Seen">
          <IoCheckmarkDoneSharp size={16} />
        </span>
      );
    } else if (msg.delivered) {
      return (
        <span className="text-gray-400 ml-1" title="Delivered">
          <IoCheckmarkDoneSharp size={16} />
        </span>
      );
    } else {
      return (
        <span className="text-gray-400 ml-1" title="Sent">
          <IoCheckmarkSharp size={16} />
        </span>
      );
    }
  };

  // Socket event handlers
  useEffect(() => {
    if (!socketConnection) {
      console.log("❌ NO SOCKET CONNECTION");
      return;
    }

    if (!params.userId) {
      console.log("❌ NO USER ID");
      return;
    }

    console.log("\n🔌 SETTING UP MESSAGE PAGE");
    console.log("Current user:", user._id);
    console.log("Chat with:", params.userId);

    setLoading(true);

    // Small delay to ensure socket is ready
    const setupTimeout = setTimeout(() => {
      socketConnection.emit("message-page", params.userId);
      socketConnection.emit("mark_as_delivered", params.userId);
      socketConnection.emit("seen", params.userId);
    }, 100);

    // Listen for user details
    const handleMessageUser = (data) => {
      console.log("👤 GOT USER DATA:", data);
      if (data) {
        setDataUser(data);
      }
    };

    // Listen for message history
    const handleMessages = (data) => {
      console.log("📜 GOT MESSAGES:", Array.isArray(data) ? data.length : 0);
      if (Array.isArray(data)) {
        setAllMessage(data);
      } else {
        setAllMessage([]);
      }
      setLoading(false);
    };

    // Listen for new incoming message
    const handleReceiveMessage = (newMessage) => {
      console.log("📩 RECEIVED MESSAGE:", newMessage);
      setAllMessage((prev) => {
        // Check if message already exists
        const exists = prev.some(msg => msg._id === newMessage._id);
        if (exists) {
          console.log("⚠️ Message already exists, skipping");
          return prev;
        }
        return [...prev, newMessage];
      });

      // Mark as seen
      socketConnection.emit("seen", newMessage.msgByUserId);
    };

    // Listen for sent message confirmation
    const handleMessageSent = (sentMessage) => {
      console.log("✅ MESSAGE SENT CONFIRMED:", sentMessage);
      setAllMessage((prev) => {
        // Check if message already exists
        const exists = prev.some(msg => msg._id === sentMessage._id);
        if (exists) {
          console.log("⚠️ Message already exists, skipping");
          return prev;
        }
        return [...prev, sentMessage];
      });
    };

    // Listen for delivery status
    const handleMessagesDelivered = () => {
      console.log("📬 MESSAGES DELIVERED");
      setAllMessage((prev) =>
        prev.map((msg) =>
          msg.msgByUserId === user._id ? { ...msg, delivered: true } : msg
        )
      );
    };

    // Listen for seen status
    const handleMessagesSeen = () => {
      console.log("👁️ MESSAGES SEEN");
      setAllMessage((prev) =>
        prev.map((msg) =>
          msg.msgByUserId === user._id ? { ...msg, seen: true } : msg
        )
      );
    };

    // Listen for errors
    const handleMessageError = (error) => {
      console.error("❌ MESSAGE ERROR:", error);
      toast.error(error.message || "Failed to send message");
    };

    // Listen for typing indicator
    const handleUserTyping = (data) => {
      console.log("⌨️ FRONTEND: User typing received:", data);
      if (data.senderId === params.userId) {
        console.log("✅ Setting typing to:", data.isTyping);
        setIsTyping(data.isTyping);
        
        // Auto-hide typing after 3 seconds
        if (data.isTyping) {
          setTimeout(() => {
            console.log("⏰ Auto-hiding typing indicator");
            setIsTyping(false);
          }, 3000);
        }
      } else {
        console.log("❌ Typing from different user:", data.senderId, "vs", params.userId);
      }
    };

    // Attach event listeners
    socketConnection.on("message-user", handleMessageUser);
    socketConnection.on("message", handleMessages);
    socketConnection.on("receive_message", handleReceiveMessage);
    socketConnection.on("message_sent", handleMessageSent);
    socketConnection.on("messages_delivered", handleMessagesDelivered);
    socketConnection.on("messages_seen_by", handleMessagesSeen);
    socketConnection.on("message_error", handleMessageError);
    socketConnection.on("user_typing", handleUserTyping);

    // Cleanup
    return () => {
      console.log("🧹 CLEANING UP MESSAGE PAGE");
      clearTimeout(setupTimeout);
      if (typingTimeout) clearTimeout(typingTimeout);
      socketConnection.off("message-user", handleMessageUser);
      socketConnection.off("message", handleMessages);
      socketConnection.off("receive_message", handleReceiveMessage);
      socketConnection.off("message_sent", handleMessageSent);
      socketConnection.off("messages_delivered", handleMessagesDelivered);
      socketConnection.off("messages_seen_by", handleMessagesSeen);
      socketConnection.off("message_error", handleMessageError);
      socketConnection.off("user_typing", handleUserTyping);
    };
  }, [socketConnection, params.userId, user._id]);

  const handleOnchange = (e) => {
    const { value } = e.target;
    setMessage((prev) => ({ ...prev, text: value }));

    // Send typing indicator
    if (socketConnection && params.userId) {
      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Emit typing start
      socketConnection.emit("typing", {
        sender: user._id,
        receiver: params.userId,
        isTyping: true,
      });

      // Set timeout to stop typing after 1 second of no input
      const timeout = setTimeout(() => {
        socketConnection.emit("typing", {
          sender: user._id,
          receiver: params.userId,
          isTyping: false,
        });
      }, 1000);

      setTypingTimeout(timeout);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!socketConnection) {
      console.log("❌ NO SOCKET - Can't send message");
      toast.error("Not connected to server. Please refresh.");
      return;
    }

    if (!message.text && !message.imageUrl && !message.videoUrl) {
      console.log("❌ EMPTY MESSAGE");
      return;
    }

    console.log("\n📤 SENDING MESSAGE");
    console.log("From:", user._id);
    console.log("To:", params.userId);
    console.log("Text:", message.text);

    const newMessage = {
      sender: user._id,
      receiver: params.userId,
      text: message.text,
      imageUrl: message.imageUrl,
      videoUrl: message.videoUrl,
      msgByUserId: user._id,
      createdAt: new Date().toISOString(),
    };

    socketConnection.emit("new message", newMessage);

    // Clear input
    setMessage({
      text: "",
      imageUrl: "",
      videoUrl: "",
    });
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#09090b]">
      {/* Header */}
      <header className="sticky top-0 h-16 bg-zinc-900/80 backdrop-blur-xl flex justify-between items-center px-4 shadow-md z-50 border-b border-zinc-800/50">
        <div className="flex items-center gap-4">
          <Link to={"/"} className="lg:hidden hover:text-primary transition-colors" title="Go back">
            <FaAngleLeft size={25} />
          </Link>
          <div>
            <Avatar
              width={48}
              height={48}
              imageUrl={dataUser?.profile_pic}
              name={dataUser?.name}
              userId={dataUser?._id}
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-zinc-100">
              {dataUser?.name || "Loading..."}
            </h3>
            <p className="text-sm">
              {isTyping ? (
                <span className="text-primary font-medium flex items-center gap-1 animate-pulse">
                  <span>typing</span>
                  <span className="flex gap-1">
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                  </span>
                </span>
              ) : user.onlineUser.includes(params.userId) ? (
                <span className="text-green-500 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                  online
                </span>
              ) : (
                <span className="text-slate-400">
                  {dataUser.updatedAt ? `last seen ${moment(dataUser.updatedAt).fromNow()}` : "offline"}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="cursor-pointer hover:text-indigo-400 transition-colors p-2 hover:bg-zinc-800 rounded-full text-zinc-400"
            title="Options"
          >
            <HiDotsVertical size={22} />
          </button>

          {/* Options Menu */}
          {showOptionsMenu && (
            <div className="absolute right-0 top-12 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-48 py-2 z-20">
              <button
                onClick={toggleArchiveUser}
                className="w-full px-4 py-2 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3 text-zinc-300"
              >
                <span className="text-lg">📁</span>
                {isArchivedLocal ? "Unarchive Chat" : "Archive Chat"}
              </button>
              <button
                onClick={toggleBlockUser}
                className="w-full px-4 py-2 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3 text-red-400"
              >
                <span className="text-lg">🚫</span>
                {isBlockedLocal ? "Unblock User" : "Block User"}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Messages Section */}
      <section 
        className="h-[calc(100dvh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative"
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
          ) : allMessage.length === 0 ? (
            <div className="text-center text-zinc-500 mt-10">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Start the conversation! 👋</p>
            </div>
          ) : null}

          {allMessage.map((msg, index) => {
            return (
              <div
                key={msg._id || index}
                className={`
                  p-3 rounded-2xl w-fit max-w-[280px] md:max-w-sm lg:max-w-md transition-all duration-300
                  ${
                    user._id === msg.msgByUserId
                      ? "ml-auto bg-emerald-600 text-white rounded-br-sm"
                      : "bg-zinc-800 text-zinc-100 rounded-bl-sm border border-zinc-700/50"
                  }
                `}
              >
                <div className="w-full">
                  {msg?.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      className="w-full h-full object-scale-down rounded-lg mb-2"
                      alt="Sent image"
                    />
                  )}
                  {msg?.videoUrl && (
                    <video
                      src={msg.videoUrl}
                      className="w-full h-full object-scale-down rounded-lg mb-2"
                      controls
                      muted
                    />
                  )}
                </div>
                {msg.text && <p className="px-1 break-words">{msg.text}</p>}
                <div className="flex items-center justify-end gap-1 px-1 text-xs mt-1 opacity-75">
                  <span>
                    {msg.createdAt ? moment(msg.createdAt).format("hh:mm A") : ""}
                  </span>
                  <MessageStatus msg={msg} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading */}
        {isUploading && (
          <div className="w-full h-full bg-slate-700/60 backdrop-blur-sm flex justify-center items-center rounded overflow-hidden absolute top-0 left-0 z-10">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col items-center">
              <Loading />
              <p className="text-primary mt-3 font-semibold">Uploading media...</p>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {message.imageUrl && (
          <div className="w-full sticky bottom-0 h-full bg-slate-700/60 backdrop-blur-sm flex justify-center items-center rounded overflow-hidden">
            <div
              className="absolute top-4 right-4 cursor-pointer hover:text-red-600 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg"
              onClick={handleClearUploadImage}
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
              onClick={handleClearUploadVideo}
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

      {/* Send Message Section */}
      <section className="h-16 bg-zinc-900/80 backdrop-blur-xl flex items-center px-4 border-t border-zinc-800/50 shadow-lg">
        {isBlockedLocal ? (
          <div className="w-full text-center text-gray-500 font-medium py-2">
            You have blocked this user. Unblock them to send messages.
          </div>
        ) : (
          <>
            <div className="relative">
              <button
                onClick={handleUploadImageVideoOpen}
                className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-zinc-800 transition-all text-zinc-400 hover:text-indigo-400"
              >
                <FaPlus title="Add Image/Video" size={18} />
              </button>

              {openImageVideoUpload && (
                <div className="bg-zinc-900 shadow-2xl rounded-xl absolute bottom-14 w-40 p-2 z-20 border border-zinc-800">
                  <form>
                    <label
                      htmlFor="uploadImage"
                      className="flex items-center px-3 py-2 gap-3 hover:bg-zinc-800 cursor-pointer rounded-lg transition-all"
                    >
                      <div className="text-indigo-400">
                        <FaImage size={18} />
                      </div>
                      <p className="text-zinc-300">Image</p>
                    </label>
                    <label
                      htmlFor="uploadVideo"
                      className="flex items-center px-3 py-2 gap-3 hover:bg-zinc-800 cursor-pointer rounded-lg transition-all"
                    >
                      <div className="text-purple-400">
                        <FaVideo size={18} />
                      </div>
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
                  </form>
                </div>
              )}
            </div>

            <form className="h-full w-full flex gap-2 items-center" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Message..."
                className="flex-1 px-4 py-2 rounded-full bg-zinc-800 text-zinc-100 placeholder-zinc-500 outline-none focus:ring-1 focus:ring-indigo-500 transition-all border border-zinc-700"
                value={message.text}
                onChange={handleOnchange}
              />
              <button
                type="submit"
                title="Send"
                className="w-10 h-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center justify-center disabled:opacity-50"
                disabled={!message.text && !message.imageUrl && !message.videoUrl}
              >
                <IoMdSend size={20} className="ml-1" />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
};

export default MessagePage;