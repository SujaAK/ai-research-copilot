from sentence_transformers import SentenceTransformer
import numpy as np


class Embedder:
    def __init__(self):
        """
        SentenceTransformer for embeddings
        """
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def embed_text(self, text: str):
        """
        Embed single query text
        """
        return self.model.encode(text)

    def embed_chunks(self, chunks):
        """
        Embed list of LangChain Document objects
        Returns embeddings + metadata-aligned texts
        """

        texts = []
        metadatas = []

        for chunk in chunks:
            texts.append(chunk.page_content)
            metadatas.append(chunk.metadata)

        embeddings = self.model.encode(texts)

        return np.array(embeddings), texts, metadatas