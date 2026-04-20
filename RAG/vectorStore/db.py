import faiss
import numpy as np
import os
 
from utils.logger import get_logger
 
logger = get_logger("VectorDB")
 
 
class VectorDB:
    def __init__(self, dimension: int):
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)
        self.metadata = []
 
    def _normalize(self, vectors: np.ndarray) -> np.ndarray:
        faiss.normalize_L2(vectors)
        return vectors
 
    def add_vectors(self, embeddings: np.ndarray, metadatas: list):
        if len(embeddings) == 0:
            logger.warning("No embeddings to add")
            return
 
        embeddings = np.array(embeddings).astype("float32")
        embeddings = self._normalize(embeddings)
        self.index.add(embeddings)
        self.metadata.extend(metadatas)
        logger.info(f"Added {len(embeddings)} vectors. Total: {self.index.ntotal}")
 
    def search(self, query_embedding: np.ndarray, k: int = 5) -> list:
        query_embedding = np.array([query_embedding]).astype("float32")
        query_embedding = self._normalize(query_embedding)
 
        scores, indices = self.index.search(query_embedding, k)
 
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            entry = dict(self.metadata[idx])
            entry["score"] = round(float(score), 4)
            results.append(entry)
 
        logger.info(f"Retrieved {len(results)} chunks for query")
        return results
 
    def save(self, path: str = "vector_store.faiss"):
        faiss.write_index(self.index, path)
        logger.info(f"FAISS index saved to {path}")
 
    def load(self, path: str = "vector_store.faiss"):
        if os.path.exists(path):
            self.index = faiss.read_index(path)
            logger.info(f"FAISS index loaded from {path}")
        else:
            logger.warning(f"No FAISS index found at {path}, starting fresh")