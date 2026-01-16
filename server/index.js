const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/connectDB");
const router = require("./routes/index.js");
const cookieParser = require("cookie-parser");
const { app, server } = require("./socket/index.js");

const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-app-front-sbk6.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser()); // Keep for backward compatibility
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.json({
    message: "Server running at " + PORT,
  });
});

//API endpoint
app.use("/api", router);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("Server running at " + PORT);
  });
});