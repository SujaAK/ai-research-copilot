const Chat = require("../models/Chat");
const Paper = require("../models/Paper");
const ragService = require("../services/ragService");

/**
 * Send a message and get a RAG-powered answer.
 * Also fetches similar papers from arXiv based on the query.
 */
const sendMessage = async (req, res) => {
  try {
    const { paperId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Verify paper belongs to user and is ready
    const paper = await Paper.findOne({ _id: paperId, user: req.user._id });
    if (!paper) return res.status(404).json({ message: "Paper not found" });
    if (paper.status !== "ready") {
      return res.status(400).json({ message: `Paper is not ready yet (status: ${paper.status})` });
    }

    // Find or create chat session
    let chat = await Chat.findOne({ user: req.user._id, paper: paperId });
    if (!chat) {
      chat = await Chat.create({ user: req.user._id, paper: paperId, messages: [] });
    }

    // Add user message
    chat.messages.push({ role: "user", content: message });

    // Query RAG (now has proper error handling)
    const ragResponse = await ragService.queryPaper(paperId, message);
    const answer = ragResponse.answer;
    const sources = ragResponse.sources || [];
    const citations = ragResponse.citations || [];

    // Add assistant message
    chat.messages.push({ role: "assistant", content: answer });
    await chat.save();

    // Fetch similar papers in parallel (non-blocking — won't fail the response)
    const similarPapers = await ragService.getSimilarPapers(message).catch(() => []);

    res.json({
      answer,
      sources,
      citations,
      similarPapers,
      chatId: chat._id,
    });

  } catch (error) {
    console.error("[Chat]", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get full chat history for a paper.
 */
const getChatHistory = async (req, res) => {
  try {
    const { paperId } = req.params;

    const chat = await Chat.findOne({ user: req.user._id, paper: paperId });
    if (!chat) return res.json({ messages: [] });

    res.json({ messages: chat.messages, chatId: chat._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getChatHistory };