import { useState, useEffect } from "react";
import { askQuestion, getChatHistory } from "../services/chatApi";

const useChat = (paperId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Load chat history on mount
  useEffect(() => {
    if (!paperId) return;

    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        const data = await getChatHistory(paperId);
        if (data.messages?.length > 0) {
          const formatted = data.messages.map((m) => ({
            role: m.role,
            text: m.content,
            sources: m.sources || [],
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [paperId]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await askQuestion(paperId, text);

      const botMessage = {
        role: "assistant",
        text: res.answer,
        sources: res.sources || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Something went wrong. Please try again.",
          sources: [],
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, historyLoading, sendMessage };
};

export default useChat;