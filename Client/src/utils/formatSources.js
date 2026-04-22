/**
 * Normalize raw source chunks from the RAG API into a consistent shape
 * for use in SourcesPanel and MessageBubble.
 */
export const formatSources = (sources = []) => {
  if (!sources.length) return [];

  return sources.map((src) => ({
    content: src.content?.slice(0, 300) || "",
    section: src.section || "Unknown",
    score: src.score ? Number(src.score.toFixed(2)) : 0,
  }));
};