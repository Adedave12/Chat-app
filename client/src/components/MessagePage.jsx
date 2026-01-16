/* eslint-disable react/prop-types */
import "react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft, FaPlus, FaImage, FaVideo } from "react-icons/fa6";
import { IoCheckmarkDoneSharp, IoCheckmarkSharp, IoIosClose } from "react-icons/io5";
import { IoMdSend } from "react-icons/io";
import uploadFile from "../helpers/uploadFile";
import Loading from "./Loading";
import backgroundImage from "../assets/wallapaper.jpeg";
import moment from "moment";

const MessagePage = () => {
  const params = useParams();
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
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

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behaviour: "smooth",
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
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
      setOpenImageVideoUpload(false);
    }
  };

  const handleClearUploadImage = () => {
    setMessage((prev) => ({
      ...prev,
      imageUrl: "",
    }));
  };

  const handleClearUploadVideo = () => {
    setMessage((prev) => ({
      ...prev,
      videoUrl: "",
    }));
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
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setIsUploading(false);
      setOpenImageVideoUpload(false);
    }
  };

  // Render message status indicators
  const MessageStatus = ({ msg }) => {
    // Only show status for messages sent by the current user
    if (user._id !== msg.msgByUserId) {
      return null;
    }

    if (msg.seen) {
      // Blue double tick for seen messages
      return (
        <span className="text-blue-500 ml-1" title="Seen">
          <IoCheckmarkDoneSharp size={16} />
        </span>
      );
    } else if (msg.delivered) {
      // Gray double tick for delivered messages
      return (
        <span className="text-gray-400 ml-1" title="Delivered">
          <IoCheckmarkDoneSharp size={16} />
        </span>
      );
    } else {
      // Single tick for sent messages
      return (
        <span className="text-gray-400 ml-1" title="Sent">
          <IoCheckmarkSharp size={16} />
        </span>
      );
    }
  };

  useEffect(() => {
    if (socketConnection) {
      // Join the message room for this conversation
      socketConnection.emit("message-page", params.userId);
      socketConnection.emit("mark_as_delivered", params.userId);
      socketConnection.emit("seen", params.userId);

      // Get user data of the conversation partner
      socketConnection.on("message-user", (data) => {
        setDataUser(data);
      });

      // Load initial message history
      socketConnection.on("message", (data) => {
        console.log("message data", data);
        setAllMessage(data);
      });

      // Listen for new incoming messages
      socketConnection.on("receive_message", (newMessage) => {
        console.log("Received new message:", newMessage);
        setAllMessage((prevMessages) => [...prevMessages, newMessage]);

        // Mark received message as seen immediately since we're in the chat
        socketConnection.emit("seen", newMessage.msgByUserId);
      });

      // Handle sent message confirmation
      socketConnection.on("message_sent", (sentMessage) => {
        console.log("Message sent confirmation:", sentMessage);
        setAllMessage((prevMessages) => [...prevMessages, sentMessage]);
      });

      // Listen for messages being delivered
      socketConnection.on("messages_delivered", (data) => {
        console.log("Messages delivered:", data);
        setAllMessage((prevMessages) =>
          prevMessages.map((msg) =>
            msg.msgByUserId === user._id ? { ...msg, delivered: true } : msg
          )
        );
      });

      // Listen for messages being seen
      socketConnection.on("messages_seen_by", (data) => {
        console.log("Messages seen:", data);
        setAllMessage((prevMessages) =>
          prevMessages.map((msg) =>
            msg.msgByUserId === user._id ? { ...msg, seen: true } : msg
          )
        );
      });
    }

    return () => {
      if (socketConnection) {
        socketConnection.off("message-user");
        socketConnection.off("message");
        socketConnection.off("receive_message");
        socketConnection.off("message_sent");
        socketConnection.off("messages_delivered");
        socketConnection.off("messages_seen_by");
      }
    };
  }, [socketConnection, params?.userId, user]);

  const handleOnchange = (e) => {
    const { value } = e.target;

    setMessage((preve) => {
      return {
        ...preve,
        text: value,
      };
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (message.text || message.imageUrl || message.videoUrl) {
      if (socketConnection) {
        const newMessage = {
          sender: user?._id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user?._id,
          createdAt: new Date().toISOString(),
        };

        socketConnection.emit("new message", newMessage);

        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: "",
        });
      }
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${backgroundImage})` }}
      className="bg-no-repeat bg-cover h-screen"
    >
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
              {dataUser?.name}
            </h3>
            <p className="text-sm">
              {dataUser.online ? (
                <span className="text-green-500 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
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
        <div className="flex flex-col gap-2 py-2 mx-2" ref={currentMessage}>
          {allMessage.map((msg, index) => {
            return (
              <div
                key={index}
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
                      src={msg?.imageUrl}
                      className="w-full h-full object-scale-down rounded-lg mb-2"
                      alt="Sent image"
                    />
                  )}
                  {msg?.videoUrl && (
                    <video
                      src={msg?.videoUrl}
                      className="w-full h-full object-scale-down rounded-lg mb-2"
                      controls
                      muted
                      autoPlay
                    />
                  )}
                </div>
                {msg.text && <p className="px-1 break-words">{msg.text}</p>}
                <div className="flex items-center justify-end gap-1 px-1 text-xs mt-1 opacity-75">
                  <span>
                    {msg.createdAt
                      ? moment(msg.createdAt).format("hh:mm A")
                      : ""}
                  </span>
                  <MessageStatus msg={msg} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading indicator */}
        {isUploading && (
          <div className="w-full h-full bg-slate-700/60 backdrop-blur-sm flex justify-center items-center rounded overflow-hidden absolute top-0 left-0 z-10">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col items-center">
              <Loading />
              <p className="text-primary mt-3 font-semibold">Uploading media...</p>
            </div>
          </div>
        )}

        {/* Upload image display */}
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

        {/* Upload video display */}
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
                autoPlay
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

          {/* Upload menu */}
          {openImageVideoUpload && (
            <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl absolute bottom-14 w-40 p-2 z-20 border border-gray-200 dark:border-gray-700">
              <form>
                <label
                  htmlFor="uploadImage"
                  className="flex items-center px-3 py-2 gap-3 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer rounded-lg transition-all"
                  title="Upload Image"
                >
                  <div className="text-primary">
                    <FaImage size={18} />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Image</p>
                </label>
                <label
                  htmlFor="uploadVideo"
                  className="flex items-center px-3 py-2 gap-3 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer rounded-lg transition-all"
                  title="Upload Video"
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

        {/* Input box */}
        <form
          className="h-full w-full flex gap-2 items-center"
          onSubmit={handleSendMessage}
        >
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