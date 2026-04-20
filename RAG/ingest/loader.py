import os
from langchain_community.document_loaders import PyMuPDFLoader
from utils.logger import get_logger
 
logger = get_logger("Loader")
 
UPLOAD_DIR = "data/uploads"
 
 
def load_single_pdf(pdf_path: str) -> list:
    """
    Load a single PDF by its full path.
    Used for per-paper RAG chain building.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")
 
    loader = PyMuPDFLoader(pdf_path)
    documents = loader.load()
    logger.info(f"Loaded {len(documents)} pages from {pdf_path}")
    return documents
 