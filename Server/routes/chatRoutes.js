const express = require("express");
const router = express.Router();
 
const protect = require("../middlewares/authMiddleware");
const { sendMessage, getChatHistory } = require("../controllers/chatController");
 
router.use(protect);
 
router.post("/:paperId/message", sendMessage);
router.get("/:paperId/history", getChatHistory);
 
module.exports = router;
 