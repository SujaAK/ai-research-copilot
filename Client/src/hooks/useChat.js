import { useState, useEffect } from "react";
import { askQuestion, getChatHistory } from "../services/chatApi";
import { formatSources } from "../utils/formatSources";

const useChat = (paperId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!paperId) {
      setMessages([]);
      setHistoryLoading(false);
      return;
    }

    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        const data = await getChatHistory(paperId);

        if (data.messages?.length > 0) {
          // Existing conversation — restore it
          const formatted = data.messages.map((m) => ({
            role: m.role,
            text: m.content,
            sources: formatSources(m.sources || []),
            citations: m.citations || [],
          }));
          setMessages(formatted);
        } else {
          // Fresh chat — auto-request summary so the user
          // immediately sees what the paper is about
          await _autoSummary(paperId);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperId]);

  // Fires a silent "summarize this paper" query on first open
  const _autoSummary = async (id) => {
    setLoading(true);
    try {
      const res = await askQuestion(id, "summarize this paper");
      setMessages([
        {
          role: "assistant",
          text: res.answer,
          sources: formatSources(res.sources || []),
          citations: res.citations || [],
          similarPapers: res.similarPapers || [],
          isAutoSummary: true,   // flag so UI can style it differently if needed
        },
      ]);
    } catch (err) {
      console.error("Auto-summary failed:", err);
      // Silently fail — don't show an error bubble for auto-summary
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", text, sources: [], citations: [] };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await askQuestion(paperId, text);
      const botMessage = {
        role: "assistant",
        text: res.answer,
        sources: formatSources(res.sources || []),
        citations: res.citations || [],
        similarPapers: res.similarPapers || [],
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: err.response?.data?.message || "Something went wrong. Please try again.",
          sources: [],
          citations: [],
          similarPapers: [],
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