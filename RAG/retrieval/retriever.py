from utils.logger import get_logger
 
logger = get_logger("Retriever")
 
MIN_SCORE = 0.25
 
 
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
            logger.warning(f"No chunks above score threshold {MIN_SCORE}")
 
        logger.info(f"Retrieved {len(filtered)}/{len(results)} chunks above threshold")
        return filtered
 