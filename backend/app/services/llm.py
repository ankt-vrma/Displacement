from functools import lru_cache

from langchain.chat_models import init_chat_model

from app.config import settings


@lru_cache
def get_llm(temperature: float = 0.2):
    return init_chat_model(
        settings.llm_model,
        model_provider=settings.llm_provider,
        temperature=temperature,
    )

def to_text(content) -> str:
    """Normalise LLM output: Gemini may return a list of content blocks, not a str."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
        return "".join(parts)
    return str(content)