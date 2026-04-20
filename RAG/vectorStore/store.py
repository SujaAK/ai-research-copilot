import numpy as np
 
 
class VectorStore:
    def __init__(self, db):
        self.db = db
 
    def add(self, embeddings: np.ndarray, texts: list, metadatas: list):
        combined = [
            {"content": text, **meta}
            for text, meta in zip(texts, metadatas)
        ]
        self.db.add_vectors(embeddings, combined)
 
    def search(self, query_embedding: np.ndarray, k: int = 5) -> list:
        return self.db.search(query_embedding, k)


    