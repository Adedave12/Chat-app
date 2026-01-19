import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaUser, FaEnvelope } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { MdInfo } from "react-icons/md";
import { useTheme } from "../context/ThemeContext";
import Avatar from "../components/Avatar";
import ConfirmationDialog from "../components/ConfirmationDialog";
import toast from "react-hot-toast";
import axios from "axios";
import uploadFile from "../helpers/uploadFile";
import { setUser } from "../redux/userSlice";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const user = useSelector((state) => state.user);
  useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    profile_pic: user?.profile_pic || "",
    bio: user?.bio || "",
  });
  
  const fileInputRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const uploadedPhoto = await uploadFile(file);
      setFormData((prev) => ({ ...prev, profile_pic: uploadedPhoto.url }));
      setHasChanges(true);
      toast.success("Photo uploaded successfully!");
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/update-user`;
    const token = sessionStorage.getItem("token");
    
    setLoading(true);

    try {
      const response = await axios.post(
        URL,
        {
          name: formData.name,
          profile_pic: formData.profile_pic,
          bio: formData.bio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        dispatch(setUser(response.data.data));
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setHasChanges(false);
        
        // Update local state to reflect changes
        setFormData({
          name: response.data.data.name,
          profile_pic: response.data.data.profile_pic,
          bio: response.data.data.bio || "",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleCancelEdit = () => {
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        setFormData({
          name: user?.name || "",
          profile_pic: user?.profile_pic || "",
          bio: user?.bio || "",
        });
        setIsEditing(false);
        setHasChanges(false);
      }
    } else {
      setIsEditing(false);
    }
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
            My Profile
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex flex-col items-center mb-8">
            {/* Profile Picture */}
            <div className="relative mb-4">
              <Avatar
                width={120}
                height={120}
                imageUrl={formData.profile_pic}
                name={formData.name}
                userId={user?._id}
              />
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 bg-primary hover:bg-primary-dark text-white p-3 rounded-full shadow-lg transition-all disabled:opacity-50"
                >
                  {uploadingPhoto ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <FaCamera size={20} />
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            {isEditing && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click camera icon to change photo
              </p>
            )}
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FaUser className="text-primary" />
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="input-field disabled:bg-gray-100 dark:disabled:bg-gray-700"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FaEnvelope className="text-primary" />
                Email
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="input-field disabled:bg-gray-100 dark:disabled:bg-gray-700 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <MdInfo className="text-primary" />
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows="3"
                maxLength="150"
                className="input-field disabled:bg-gray-100 dark:disabled:bg-gray-700 resize-none"
              />
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length}/150 characters
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary w-full"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={loading || !hasChanges}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Account Information
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">User ID:</span>
              <span className="font-mono text-gray-900 dark:text-white">{user?._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Member since:</span>
              <span className="text-gray-900 dark:text-white">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleSaveProfile}
        title="Confirm Profile Update"
        message="Are you sure you want to save these changes to your profile?"
      />
    </div>
  );
};

export default ProfilePage;