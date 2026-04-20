from pydantic import BaseModel
from typing import Optional, List, Dict
 
 
class ChatRequest(BaseModel):
    paper_id: str
    query: str
 
 
class ChatResponse(BaseModel):
    query: str
    answer: str
    sources: Optional[List[Dict]] = []
 
 
class UploadResponse(BaseModel):
    message: str
    filename: str
 
 
class RetrievedChunk(BaseModel):
    content: str
    section: Optional[str] = None
    score: Optional[float] = None
 