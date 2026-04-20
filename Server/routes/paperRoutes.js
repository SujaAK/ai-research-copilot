const express = require("express");
const router = express.Router();

const upload = require("../config/multer");
const protect = require("../middlewares/authMiddleware");

const { uploadPaper,getPapers } = require("../controllers/paperController");


router.use(protect);


router.post("/upload", upload.single("file"), uploadPaper);


router.get("/", getPapers);

module.exports = router;