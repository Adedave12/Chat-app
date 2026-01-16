import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const location = useLocation();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const userId = location.state?.userId;

  useEffect(() => {
    if (!userId) {
      navigate("/register");
    }
  }, [userId, navigate]);

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

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];

    pastedData.split("").forEach((char, index) => {
      if (index < 6 && !isNaN(char)) {
        newOtp[index] = char;
      }
    });

    setOtp(newOtp);
    inputRefs.current[5].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/verify-otp`;

    setLoading(true);

    try {
      const response = await axios.post(URL, {
        userId,
        otp: otpString,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/login");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;

    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/resend-otp`;

    setResending(true);

    try {
      const response = await axios.post(URL, { userId });

      if (response.data.success) {
        toast.success(response.data.message);
        setTimer(60);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0].focus();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
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
              <h1 className="text-5xl mb-2">✉️</h1>
              <h2 className="text-2xl font-bold text-white">Verify Your Email</h2>
              <p className="text-purple-100 mt-2">
                We&apos;ve sent a 6-digit code to your email
              </p>
            </motion.div>
          </div>

          {/* OTP Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div
                className="flex justify-center gap-2"
                data-aos="zoom-in"
                data-aos-delay="200"
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={loading}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
                data-aos="fade-up"
                data-aos-delay="300"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify Email"
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center" data-aos="fade-up" data-aos-delay="400">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Didn&apos;t receive the code?
              </p>
              <button
                onClick={handleResendOTP}
                disabled={timer > 0 || resending}
                className={`mt-2 font-semibold ${
                  timer > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-primary hover:text-primary-dark"
                } transition-colors`}
              >
                {resending
                  ? "Resending..."
                  : timer > 0
                  ? `Resend in ${timer}s`
                  : "Resend OTP"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTPPage;