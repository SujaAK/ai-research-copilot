import { api } from "./apiClient";

// ✅ send message
export const askQuestion = async (paperId, message) => {
  const res = await api.post(`/chat/${paperId}`, {
    message,
  });
  return res.data;
};

// ✅ get history
export const getChatHistory = async (paperId) => {
  const res = await api.get(`/chat/${paperId}`);
  return res.data;
};