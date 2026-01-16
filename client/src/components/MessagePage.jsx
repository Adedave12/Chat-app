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
import backgroundImage from "../assets/wallapaper.jpeg";
import moment from "moment";
import { toast } from "react-toastify";

const MessagePage = () => {
  const params = useParams();
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
  const [isUploading, setIsUploading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const currentMessage = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [allMessage]);

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
        <span className="text-blue-500 ml-1" title="Seen">
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

    // Emit message-page event
    socketConnection.emit("message-page", params.userId);
    socketConnection.emit("mark_as_delivered", params.userId);
    socketConnection.emit("seen", params.userId);

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

    // Attach event listeners
    socketConnection.on("message-user", handleMessageUser);
    socketConnection.on("message", handleMessages);
    socketConnection.on("receive_message", handleReceiveMessage);
    socketConnection.on("message_sent", handleMessageSent);
    socketConnection.on("messages_delivered", handleMessagesDelivered);
    socketConnection.on("messages_seen_by", handleMessagesSeen);
    socketConnection.on("message_error", handleMessageError);

    // Cleanup
    return () => {
      console.log("🧹 CLEANING UP MESSAGE PAGE");
      socketConnection.off("message-user", handleMessageUser);
      socketConnection.off("message", handleMessages);
      socketConnection.off("receive_message", handleReceiveMessage);
      socketConnection.off("message_sent", handleMessageSent);
      socketConnection.off("messages_delivered", handleMessagesDelivered);
      socketConnection.off("messages_seen_by", handleMessagesSeen);
      socketConnection.off("message_error", handleMessageError);
    };
  }, [socketConnection, params.userId, user._id]);

  const handleOnchange = (e) => {
    const { value } = e.target;
    setMessage((prev) => ({ ...prev, text: value }));
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
    <div
      style={{ backgroundImage: `url(${backgroundImage})` }}
      className="bg-no-repeat bg-cover h-screen"
    >
      {/* Header */}
      <header className="sticky top-0 h-16 bg-white dark:bg-gray-800 flex justify-between items-center px-4 shadow-md z-10 border-b border-gray-200 dark:border-gray-700">
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
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {dataUser?.name || "Loading..."}
            </h3>
            <p className="text-sm">
              {dataUser.online ? (
                <span className="text-green-500 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  online
                </span>
              ) : (
                <span className="text-gray-400">offline</span>
              )}
            </p>
          </div>
        </div>
        <div>
          <button className="cursor-pointer hover:text-primary transition-colors" title="Options">
            <HiDotsVertical size={22} />
          </button>
        </div>
      </header>

      {/* Messages Section */}
      <section className="h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200/50 dark:bg-gray-900/50">
        <div className="flex flex-col gap-2 py-4 px-2" ref={currentMessage}>
          {allMessage.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Start the conversation! 👋</p>
            </div>
          )}

          {allMessage.map((msg, index) => {
            return (
              <div
                key={msg._id || index}
                className={`
                  p-3 rounded-2xl w-fit max-w-[280px] md:max-w-sm lg:max-w-md shadow-lg transition-all duration-300 hover:shadow-xl
                  ${
                    user._id === msg.msgByUserId
                      ? "ml-auto bg-gradient-to-r from-primary to-secondary text-white"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
      <section className="h-16 bg-white dark:bg-gray-800 flex items-center px-4 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="relative">
          <button
            onClick={handleUploadImageVideoOpen}
            className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-primary/20 dark:hover:bg-primary/30 transition-all text-gray-600 dark:text-gray-300 hover:text-primary"
          >
            <FaPlus title="Add Image/Video" size={18} />
          </button>

          {openImageVideoUpload && (
            <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl absolute bottom-14 w-40 p-2 z-20 border border-gray-200 dark:border-gray-700">
              <form>
                <label
                  htmlFor="uploadImage"
                  className="flex items-center px-3 py-2 gap-3 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer rounded-lg transition-all"
                >
                  <div className="text-primary">
                    <FaImage size={18} />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Image</p>
                </label>
                <label
                  htmlFor="uploadVideo"
                  className="flex items-center px-3 py-2 gap-3 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer rounded-lg transition-all"
                >
                  <div className="text-purple-600">
                    <FaVideo size={18} />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Video</p>
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
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all"
            value={message.text}
            onChange={handleOnchange}
          />
          <button
            type="submit"
            title="Send"
            className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary text-white hover:shadow-glow transition-all flex items-center justify-center"
          >
            <IoMdSend size={20} />
          </button>
        </form>
      </section>
    </div>
  );
};

export default MessagePage;