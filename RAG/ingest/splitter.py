import os
import re
import json
from langchain_text_splitters import RecursiveCharacterTextSplitter
 
from utils.logger import get_logger
 
logger = get_logger("Splitter")
 
PROCESSED_DIR = "data/processed"
 
SECTION_PATTERNS = [
    r"abstract",
    r"introduction",
    r"related work",
    r"literature review",
    r"methodology",
    r"methods",
    r"experiments",
    r"results",
    r"discussion",
    r"conclusion",
]
 
 
def split_by_sections(text: str) -> list:
    pattern = r"(?im)^(" + "|".join(SECTION_PATTERNS) + r")\s*$"
    splits = re.split(pattern, text)
 
    sections = []
    current_section = "unknown"
 
    for part in splits:
        part = part.strip()
        if not part:
            continue
        if part.lower() in SECTION_PATTERNS:
            current_section = part.lower()
        else:
            sections.append({
                "section": current_section,
                "content": part
            })
 
    if not sections:
        logger.warning("No sections detected, treating full text as one chunk")
        sections = [{"section": "unknown", "content": text}]
 
    return sections
 
 
def chunk_sections(sections: list) -> list:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=200
    )
 
    final_chunks = []
 
    for sec in sections:
        chunks = splitter.create_documents(
            texts=[sec["content"]],
            metadatas=[{"section": sec["section"]}]
        )
        final_chunks.extend(chunks)
 
    return final_chunks
 
 
def split_and_save(documents: list, file_name: str = "paper") -> list:
    os.makedirs(PROCESSED_DIR, exist_ok=True)
 
    all_chunks = []
 
    for doc in documents:
        sections = split_by_sections(doc.page_content)
        chunks = chunk_sections(sections)
        all_chunks.extend(chunks)
 
    output_path = os.path.join(PROCESSED_DIR, f"{file_name}_chunks.json")
 
    serializable = [
        {"content": c.page_content, "metadata": c.metadata}
        for c in all_chunks
    ]
 
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(serializable, f, indent=2)
 
    logger.info(f"Saved {len(all_chunks)} chunks to {output_path}")
    return all_chunks