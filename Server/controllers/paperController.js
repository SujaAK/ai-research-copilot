const Paper = require("../models/Paper");

const uploadPaper = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const paper = await Paper.create({
      user: req.user._id,
      title: title || req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      status: "uploaded",
    });

    res.status(201).json({
      message: "Paper uploaded successfully",
      paper,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPapers = async (req, res) => {
  try {
    const papers = await Paper.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(papers);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {uploadPaper,getPapers};