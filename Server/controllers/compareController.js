const Paper = require("../models/Paper");
const ragService = require("../services/ragService");

const comparePapers = async (req, res) => {
  try {
    const { paper1, paper2 } = req.query;

    if (!paper1 || !paper2) {
      return res.status(400).json({ message: "paper1 and paper2 query params are required" });
    }

    if (paper1 === paper2) {
      return res.status(400).json({ message: "Cannot compare a paper with itself" });
    }

    // Verify both papers belong to user and are ready
    const [p1, p2] = await Promise.all([
      Paper.findOne({ _id: paper1, user: req.user._id }),
      Paper.findOne({ _id: paper2, user: req.user._id }),
    ]);

    if (!p1) return res.status(404).json({ message: "First paper not found" });
    if (!p2) return res.status(404).json({ message: "Second paper not found" });
    if (p1.status !== "ready") return res.status(400).json({ message: `"${p1.title}" is not ready yet` });
    if (p2.status !== "ready") return res.status(400).json({ message: `"${p2.title}" is not ready yet` });

    const comparison = await ragService.comparePapers(paper1, paper2);

    res.json({
      paper1: { id: p1._id, title: p1.title },
      paper2: { id: p2._id, title: p2.title },
      ...comparison,
    });

  } catch (error) {
    console.error("[Compare]", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { comparePapers };