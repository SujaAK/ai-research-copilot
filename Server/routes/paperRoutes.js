const express = require("express");
const router = express.Router();

const upload = require("../config/multer");
const protect = require("../middlewares/authMiddleware");
const { uploadPaper, getPapers, getPaperById, deletePaper } = require("../controllers/paperController");

router.use(protect);

router.post("/upload", upload.single("file"), uploadPaper);
router.get("/", getPapers);
router.get("/:id", getPaperById);
router.delete("/:id", deletePaper);   // ← NEW

module.exports = router;