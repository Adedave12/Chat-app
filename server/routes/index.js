const express = require("express");
const registerUser = require("../controller/registerUser");
const verifyOTP = require("../controller/verifyOTP");
const resendOTP = require("../controller/resendOTP");
const login = require("../controller/login");
const userDetails = require("../controller/userDetails");
const logout = require("../controller/logout");
const updateUserDetails = require("../controller/updateUserDetails");
const searchUser = require("../controller/searchUser");
const forgotPassword = require("../controller/forgotPassword");
const resetPassword = require("../controller/resetPassword");
const toggleBlockUser = require("../controller/toggleBlockUser");
const toggleArchiveUser = require("../controller/toggleArchiveUser");
const groupRoutes = require("./groupRoutes");

const router = express.Router();

// Authentication routes
router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// User routes
router.get("/user-details", userDetails);
router.get("/logout", logout);
router.post("/update-user", updateUserDetails);
router.post("/search-user", searchUser);
router.post("/toggle-block-user", toggleBlockUser);
router.post("/toggle-archive-user", toggleArchiveUser);

// Group routes
router.use("/groups", groupRoutes);

module.exports = router;