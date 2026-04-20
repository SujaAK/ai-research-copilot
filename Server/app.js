const express = require("express");
const cors = require("cors");
const path = require("path");
 
const app = express();
 
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
 
const authRoutes = require("./routes/authRoutes");
const paperRoutes = require("./routes/paperRoutes");
const chatRoutes = require("./routes/chatRoutes");
 
app.use("/api/auth", authRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/chat", chatRoutes);
 
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});
 
module.exports = app;