import os


class Config:
    """
    Central configuration for RAG system
    """

    # HuggingFace
    HF_TOKEN = os.getenv("HF_TOKEN")

    # Models
    EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
    LLM_MODEL = "mistralai/Mistral-7B-Instruct-v0.2"

    # Vector DB
    VECTOR_DIMENSION = 384

    # FAISS file path
    FAISS_INDEX_PATH = "vector_store.faiss"


    