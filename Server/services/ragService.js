const axios    = require("axios");
const FormData = require("form-data");
const fs       = require("fs");

const RAG_BASE_URL = process.env.RAG_API_URL || "http://localhost:8000";

/**
 * Ingest a paper — reads from local disk path and sends to RAG.
 */
const ingestPaper = async (paperId, filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const response = await axios.post(
      `${RAG_BASE_URL}/api/ingest/${paperId}`,
      form,
      { headers: form.getHeaders(), timeout: 120000 }
    );

    console.log(`[RAG] Ingested paper ${paperId}:`, response.data.message);
    return { success: true, summary: response.data.summary || null };

  } catch (error) {
    console.error(`[RAG] Ingestion failed for ${paperId}:`, error.message);
    return { success: false, summary: null };
  }
};

/**
 * Query RAG chat endpoint.
 */
const queryPaper = async (paperId, query) => {
  try {
    const response = await axios.post(
      `${RAG_BASE_URL}/api/chat`,
      { paper_id: paperId, query },
      { timeout: 60000 }
    );
    return response.data;
  } catch (error) {
    console.error(`[RAG] Query failed for ${paperId}:`, error.message);
    throw new Error(error.response?.data?.detail || "RAG service unavailable. Please try again.");
  }
};

/**
 * Delete paper from RAG registry + disk.
 */
const deletePaper = async (paperId) => {
  try {
    await axios.delete(`${RAG_BASE_URL}/api/paper/${paperId}`, { timeout: 15000 });
    console.log(`[RAG] Deleted paper ${paperId} from RAG server`);
  } catch (error) {
    console.warn(`[RAG] Could not delete paper ${paperId} from RAG:`, error.message);
  }
};

/**
 * Fetch similar papers from arXiv via RAG server.
 */
const getSimilarPapers = async (query) => {
  try {
    const response = await axios.get(`${RAG_BASE_URL}/api/similar`, {
      params: { query, max_results: 3 },
      timeout: 15000,
    });
    return response.data.papers || [];
  } catch (error) {
    console.warn(`[RAG] Similar papers fetch failed:`, error.message);
    return [];
  }
};

/**
 * Compare two papers.
 */
const comparePapers = async (paperId1, paperId2) => {
  try {
    const response = await axios.post(
      `${RAG_BASE_URL}/api/compare`,
      { paper_id_1: paperId1, paper_id_2: paperId2 },
      { timeout: 90000 }
    );
    return response.data;
  } catch (error) {
    console.error(`[RAG] Compare failed:`, error.message);
    throw new Error(error.response?.data?.detail || "Comparison failed. Please try again.");
  }
};

module.exports = { ingestPaper, queryPaper, deletePaper, getSimilarPapers, comparePapers };