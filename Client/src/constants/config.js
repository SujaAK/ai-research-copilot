export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  FASTAPI_BASE_URL: import.meta.env.VITE_RAG_URL || "http://localhost:8000",

  APP_NAME: "Research Copilot",

  MAX_UPLOAD_SIZE_MB: 10,
};