
Copy

const Chat = require("../models/Chat");
const Paper = require("../models/Paper");
const ragService = require("../services/ragService");
 
/**
 * Send a message and get a RAG-powered answer.
 * Creates or continues a chat session for the given paper.
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
 
    // Find or create chat session for this paper
    let chat = await Chat.findOne({ user: req.user._id, paper: paperId });
    if (!chat) {
      chat = await Chat.create({ user: req.user._id, paper: paperId, messages: [] });
    }
 
    // Add user message
    chat.messages.push({ role: "user", content: message });
 
    // Query RAG
    const ragResponse = await ragService.queryPaper(paperId, message);
    const answer = ragResponse.answer;
 
    // Add assistant message
    chat.messages.push({ role: "assistant", content: answer });
    await chat.save();
 
    res.json({
      answer,
      sources: ragResponse.sources || [],
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
 