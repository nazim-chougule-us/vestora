"""
Vestora Backend — us.inc LLM (usf-mini) integration service.
Handles all text-based AI calls: clothing analysis, outfit reasoning,
style DNA, mood-to-style, forecasting, shopping, confidence correlation.
"""

import httpx
import json
import re
import logging
from app.config import settings

logger = logging.getLogger(__name__)


async def chat_completion(
    messages: list[dict],
    temperature: float = 0.7,
    max_tokens: int = 2048,
    web_search: bool = False,
) -> str:
    """
    Send a chat completion request to the us.inc usf-mini LLM.
    Returns the assistant's response text.
    """
    url = f"{settings.usinc_base_url}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.usinc_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.usinc_llm_model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if web_search:
        payload["web_search"] = True

    req_timeout = 300.0 if web_search else 60.0
    async with httpx.AsyncClient(timeout=req_timeout) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()

    return data["choices"][0]["message"]["content"]


def parse_ai_json(raw: str) -> dict | list:
    """
    Parse JSON from an LLM response. Handles:
    - ```json fences
    - Truncated JSON (missing closing braces/brackets)
    Raises json.JSONDecodeError if it still can't parse.
    """
    cleaned = raw.strip()
    fence_match = re.search(r"```(?:json)?\s*\n(.*?)```", cleaned, re.DOTALL)
    if fence_match:
        cleaned = fence_match.group(1).strip()
    elif cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    # Balance truncated braces/brackets
    open_braces = cleaned.count("{") - cleaned.count("}")
    open_brackets = cleaned.count("[") - cleaned.count("]")
    if open_brackets > 0:
        cleaned += "]" * open_brackets
    if open_braces > 0:
        cleaned += "}" * open_braces
    return json.loads(cleaned)


async def chat_completion_json(
    messages: list[dict],
    temperature: float = 0.7,
    max_tokens: int = 2048,
    web_search: bool = False,
    retries: int = 3,
) -> dict | list:
    """
    Call the LLM and parse JSON from the response.
    Retries up to `retries` times if JSON parsing fails.
    Raises on final failure.
    """
    last_raw = ""
    for attempt in range(retries):
        try:
            raw = await chat_completion(messages, temperature, max_tokens, web_search)
            last_raw = raw
            return parse_ai_json(raw)
        except json.JSONDecodeError:
            logger.warning("JSON parse failed (attempt %d/%d), retrying...", attempt + 1, retries)
        except Exception as e:
            logger.warning("LLM call failed (attempt %d/%d): %s", attempt + 1, retries, str(e))
            if attempt == retries - 1:
                raise
    # Final fallback
    raise json.JSONDecodeError("Failed to get valid JSON after retries", last_raw, 0)


async def analyze_clothing_multi(image_url: str) -> list[dict]:
    """
    Analyze ALL visible clothing items in an image.
    Returns a list of dicts, one per detected garment/shoe/accessory.
    """
    import json

    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert fashion analyst AI. Analyze the image and identify "
                "EVERY distinct clothing item, shoe, and accessory visible. "
                "For EACH item return an object with these exact keys:\n"
                "- category (string, e.g. 'T-Shirt', 'Jeans', 'Blazer', 'Sneakers', 'Watch')\n"
                "- subcategory (string, e.g. 'Crew Neck', 'Skinny', 'Double-Breasted')\n"
                "- primary_color (string)\n"
                "- secondary_color (string, or empty)\n"
                "- fabric (string, e.g. 'Cotton', 'Denim', 'Linen')\n"
                "- pattern (string, e.g. 'Solid', 'Striped', 'Plaid')\n"
                "- fit (string, e.g. 'Slim', 'Regular', 'Oversized')\n"
                "- brand (string, or empty if not visible)\n"
                "- condition (string: 'New', 'Good', 'Fair', 'Worn')\n"
                "- season (array of strings, e.g. ['Spring', 'Summer'])\n"
                "- occasion (array of strings, e.g. ['Casual', 'Work'])\n"
                "- formality_score (integer 1-10, 1=very casual, 10=black tie)\n\n"
                "Return a JSON ARRAY of objects — one per item. "
                "If only one item is visible, still return a single-element array.\n"
                "Example: [{...}, {...}]\n"
                "Return ONLY valid JSON, no extra text."
            ),
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": image_url},
                },
                {
                    "type": "text",
                    "text": (
                        "Identify and analyze EVERY clothing item, shoe, and accessory in this image. "
                        "Return a JSON array with one object per item. "
                        "Do NOT skip any visible garment (jacket, shirt, pants, shoes, belt, hat, etc.)."
                    ),
                },
            ],
        },
    ]
    try:
        parsed = await chat_completion_json(messages, temperature=0.3)
        if isinstance(parsed, dict):
            return [parsed]
        if isinstance(parsed, list):
            return parsed
        return [{"parse_error": True}]
    except (json.JSONDecodeError, Exception):
        return [{"parse_error": True}]


async def analyze_clothing(image_url: str) -> dict:
    """
    Analyze a single clothing image (backward compat).
    Returns the first detected item's attributes.
    """
    items = await analyze_clothing_multi(image_url)
    return items[0] if items else {"parse_error": True}


async def generate_outfit_reasoning(
    wardrobe_items: list[dict],
    occasion: str,
    mood: str | None = None,
    weather: dict | None = None,
    dress_code: str | None = None,
    user_preferences: dict | None = None,
    gender: str | None = None,
) -> dict:
    """
    Generate an outfit recommendation with AI reasoning.
    Returns outfit item IDs + explanation.
    """
    import json

    items_summary = json.dumps(
        [
            {
                "id": item.get("id"),
                "category": item.get("category"),
                "color": item.get("color_primary"),
                "fabric": item.get("fabric"),
                "pattern": item.get("pattern"),
                "fit": item.get("fit"),
                "style_tags": item.get("style_tags", []),
            }
            for item in wardrobe_items
        ],
        indent=2,
    )

    context_parts = [f"Occasion: {occasion}"]
    if gender:
        context_parts.append(f"Gender: {gender}")
    if mood:
        context_parts.append(f"Mood: {mood}")
    if weather:
        context_parts.append(f"Weather: {json.dumps(weather)}")
    if dress_code:
        context_parts.append(f"Dress code: {dress_code}")
    if user_preferences:
        context_parts.append(user_preferences if isinstance(user_preferences, str) else f"Style preferences: {json.dumps(user_preferences)}")

    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert personal stylist AI with emotional intelligence. "
                "Your reasoning should feel like advice from a thoughtful human stylist — "
                "warm, specific, and surprising. Explain WHY each piece works together "
                "and how the outfit will make the person feel.\n\n"
                "CRITICAL: You will receive wardrobe items, each with a unique \"id\" field. "
                "You MUST return a JSON object with:\n"
                "- selected_items: array of EXACT item ID strings copied from the input (e.g. [\"6798ab...\", \"6798cd...\"])\n"
                "- reasoning: detailed explanation of the outfit\n"
                "- confidence_boost: motivational note\n"
                "- styling_tips: array of 2-3 actionable tips\n\n"
                "The selected_items MUST contain only IDs that appear in the wardrobe list. "
                "Do NOT invent or modify IDs. Copy them exactly as provided. "
                "Return ONLY valid JSON, no extra text."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Here are my wardrobe items (use the exact \"id\" values in your response):\n{items_summary}\n\n"
                f"Context:\n" + "\n".join(context_parts) + "\n\n"
                "Select items from my wardrobe to create the perfect outfit. "
                "Return the selected_items as an array of the exact ID strings from the list above."
            ),
        },
    ]
    try:
        return await chat_completion_json(messages, temperature=0.7)
    except json.JSONDecodeError:
        return {"parse_error": True}
