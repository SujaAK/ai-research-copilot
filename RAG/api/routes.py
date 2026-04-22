from fastapi import APIRouter, HTTPException, UploadFile, File
from api.schema import ChatRequest, ChatResponse
import os
import shutil
import time

router = APIRouter()

rag_registry: dict = {}
_shared_embedder = None
_shared_generator = None

# Simple in-process arXiv cooldown — one request per 15 seconds max
_last_arxiv_call: float = 0
ARXIV_COOLDOWN = 15  # seconds


def set_rag_registry(registry: dict):
    global rag_registry
    rag_registry = registry


def set_shared_components(embedder, generator):
    global _shared_embedder, _shared_generator
    _shared_embedder = embedder
    _shared_generator = generator


# ─────────────────────────────────────────────
# INGEST
# ─────────────────────────────────────────────
@router.post("/ingest/{paper_id}")
async def ingest_paper(paper_id: str, file: UploadFile = File(...)):
    from ingest.loader import load_single_pdf
    from ingest.splitter import split_and_save
    from vectorStore.db import VectorDB
    from vectorStore.store import VectorStore
    from retrieval.retriever import Retriever
    from chains.rag_chain import RAGChain
    from utils.config import Config
    from utils.logger import get_logger

    logger = get_logger("Ingest")

    upload_dir = Config.UPLOADS_DIR
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{paper_id}.pdf")

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    logger.info(f"Saved PDF for paper {paper_id} → {file_path}")

    try:
        documents = load_single_pdf(file_path)
        chunks = split_and_save(documents, file_name=paper_id)

        if not chunks:
            raise ValueError("No chunks produced from PDF")

        embeddings, texts, metadatas = _shared_embedder.embed_chunks(chunks)

        db = VectorDB(dimension=Config.VECTOR_DIMENSION)
        store = VectorStore(db)
        store.add(embeddings, texts, metadatas)

        index_path = os.path.join(Config.PROCESSED_DIR, f"{paper_id}.faiss")
        db.save(index_path)

        retriever = Retriever(_shared_embedder, store)
        chain = RAGChain(retriever, _shared_generator)
        summary = _shared_generator.generate_summary(chunks)

        rag_registry[paper_id] = {
            "chain": chain,
            "summary": summary,
            "chunks": [
                {"content": c.page_content, "section": c.metadata.get("section", "unknown")}
                for c in chunks
            ],
        }

        logger.info(f"Paper {paper_id} ingested successfully ({len(chunks)} chunks)")
        return {
            "message": "Paper ingested successfully",
            "chunks": len(chunks),
            "summary": summary,
        }

    except Exception as e:
        logger.error(f"Ingestion failed for {paper_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# CHAT
# ─────────────────────────────────────────────

SECTION_KEYWORDS = {
    "conclusion":   ["conclusion"],
    "introduction": ["introduction"],
    "abstract":     ["abstract"],
    "methodology":  ["methodology", "methods"],
    "results":      ["results"],
    "discussion":   ["discussion"],
    "related work": ["related work", "literature review"],
}

SUMMARY_KEYWORDS = {"summary", "summarize", "overview", "what is this paper", "what is the paper about"}


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    from utils.logger import get_logger
    logger = get_logger("Chat")

    if not request.paper_id:
        raise HTTPException(status_code=400, detail="paper_id is required")

    entry = rag_registry.get(request.paper_id)
    if entry is None:
        raise HTTPException(
            status_code=404,
            detail=f"Paper '{request.paper_id}' not found or not yet ingested. Try re-uploading."
        )

    query_lower = request.query.lower()
    cached_summary = entry.get("summary")
    cached_chunks = entry.get("chunks", [])

    # ── 1. Summary shortcut ──────────────────────────────────────────
    if cached_summary and any(kw in query_lower for kw in SUMMARY_KEYWORDS):
        return ChatResponse(
            query=request.query,
            answer=f"**Paper Summary**\n\n{cached_summary}",
            sources=[],
            citations=[],
        )

    # ── 2. Section shortcut ──────────────────────────────────────────
    matched_sections = []
    for keyword, section_names in SECTION_KEYWORDS.items():
        if keyword in query_lower:
            matched_sections = section_names
            break

    if matched_sections and cached_chunks:
        section_chunks = [
            c for c in cached_chunks
            if c.get("section", "").lower() in matched_sections
        ]

        if section_chunks:
            logger.info(f"Section shortcut: found {len(section_chunks)} chunks for {matched_sections}")
            answer = _shared_generator.generate_answer(request.query, section_chunks)
            return ChatResponse(
                query=request.query,
                answer=answer["answer"],
                sources=section_chunks[:5],
                citations=answer.get("citations", []),
            )

    # ── 3. Normal RAG chain ──────────────────────────────────────────
    chain = entry["chain"]
    result = chain.run(request.query)

    return ChatResponse(
        query=request.query,
        answer=result["answer"],
        sources=result.get("context", []),
        citations=result.get("citations", []),
    )


# ─────────────────────────────────────────────
# DELETE
# ─────────────────────────────────────────────
@router.delete("/paper/{paper_id}")
def delete_paper(paper_id: str):
    from utils.config import Config          # ← Fix 3: was missing
    from utils.logger import get_logger
    logger = get_logger("Delete")

    removed = rag_registry.pop(paper_id, None)

    for file_path in [
        os.path.join(Config.UPLOADS_DIR,   f"{paper_id}.pdf"),
        os.path.join(Config.PROCESSED_DIR, f"{paper_id}.faiss"),
        os.path.join(Config.PROCESSED_DIR, f"{paper_id}_chunks.json"),
    ]:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Deleted {file_path}")

    if removed:
        logger.info(f"Paper {paper_id} removed from registry")
        return {"message": f"Paper {paper_id} deleted successfully"}
    else:
        return {"message": f"Paper {paper_id} removed (was not in active registry)"}


# ─────────────────────────────────────────────
# SIMILAR PAPERS  (arXiv)
# ─────────────────────────────────────────────
@router.get("/similar")
def similar_papers(query: str, max_results: int = 3):
    import urllib.request
    import urllib.parse
    import xml.etree.ElementTree as ET
    from utils.logger import get_logger

    logger = get_logger("Similar")
    global _last_arxiv_call

    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="query is required")

    query_lower = query.lower()
    skip_keywords = SUMMARY_KEYWORDS | {"conclusion", "introduction", "abstract", "results", "discussion"}
    if any(kw in query_lower for kw in skip_keywords):
        logger.info("Skipping arXiv for meta/section query")
        return {"papers": []}

    now = time.time()
    if now - _last_arxiv_call < ARXIV_COOLDOWN:
        logger.info("arXiv cooldown active, skipping")
        return {"papers": []}

    try:
        encoded_query = urllib.parse.quote(query.strip())
        url = (
            f"http://export.arxiv.org/api/query"
            f"?search_query=all:{encoded_query}"
            f"&start=0&max_results={max_results}"
            f"&sortBy=relevance&sortOrder=descending"
        )

        req = urllib.request.Request(url, headers={"User-Agent": "ResearchCopilot/1.0"})

        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                xml_data = resp.read().decode("utf-8")
            _last_arxiv_call = time.time()
        except Exception as timeout_err:
            logger.warning(f"arXiv request failed (non-fatal): {str(timeout_err)}")
            return {"papers": []}

        root = ET.fromstring(xml_data)
        ns = {"atom": "http://www.w3.org/2005/Atom"}

        papers = []
        for entry in root.findall("atom:entry", ns):
            title   = entry.find("atom:title",   ns)
            summary = entry.find("atom:summary", ns)
            link    = entry.find("atom:id",      ns)
            authors = entry.findall("atom:author", ns)

            papers.append({
                "title":   title.text.strip().replace("\n", " ") if title   is not None else "Unknown",
                "summary": summary.text.strip()[:300] + "..."    if summary is not None else "",
                "url":     link.text.strip()                     if link    is not None else "",
                "authors": [
                    a.find("atom:name", ns).text
                    for a in authors[:3]
                    if a.find("atom:name", ns) is not None
                ],
            })

        logger.info(f"Found {len(papers)} similar papers for query: {query[:60]}")
        return {"papers": papers}

    except Exception as e:
        logger.error(f"arXiv search failed: {str(e)}")
        return {"papers": []}


# ─────────────────────────────────────────────
# COMPARE TWO PAPERS
# ─────────────────────────────────────────────
@router.post("/compare")
def compare_papers(request: dict):
    from utils.logger import get_logger
    logger = get_logger("Compare")

    paper_id_1 = request.get("paper_id_1")
    paper_id_2 = request.get("paper_id_2")

    if not paper_id_1 or not paper_id_2:
        raise HTTPException(status_code=400, detail="paper_id_1 and paper_id_2 are required")

    if paper_id_1 == paper_id_2:
        raise HTTPException(status_code=400, detail="Cannot compare a paper with itself")

    entry1 = rag_registry.get(paper_id_1)
    entry2 = rag_registry.get(paper_id_2)

    if not entry1:
        raise HTTPException(status_code=404, detail=f"Paper '{paper_id_1}' not found or not ingested")
    if not entry2:
        raise HTTPException(status_code=404, detail=f"Paper '{paper_id_2}' not found or not ingested")

    summary1 = entry1.get("summary") or ""
    summary2 = entry2.get("summary") or ""

    chunks1 = entry1.get("chunks", [])[:8]
    chunks2 = entry2.get("chunks", [])[:8]

    context1 = summary1 + "\n\n" + "\n\n".join(c["content"] for c in chunks1)
    context2 = summary2 + "\n\n" + "\n\n".join(c["content"] for c in chunks2)

    system_prompt = (
        "You are an expert academic research analyst. "
        "You will be given content from two research papers. "
        "Your job is to:\n"
        "1. Identify the domain of each paper (e.g. Computer Vision, NLP, HCI, Civil Engineering)\n"
        "2. Determine if they are from the same domain\n"
        "3. Auto-select the most relevant comparison dimensions based on the papers\n"
        "4. Compare the two papers across those dimensions\n\n"
        "Respond ONLY with a valid JSON object in this exact format, no preamble, no markdown:\n"
        "{\n"
        '  "domain_1": "string",\n'
        '  "domain_2": "string",\n'
        '  "same_domain": true or false,\n'
        '  "dimensions": [\n'
        '    {\n'
        '      "label": "dimension name",\n'
        '      "paper_1": "comparison text for paper 1",\n'
        '      "paper_2": "comparison text for paper 2"\n'
        '    }\n'
        '  ]\n'
        "}\n"
        "Choose 5-7 dimensions that are most relevant to these specific papers. "
        "Each comparison cell should be 1-3 concise sentences. "
        "Be factual and grounded in the provided content only."
    )

    user_prompt = (
        f"PAPER 1 CONTENT:\n{context1[:3000]}\n\n"
        f"PAPER 2 CONTENT:\n{context2[:3000]}"
    )

    try:
        raw = _shared_generator._call_llm(system_prompt, user_prompt, max_new_tokens=1200)

        import re
        import json
        clean = re.sub(r"^```json|^```|```$", "", raw.strip(), flags=re.MULTILINE).strip()
        result = json.loads(clean)

        logger.info(f"Comparison generated: {result.get('domain_1')} vs {result.get('domain_2')}")
        return result

    except Exception as e:
        logger.error(f"Comparison failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")