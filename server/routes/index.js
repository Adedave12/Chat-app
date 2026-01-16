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

module.exports = router;