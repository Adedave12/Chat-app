const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTPEmail = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: {
        name: "Chat App",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Verify Your Email - Chat App",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Inter', Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: linear-gradient(135deg, #a855f7 0%, #c084fc 100%);
              border-radius: 20px;
              padding: 2px;
            }
            .content {
              background-color: #ffffff;
              border-radius: 18px;
              padding: 40px;
              text-align: center;
            }
            .logo {
              font-size: 32px;
              font-weight: 800;
              background: linear-gradient(135deg, #a855f7 0%, #c084fc 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 20px;
            }
            h1 {
              color: #1a1a1a;
              margin-bottom: 10px;
              font-size: 28px;
            }
            p {
              color: #6c757d;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .otp-box {
              background: linear-gradient(135deg, #a855f7 0%, #c084fc 100%);
              color: white;
              font-size: 36px;
              font-weight: 700;
              letter-spacing: 8px;
              padding: 20px 40px;
              border-radius: 12px;
              display: inline-block;
              margin: 20px 0;
              box-shadow: 0 8px 20px rgba(168, 85, 247, 0.3);
            }
            .footer {
              margin-top: 30px;
              color: #999;
              font-size: 14px;
            }
            .warning {
              background-color: #fff3cd;
              color: #856404;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">💬 Chat App</div>
              <h1>Welcome ${name}! 👋</h1>
              <p>Thanks for signing up! Please verify your email address using the OTP below:</p>
              
              <div class="otp-box">${otp}</div>
              
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              
              <div class="warning">
                ⚠️ If you didn't request this, please ignore this email.
              </div>
              
              <div class="footer">
                <p>© 2024 Chat App. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

// Send Password Reset Email
const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: {
        name: "Chat App",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Reset Your Password - Chat App",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Inter', Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: linear-gradient(135deg, #a855f7 0%, #c084fc 100%);
              border-radius: 20px;
              padding: 2px;
            }
            .content {
              background-color: #ffffff;
              border-radius: 18px;
              padding: 40px;
              text-align: center;
            }
            .logo {
              font-size: 32px;
              font-weight: 800;
              background: linear-gradient(135deg, #a855f7 0%, #c084fc 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 20px;
            }
            h1 {
              color: #1a1a1a;
              margin-bottom: 10px;
              font-size: 28px;
            }
            p {
              color: #6c757d;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .reset-button {
              display: inline-block;
              background: linear-gradient(135deg, #a855f7 0%, #c084fc 100%);
              color: white;
              text-decoration: none;
              padding: 16px 40px;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
              box-shadow: 0 8px 20px rgba(168, 85, 247, 0.3);
            }
            .footer {
              margin-top: 30px;
              color: #999;
              font-size: 14px;
            }
            .warning {
              background-color: #fff3cd;
              color: #856404;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">💬 Chat App</div>
              <h1>Reset Your Password 🔐</h1>
              <p>Hi ${name}, we received a request to reset your password.</p>
              
              <a href="${resetLink}" class="reset-button">Reset Password</a>
              
              <p style="font-size: 14px; color: #999;">Or copy and paste this link:<br>
              <span style="color: #a855f7;">${resetLink}</span></p>
              
              <p>This link will expire in <strong>1 hour</strong>.</p>
              
              <div class="warning">
                ⚠️ If you didn't request this, please ignore this email. Your password won't be changed.
              </div>
              
              <div class="footer">
                <p>© 2024 Chat App. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendPasswordResetEmail,
};