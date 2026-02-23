"""
Vestora Backend — Image utility helpers.
AWS S3 upload/download with signed URLs for private bucket access,
plus base64 encoding and image resizing.
"""

import asyncio
import base64
import uuid
from io import BytesIO

import boto3
from botocore.config import Config as BotoConfig
from PIL import Image

# Register HEIC support (pillow-heif plugin)
try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass

# Register AVIF support (pillow-avif-plugin)
try:
    import pillow_avif  # noqa: F401 — registers AVIF opener on import
except ImportError:
    pass

from app.config import settings


_s3_client = None


def _get_s3_client():
    """Return a cached boto3 S3 client (created once, reused)."""
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            config=BotoConfig(signature_version="s3v4"),
        )
    return _s3_client


# ---------------------------------------------------------------------------
# Format conversion — LLMs only support JPEG/PNG/GIF/WebP reliably
# ---------------------------------------------------------------------------

# Content types that need conversion to JPEG before sending to LLM
_NEEDS_CONVERSION = {
    "image/avif",
    "image/heic",
    "image/heif",
    "image/tiff",
    "image/bmp",
    "image/webp",
}


def normalize_image_for_llm(
    file_bytes: bytes,
    content_type: str,
) -> tuple[bytes, str, str]:
    """
    Convert unsupported image formats (AVIF, HEIC, WebP, TIFF, BMP) to JPEG.
    Returns (converted_bytes, new_content_type, file_extension).
    If the format is already supported (JPEG/PNG/GIF), returns as-is.
    """
    ct = (content_type or "").lower()
    if ct not in _NEEDS_CONVERSION:
        # Already a supported format — pass through
        ext = "jpg" if "jpeg" in ct or "jpg" in ct else ct.split("/")[-1] if "/" in ct else "jpg"
        return file_bytes, content_type, ext

    img = Image.open(BytesIO(file_bytes))
    # Convert to RGB if needed (RGBA → RGB for JPEG)
    if img.mode in ("RGBA", "P", "LA"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        background.paste(img, mask=img.split()[-1] if "A" in img.mode else None)
        img = background
    elif img.mode != "RGB":
        img = img.convert("RGB")

    buf = BytesIO()
    img.save(buf, format="JPEG", quality=92)
    return buf.getvalue(), "image/jpeg", "jpg"


# ---------------------------------------------------------------------------
# S3 Operations
# ---------------------------------------------------------------------------

async def upload_to_s3(
    file_bytes: bytes,
    key: str,
    content_type: str = "image/jpeg",
) -> str:
    """
    Upload file bytes to the private S3 bucket at the given key.
    Returns the S3 object key.
    """
    def _upload():
        s3 = _get_s3_client()
        s3.put_object(
            Bucket=settings.s3_bucket_name,
            Key=key,
            Body=file_bytes,
            ContentType=content_type,
        )
        return key
    return await asyncio.to_thread(_upload)


async def upload_thumbnail_to_s3(
    file_bytes: bytes,
    size: tuple[int, int] = (200, 200),
    folder: str = "thumbnails",
) -> str:
    """
    Create a thumbnail from image bytes and upload to S3.
    Returns the S3 object key.
    """
    img = Image.open(BytesIO(file_bytes))
    img.thumbnail(size)
    buffer = BytesIO()
    img.save(buffer, format="JPEG", quality=85)
    buffer.seek(0)
    key = f"{folder}/{uuid.uuid4().hex}.jpg"
    return await upload_to_s3(buffer.getvalue(), key, "image/jpeg")


def get_signed_url(key: str, expiry: int | None = None) -> str:
    """
    Generate a pre-signed GET URL for a private S3 object.
    The URL is valid for `expiry` seconds (default from settings).
    """
    s3 = _get_s3_client()
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.s3_bucket_name, "Key": key},
        ExpiresIn=expiry or settings.s3_signed_url_expiry,
    )


def get_signed_upload_url(
    key: str,
    content_type: str = "image/jpeg",
    expiry: int | None = None,
) -> str:
    """
    Generate a pre-signed PUT URL so the frontend can upload directly to S3.
    """
    s3 = _get_s3_client()
    return s3.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.s3_bucket_name,
            "Key": key,
            "ContentType": content_type,
        },
        ExpiresIn=expiry or settings.s3_signed_url_expiry,
    )


async def delete_from_s3(key: str) -> None:
    """Delete an object from S3 by key."""
    def _delete():
        s3 = _get_s3_client()
        s3.delete_object(Bucket=settings.s3_bucket_name, Key=key)
    await asyncio.to_thread(_delete)


# ---------------------------------------------------------------------------
# Base64 / Resize helpers (for AI processing)
# ---------------------------------------------------------------------------

def image_bytes_to_base64(file_bytes: bytes) -> str:
    """Encode raw image bytes to a base64 string."""
    return base64.b64encode(file_bytes).decode("utf-8")


def base64_to_image(b64_string: str) -> Image.Image:
    """Decode a base64 string into a PIL Image."""
    data = base64.b64decode(b64_string)
    return Image.open(BytesIO(data))


def resize_for_ai(file_bytes: bytes, max_size: int = 1024) -> str:
    """
    Resize image bytes for AI processing (to reduce token cost).
    Returns a base64-encoded resized JPEG string.
    """
    img = Image.open(BytesIO(file_bytes))
    img.thumbnail((max_size, max_size))
    buffer = BytesIO()
    img.save(buffer, format="JPEG", quality=90)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")
