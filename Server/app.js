const express = require("express");
const app = express();

app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const paperRoutes = require("./routes/paperRoutes");

app.use("/api/auth", authRoutes);
app.use("api/papers", paperRoutes);

module.exports = app;

