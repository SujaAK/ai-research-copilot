import os
from langchain_community.document_loaders import PyMuPDFLoader
from utils.logger import get_logger

logger = get_logger("Loader")

def load_single_pdf(pdf_path: str) -> list:
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    loader = PyMuPDFLoader(pdf_path)
    documents = loader.load()

    # ✅ Add metadata for better retrieval + UI
    for i, doc in enumerate(documents):
        doc.metadata["page"] = i + 1
        doc.metadata["source"] = os.path.basename(pdf_path)

    logger.info(f"Loaded {len(documents)} pages from {pdf_path}")
    return documents