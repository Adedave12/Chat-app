import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { motion } from "framer-motion";

const RegisterPage = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('aos').then(AOS => {
        AOS.init({
          duration: 1000,
          once: true,
        });
      });
    }
  }, []);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.name || !data.email || !data.password) {
      toast.error("Please fill all fields");
      return;
    }

    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/register`;

    setLoading(true);

    try {
      console.log("Registering user:", data);
      
      const response = await axios.post(URL, {
        name: data.name,
        email: data.email,
        password: data.password,
        profile_pic: "", // Empty profile pic
      });

      console.log("Registration response:", response.data);

      if (response.data.success) {
        toast.success(response.data.message);
        setData({
          name: "",
          email: "",
          password: "",
        });
        
        // Navigate to OTP verification
        navigate("/verify-otp", {
          state: { userId: response.data.userId },
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          data-aos="fade-up"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <h1 className="text-4xl font-bold text-white mb-2">💬</h1>
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
              <p className="text-purple-100 mt-2">Join us and start chatting!</p>
            </motion.div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div data-aos="fade-right" data-aos-delay="100">
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

              <div data-aos="fade-left" data-aos-delay="200">
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

              <div data-aos="fade-right" data-aos-delay="300">
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

              <div data-aos="fade-up" data-aos-delay="400" className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>Tip:</strong> You can add your profile picture later in settings!
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                disabled={loading}
                data-aos="zoom-in"
                data-aos-delay="500"
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
              </motion.button>
            </form>

            <div className="mt-6 text-center" data-aos="fade-up" data-aos-delay="600">
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
      </motion.div>
    </div>
  );
};

export default RegisterPage;