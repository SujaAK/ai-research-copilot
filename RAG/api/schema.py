from pydantic import BaseModel
from typing import Optional, List, Dict


class ChatRequest(BaseModel):
    paper_id: str
    query: str


class ChatResponse(BaseModel):
    query: str
    answer: str
    sources: Optional[List[Dict]] = []
    citations: Optional[List[int]] = []      # inline citation indices e.g. [0, 2]


class UploadResponse(BaseModel):
    message: str
    filename: str
    summary: Optional[str] = None


class RetrievedChunk(BaseModel):
    content: str
    section: Optional[str] = None
    score: Optional[float] = None


class SimilarPaper(BaseModel):
    title: str
    summary: str
    url: str
    authors: Optional[List[str]] = []


class SimilarPapersResponse(BaseModel):
    papers: List[SimilarPaper]