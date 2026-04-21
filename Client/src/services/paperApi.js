import { api } from "./apiClient";

export const uploadPaper = async (file, title = "") => {
  const formData = new FormData(); // fixed: was "new formData()"
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
