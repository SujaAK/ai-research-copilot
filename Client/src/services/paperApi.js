import { api } from "./apiClient";

export const uploadPaper = async (file, title = "") => {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);

  const res = await api.post("/papers/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getPapers = async () => {
  const res = await api.get("/papers");
  return res.data;
};

export const getPaperById = async (id) => {
  const res = await api.get(`/papers/${id}`);
  return res.data;
};

export const deletePaper = async (id) => {
  const res = await api.delete(`/papers/${id}`);
  return res.data;
};

export const comparePapers = async (paper1Id, paper2Id) => {
  const res = await api.get(`/compare?paper1=${paper1Id}&paper2=${paper2Id}`);
  return res.data;
};