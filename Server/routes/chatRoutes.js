const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const { sendMessage, getChatHistory } = require("../controllers/chatController");

router.use(protect);

// ✅ clean REST style
router.post("/:paperId", sendMessage);
router.get("/:paperId", getChatHistory);

module.exports = router;