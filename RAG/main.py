from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil
import os
 
from api.routes import router, set_rag_registry
from api.schema import ChatRequest, ChatResponse
 
from ingest.loader import load_single_pdf
from ingest.splitter import split_and_save
 
from embeddings.embedder import Embedder
from vectorStore.db import VectorDB
from vectorStore.store import VectorStore
 
from retrieval.retriever import Retriever
from generation.generator import Generator
from chains.rag_chain import RAGChain
 
from utils.logger import get_logger
from utils.config import Config
 
logger = get_logger("Main")
 
app = FastAPI(title="Research Copilot RAG System")
 
UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
 
# Registry: paper_id -> RAGChain instance
rag_registry: dict[str, RAGChain] = {}
 
 
def build_rag_chain_for_paper(paper_id: str, pdf_path: str) -> RAGChain:
    logger.info(f"Building RAG chain for paper: {paper_id}")
 
    documents = load_single_pdf(pdf_path)
    chunks = split_and_save(documents, file_name=paper_id)
 
    embedder = Embedder()
    embeddings, texts, metadatas = embedder.embed_chunks(chunks)
 
    vector_db = VectorDB(dimension=Config.VECTOR_DIMENSION)
    vector_store = VectorStore(vector_db)
    vector_store.add(embeddings, texts, metadatas)
 
    retriever = Retriever(embedder, vector_store)
    generator = Generator()
    rag_chain = RAGChain(retriever, generator)
 
    logger.info(f"RAG chain ready for paper: {paper_id}")
    return rag_chain
 
 
# Inject registry into API layer
set_rag_registry(rag_registry)
 
# Register routes
app.include_router(router, prefix="/api")
 
 
@app.post("/api/ingest/{paper_id}")
async def ingest_paper(paper_id: str, file: UploadFile = File(...)):
    """
    Called by Express after a paper is uploaded.
    Builds and registers a RAG chain for the given paper_id.
    """
    if paper_id in rag_registry:
        return {"message": f"Paper {paper_id} already ingested", "paper_id": paper_id}
 
    pdf_path = os.path.join(UPLOAD_DIR, f"{paper_id}.pdf")
 
    try:
        with open(pdf_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
 
        rag_registry[paper_id] = build_rag_chain_for_paper(paper_id, pdf_path)
 
        return {"message": "Paper ingested successfully", "paper_id": paper_id}
 
    except Exception as e:
        logger.error(f"Ingestion failed for {paper_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
 
 
@app.get("/")
def root():
    return {
        "message": "RAG Research Copilot running",
        "status": "active",
        "papers_loaded": list(rag_registry.keys())
    }
 