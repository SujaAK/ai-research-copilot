const Paper = require("../models/Paper");
const Chat = require("../models/Chat");
const ragService = require("../services/ragService");
const fs = require("fs");
const path = require("path");

const uploadPaper = async (req, res) => {
  console.log("PAPER CONTROLLER HIT");
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const { title } = req.body;

    const paper = await Paper.create({
      user: req.user._id,
      title: title || req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      status: "processing",
    });

    // Trigger RAG ingestion asynchronously — pass local disk path directly
    ragService.ingestPaper(paper._id.toString(), req.file.path).then(async ({ success, summary }) => {
      paper.status = success ? "ready" : "failed";
      paper.vectorized = success;
      if (summary) paper.summary = summary;
      await paper.save();
    });

    res.status(201).json({
      message: "Paper uploaded and processing started",
      paper,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPapers = async (req, res) => {
  try {
    const papers = await Paper.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaperById = async (req, res) => {
  try {
    const paper = await Paper.findOne({ _id: req.params.id, user: req.user._id });
    if (!paper) return res.status(404).json({ message: "Paper not found" });
    res.json(paper);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a paper:
 * 1. Verify ownership
 * 2. Remove from RAG server (registry + FAISS)
 * 3. Delete uploaded file from disk
 * 4. Delete chat history
 * 5. Delete paper from MongoDB
 */
const deletePaper = async (req, res) => {
  try {
    const paper = await Paper.findOne({ _id: req.params.id, user: req.user._id });
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    // 1. Notify RAG server (non-fatal if it fails)
    await ragService.deletePaper(paper._id.toString());

    // 2. Delete file from disk
    // paper.fileUrl is "/uploads/filename.pdf" — strip leading slash
    // so path.join doesn't treat it as an absolute path and discard __dirname
    const relativeUrl = paper.fileUrl.replace(/^\//, "");
    const filePath = path.join(__dirname, "..", relativeUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 3. Delete associated chat history
    await Chat.deleteMany({ paper: paper._id });

    // 4. Delete paper record
    await Paper.deleteOne({ _id: paper._id });

    res.json({ message: "Paper deleted successfully" });

  } catch (error) {
    console.error("[deletePaper]", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadPaper, getPapers, getPaperById, deletePaper };