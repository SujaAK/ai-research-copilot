const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
 
const RAG_BASE_URL = process.env.RAG_API_URL || "http://localhost:8000";
 
/**
 * Send PDF to Python RAG server for ingestion.
 * Returns true on success, false on failure.
 */
const ingestPaper = async (paperId, filePath) => {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
 
    const response = await axios.post(
      `${RAG_BASE_URL}/api/ingest/${paperId}`,
      form,
      { headers: form.getHeaders(), timeout: 120000 }
    );
 
    console.log(`[RAG] Ingested paper ${paperId}:`, response.data.message);
    return true;
 
  } catch (error) {
    console.error(`[RAG] Ingestion failed for ${paperId}:`, error.message);
    return false;
  }
};
 
/**
 * Send a query to the RAG chat endpoint for a specific paper.
 */
const queryPaper = async (paperId, query) => {
  const response = await axios.post(
    `${RAG_BASE_URL}/api/chat`,
    { paper_id: paperId, query },
    { timeout: 60000 }
  );
  return response.data;
};
 
module.exports = { ingestPaper, queryPaper };