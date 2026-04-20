const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/authRoutes");
const paperRoutes = require("./routes/paperRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/papers", paperRoutes);

module.exports = app;

