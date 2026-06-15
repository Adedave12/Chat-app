require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function testEmail() {
  try {
    console.log("Using host: smtp.gmail.com, port: 587, secure: false");
    await transporter.verify();
    console.log("✅ Nodemailer configuration is correct and ready to send emails.");
  } catch (error) {
    console.error("❌ Nodemailer verification failed:", error);
  }
}

testEmail();
