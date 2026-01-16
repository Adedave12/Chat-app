/* eslint-disable react/prop-types */
import "react";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { useSelector } from "react-redux";
import { useMemo } from "react";

const Avatar = ({ userId, name, imageUrl, width, height }) => {
  const onlineUser = useSelector((state) => state?.user?.onlineUser);

  // Generate avatar initials from name
  const avatarName = useMemo(() => {
    if (!name) return "";
    const splitName = name.split(" ");
    if (splitName.length > 1) {
      return splitName[0][0] + splitName[1][0];
    } else {
      return splitName[0][0];
    }
  }, [name]);

  const bgColorIndex = useMemo(() => {
    if (!name) return 0;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash + name.charCodeAt(i)) % 9;
    }
    return hash;
  }, [name]);

  const bgColor = [
    "bg-slate-200 dark:bg-slate-700",
    "bg-purple-200 dark:bg-purple-700",
    "bg-red-200 dark:bg-red-700",
    "bg-green-200 dark:bg-green-700",
    "bg-yellow-200 dark:bg-yellow-700",
    "bg-pink-200 dark:bg-pink-700",
    "bg-cyan-200 dark:bg-cyan-700",
    "bg-blue-200 dark:bg-blue-700",
    "bg-indigo-200 dark:bg-indigo-700",
  ];

  const isOnline = onlineUser.includes(userId);

  // Common styling for the container
  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`,
  };

  return (
    <div
      className="relative"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div
        className="text-slate-800 dark:text-slate-200 rounded-full shadow-md flex justify-center items-center overflow-hidden border-2 border-white dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
        style={containerStyle}
      >
        {imageUrl ? (
          <div className="w-full h-full">
            <img
              src={imageUrl}
              alt={name || "User avatar"}
              className="w-full h-full object-cover"
              style={{
                minWidth: "100%",
                minHeight: "100%",
              }}
            />
          </div>
        ) : name ? (
          <div
            className={`w-full h-full flex justify-center items-center text-xl font-bold ${bgColor[bgColorIndex]}`}
          >
            {avatarName}
          </div>
        ) : (
          <HiOutlineUserCircle
            size={Math.min(width, height)}
            className="flex-shrink-0 text-gray-400 dark:text-gray-600"
          />
        )}
      </div>

      {/* Online Status Indicator - Green Dot */}
      {isOnline && (
        <div className="absolute bottom-0 right-0">
          <div
            className="bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"
            style={{
              width: `${Math.max(width * 0.25, 10)}px`,
              height: `${Math.max(height * 0.25, 10)}px`,
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Avatar;