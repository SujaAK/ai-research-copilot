import { api } from "./apiClient";

export const askQuestion = async (paperId, query) => {
  const res = await api.post("/chat", {
    paperId,
    query, // fixed: was "question", backend expects "query"
  });
  return res.data;
};

export const getChatHistory = async (paperId) => {
  const res = await api.get(`/chat/${paperId}`);
  return res.data;
};