from utils.logger import get_logger

logger = get_logger("Retriever")

# Lowered from 0.25 — cosine similarity via IndexFlatIP on normalized vectors
# returns values in [-1, 1]. For semantic search on research text, scores of
# 0.10–0.30 are typical for relevant chunks. 0.25 was filtering everything out.
MIN_SCORE = 0.10


class Retriever:
    def __init__(self, embedder, vector_store):
        self.embedder = embedder
        self.vector_store = vector_store

    def retrieve(self, query: str, k: int = 5) -> list:
        query = query.strip().lower()

        if not query:
            logger.warning("Empty query received")
            return []

        query_embedding = self.embedder.embed_text(query)
        results = self.vector_store.search(query_embedding, k=k)

        filtered = [r for r in results if r.get("score", 0) >= MIN_SCORE]

        if not filtered:
            logger.warning(
                f"No chunks above score threshold {MIN_SCORE} — "
                f"returning top {min(2, len(results))} results anyway"
            )
            # Fallback: always return at least top 2 so LLM has some context
            return results[:2]

        logger.info(f"Retrieved {len(filtered)}/{len(results)} chunks above threshold")
        return filtered