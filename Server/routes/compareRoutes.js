const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { comparePapers } = require("../controllers/compareController");

router.use(protect);
router.get("/", comparePapers);

module.exports = router;