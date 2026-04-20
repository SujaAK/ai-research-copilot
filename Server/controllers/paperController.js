const Paper = require("../models/Paper");
const ragService = require("../services/ragService");
 
const uploadPaper = async (req, res) => {
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
 
    // Trigger RAG ingestion asynchronously — don't block the response
    ragService.ingestPaper(paper._id.toString(), req.file.path).then(async (success) => {
      paper.status = success ? "ready" : "failed";
      paper.vectorized = success;
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
 
module.exports = { uploadPaper, getPapers, getPaperById };