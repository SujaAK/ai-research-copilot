from fastapi import FastAPI
from dotenv import load_dotenv
import os
import glob

from api.routes import router, set_rag_registry, set_shared_components
from utils.logger import get_logger

load_dotenv()

logger = get_logger("Main")

app = FastAPI(title="Research Copilot RAG API")

logger.info(f"HF TOKEN LOADED: {os.getenv('HF_TOKEN') is not None}")

# ── Shared singletons — created ONCE at startup ───────────────────────
# Embedder loads ~90MB of weights; Generator initializes the HTTP client.
# Both are stateless and safe to share across all requests and papers.
from embeddings.embedder import Embedder
from generation.generator import Generator

shared_embedder = Embedder()
shared_generator = Generator()

logger.info("Shared Embedder and Generator initialized")

set_shared_components(shared_embedder, shared_generator)

# ── Registry shared across routes ────────────────────────────────────
rag_registry = {}
set_rag_registry(rag_registry)


# ── On startup: reload persisted FAISS indexes ───────────────────────
@app.on_event("startup")
def reload_persisted_indexes():
    from vectorStore.db import VectorDB
    from vectorStore.store import VectorStore
    from retrieval.retriever import Retriever
    from chains.rag_chain import RAGChain
    from utils.config import Config
    import json

    processed_dir = "data/processed"
    if not os.path.exists(processed_dir):
        logger.info("No processed dir found, skipping reload")
        return

    faiss_files = glob.glob(os.path.join(processed_dir, "*.faiss"))
    logger.info(f"Found {len(faiss_files)} persisted FAISS index(es) to reload")

    for faiss_path in faiss_files:
        paper_id = os.path.splitext(os.path.basename(faiss_path))[0]
        chunks_path = os.path.join(processed_dir, f"{paper_id}_chunks.json")

        try:
            db = VectorDB(dimension=Config.VECTOR_DIMENSION)
            db.load(faiss_path)

            if os.path.exists(chunks_path):
                with open(chunks_path, "r", encoding="utf-8") as f:
                    chunks_data = json.load(f)
                db.metadata = [
                    {"content": c["content"], **c.get("metadata", {})}
                    for c in chunks_data
                ]
            else:
                logger.warning(f"No chunks JSON for {paper_id}, sources won't be available")

            # Reuse shared singletons — no weight reload
            store = VectorStore(db)
            retriever = Retriever(shared_embedder, store)
            chain = RAGChain(retriever, shared_generator)

            rag_registry[paper_id] = {
                "chain": chain,
                "summary": None,
            }
            logger.info(f"Reloaded paper {paper_id} from disk")

        except Exception as e:
            logger.error(f"Failed to reload {paper_id}: {str(e)}")


# ── Routes ────────────────────────────────────────────────────────────
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message": "RAG API is running"}