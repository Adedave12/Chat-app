const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/connectDB");
const router = require("./routes/index.js");
const cookieParser = require("cookie-parser");
const { app, server } = require("./socket/index.js");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://chatlyx.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.json({
    message: "Server running at " + PORT,
    status: "online"
  });
});

// API endpoint
app.use("/api", router);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("✅ Server running at " + PORT);
  });
});