import express from "express";
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Server running");
});

app.listen(5000, () => console.log(`Server started listening on port: ${PORT}`));

