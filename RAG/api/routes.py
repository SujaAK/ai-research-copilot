from fastapi import APIRouter, HTTPException
from api.schema import ChatRequest, ChatResponse
 
router = APIRouter()
 
rag_registry: dict = {}
 
 
def set_rag_registry(registry: dict):
    global rag_registry
    rag_registry = registry
 
 
@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """
    RAG chat endpoint.
    Requires paper_id to identify which paper's chain to use.
    """
    if not request.paper_id:
        raise HTTPException(status_code=400, detail="paper_id is required")
 
    chain = rag_registry.get(request.paper_id)
 
    if chain is None:
        raise HTTPException(
            status_code=404,
            detail=f"Paper '{request.paper_id}' not found or not yet ingested"
        )
 
    result = chain.run(request.query)
 
    return ChatResponse(
        query=request.query,
        answer=result["answer"],
        sources=result.get("context", [])
    )