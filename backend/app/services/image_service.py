"""
Vestora Backend — us.inc Image Generation (usf-mini-image) integration service.
Handles AI image generation, background removal, and image editing.
"""

import httpx
from app.config import settings


async def generate_image(
    prompt: str,
    image_urls: list[str] | None = None,
    size: str = "1024x1024",
) -> str:
    """
    Generate or edit an image using the us.inc usf-mini-image model.
    Returns the URL or base64 of the generated image.
    """
    url = f"{settings.usinc_base_url}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.usinc_api_key}",
        "Content-Type": "application/json",
    }

    # Build user message content
    content = [{"type": "text", "text": prompt}]
    if image_urls:
        for img_url in image_urls:
            content.append({
                "type": "image_url",
                "image_url": {"url": img_url},
            })

    payload = {
        "model": settings.usinc_image_model,
        "messages": [
            {"role": "user", "content": content},
        ],
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()

    # Extract image URL from response
    message = data["choices"][0]["message"]
    if "content" in message and isinstance(message["content"], list):
        for block in message["content"]:
            if block.get("type") == "image_url":
                return block["image_url"]["url"]
    return message.get("content", "")


async def remove_background(image_url: str) -> str:
    """Remove the background from a clothing item image."""
    prompt = (
        "Remove the background from this clothing item image. "
        "Keep only the clothing item on a clean transparent/white background."
    )
    return await generate_image(prompt=prompt, image_urls=[image_url])
