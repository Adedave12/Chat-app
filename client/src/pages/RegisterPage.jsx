/* eslint-disable no-unused-vars */
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import uploadFile from "../helpers/uploadFile";
import axios from "axios";
import { toast } from "react-toastify";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";

const RegisterPage = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: "",
  });
  const [uploadPhoto, setUploadPhoto] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];

    setLoading(true);
    try {
      const uploadPhoto = await uploadFile(file);
      setUploadPhoto(file);
      setData((prev) => ({
        ...prev,
        profile_pic: uploadPhoto?.url,
      }));
      toast.success("Photo uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  const handleClearUploadPhoto = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setUploadPhoto(null);
    setData((prev) => ({
      ...prev,
      profile_pic: "",
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/register`;

    setLoading(true);

    try {
      const response = await axios.post(URL, data);

      if (response.data.success) {
        toast.success(response.data.message);
        setData({
          name: "",
          email: "",
          password: "",
          profile_pic: "",
        });
        setUploadPhoto("");
        
        // Navigate to OTP verification
        navigate("/verify-otp", {
          state: { userId: response.data.userId },
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-8 text-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">💬</h1>
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
              <p className="text-purple-100 mt-2">Join us and start chatting!</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  className="input-field"
                  value={data.name}
                  onChange={handleOnChange}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  className="input-field"
                  value={data.email}
                  onChange={handleOnChange}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Create a password (min 6 characters)"
                    className="input-field pr-12"
                    value={data.password}
                    onChange={handleOnChange}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Profile Picture (Optional)
                </label>
                <label
                  htmlFor="profile_pic"
                  className="cursor-pointer block"
                >
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-primary transition-colors text-center">
                    {uploadPhoto?.name ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {uploadPhoto.name}
                        </span>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 ml-2"
                          onClick={handleClearUploadPhoto}
                        >
                          <IoClose size={24} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload profile picture
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </label>
                <input
                  type="file"
                  id="profile_pic"
                  name="profile_pic"
                  className="hidden"
                  onChange={handleUploadPhoto}
                  accept="image/*"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary-dark font-semibold transition-colors"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;