require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function testEmail() {
  try {
    console.log("Using user:", process.env.EMAIL_USER);
    console.log("Using pass length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
    console.log("Using pass:", process.env.EMAIL_PASS);
    await transporter.verify();
    console.log("✅ Nodemailer configuration is correct and ready to send emails.");
  } catch (error) {
    console.error("❌ Nodemailer verification failed:", error);
  }
}

testEmail();
