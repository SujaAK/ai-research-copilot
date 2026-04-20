const express = require('express');
const router = express.Router();

const protect = require("../middlewares/authMiddleware");

const { uploadPaper, getPapers } = require("../controllers/paperController")

router.use(protect);

router.post("/upload", uploadPapers);
router.get("/", getPapers);

module.exports = router;