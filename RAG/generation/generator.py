import os
import re
from openai import OpenAI
from utils.config import Config
from utils.logger import get_logger

logger = get_logger("Generator")


class Generator:
    def __init__(self):
        if not Config.HF_TOKEN:
            raise ValueError("HF_TOKEN is missing. Check your .env file.")

        # Use HF's OpenAI-compatible router endpoint.
        # This automatically picks the best available free provider for the model
        # (sambanova, cerebras, together, etc.) — no manual provider setup needed.
        self.client = OpenAI(
            base_url="https://router.huggingface.co/v1",
            api_key=Config.HF_TOKEN,
        )
        self.model = Config.LLM_MODEL

        self.max_context_chars = 6000
        self.max_new_tokens = int(os.getenv("MAX_NEW_TOKENS", 600))

    # ─────────────────────────────────────────
    # Internal helpers
    # ─────────────────────────────────────────

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

    def _call_llm(self, system_prompt: str, user_prompt: str, max_new_tokens: int = None) -> str:
        """
        Calls HF's OpenAI-compatible router (router.huggingface.co/v1).
        Automatically routes to the best free provider for the model —
        no third-party provider accounts or manual HF settings required.
        """
        tokens = max_new_tokens or self.max_new_tokens
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_prompt},
                ],
                max_tokens=tokens,
                temperature=0.3,
                top_p=0.9,
            )
            result = response.choices[0].message.content
            if not result or not result.strip():
                logger.error("Empty response from LLM")
                return ""
            return result.strip()
        except Exception as e:
            logger.error(f"LLM call failed: {str(e)}")
            raise

    # ─────────────────────────────────────────
    # Answer generation with inline citations
    # ─────────────────────────────────────────

    def generate_answer(self, query: str, context_chunks: list) -> dict:
        """
        Returns { "answer": str, "citations": List[int] }
        Citations are 0-based indices into context_chunks that were referenced.
        """
        if not context_chunks:
            return {
                "answer": "No relevant context found in the paper.",
                "citations": [],
            }

        numbered_parts = []
        for i, chunk in enumerate(context_chunks):
            text = chunk["content"] if isinstance(chunk, dict) else chunk.page_content
            numbered_parts.append(f"[{i+1}] {text}")

        context = "\n\n".join(numbered_parts)

        system_prompt = (
            "You are an expert AI research assistant. "
            "Answer ONLY using the numbered context passages provided. "
            "At the end of each sentence or claim, add a citation like [1] or [2] referencing the source number. "
            "If the answer is not in the context, say 'Not found in the paper'. "
            "Be clear, structured, and academic."
        )

        user_prompt = f"CONTEXT:\n{context}\n\nQUESTION:\n{query}"

        try:
            answer = self._call_llm(system_prompt, user_prompt)

            # Extract citation numbers, convert to 0-based indices
            cited = sorted(set(int(n) - 1 for n in re.findall(r"\[(\d+)\]", answer)))
            cited = [i for i in cited if 0 <= i < len(context_chunks)]

            return {"answer": answer, "citations": cited}

        except Exception as e:
            logger.error(f"Generation failed: {str(e)}")
            return {
                "answer": f"[GENERATION ERROR]: {str(e)}",
                "citations": [],
            }

    # ─────────────────────────────────────────
    # Auto-summarization
    # ─────────────────────────────────────────

    def generate_summary(self, chunks: list) -> str:
        """
        Generate a concise 3-4 sentence summary of the paper.
        Called once at ingest time.
        """
        if not chunks:
            return ""

        combined = ""
        for chunk in chunks:
            text = chunk.page_content if hasattr(chunk, "page_content") else chunk.get("content", "")
            combined += text + "\n\n"
            if len(combined) > 4000:
                break

        system_prompt = (
            "You are an expert academic summarizer. "
            "Write a concise 3-4 sentence summary covering: main topic, methodology, key findings, and significance. "
            "Be factual and precise. Output only the summary paragraph — no headings, no bullet points."
        )

        user_prompt = f"Summarize this research paper content:\n\n{combined[:4000]}"

        try:
            summary = self._call_llm(system_prompt, user_prompt, max_new_tokens=250)
            return summary
        except Exception as e:
            logger.error(f"Summarization failed: {str(e)}")
            return ""