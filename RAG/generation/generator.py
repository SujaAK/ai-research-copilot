import os
from huggingface_hub import InferenceClient
from utils.config import Config
from utils.logger import get_logger
 
logger = get_logger("Generator")
 
 
class Generator:
    def __init__(self):
        self.client = InferenceClient(token=Config.HF_TOKEN)
        self.model = Config.LLM_MODEL
        self.max_context_chars = 6000
        self.max_new_tokens = int(os.getenv("MAX_NEW_TOKENS", 600))
 
    def _build_context(self, context_chunks: list) -> str:
        parts = []
        total = 0
 
        for chunk in context_chunks:
            text = chunk["content"] if isinstance(chunk, dict) else chunk.page_content
            if total + len(text) > self.max_context_chars:
                break
            parts.append(text)
            total += len(text)
 
        return "\n\n".join(parts)
 
    def generate_answer(self, query: str, context_chunks: list) -> str:
        context = self._build_context(context_chunks)
 
        if not context:
            return "No relevant context found in the paper."
 
        prompt = f"""[INST]
You are an expert AI research assistant.
 
Answer ONLY using the given context.
If the answer is not in context, say "Not found in the paper".
 
CONTEXT:
{context}
 
QUESTION:
{query}
 
Provide a clear, structured academic answer.
[/INST]"""
 
        try:
            response = self.client.text_generation(
                model=self.model,
                prompt=prompt,
                max_new_tokens=self.max_new_tokens,
                temperature=0.3,
                top_p=0.9
            )
            return response.strip()
 
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            return "Sorry, I encountered an error generating the answer. Please try again."