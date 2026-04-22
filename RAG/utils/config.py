import os


class Config:
    """
    Central configuration for RAG system
    """

    # HuggingFace
    HF_TOKEN = os.getenv("HF_TOKEN")

    # Embedding model (local, unchanged)
    EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

    # LLM — Qwen2.5-72B-Instruct is available across multiple free providers
    # (sambanova, cerebras, together) via the HF router, so it will always
    # find a working backend automatically without any account setup.
    LLM_MODEL = "Qwen/Qwen2.5-72B-Instruct"

    # Vector DB
    VECTOR_DIMENSION = 384

    # FAISS file path
    FAISS_INDEX_PATH = "vector_store.faiss"

    # Directory paths
    UPLOADS_DIR   = os.getenv("UPLOADS_DIR",   "data/uploads")
    PROCESSED_DIR = os.getenv("PROCESSED_DIR", "data/processed")