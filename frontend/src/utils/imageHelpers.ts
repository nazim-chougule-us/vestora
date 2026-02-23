/**
 * Vestora Frontend — Image utility helpers.
 * Images are stored in a private S3 bucket and accessed via signed URLs.
 */

/** Convert a File to a base64 data URL string */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Resolve an image URL.
 * - If it's already a full URL (signed S3 URL or any https://), return as-is.
 * - If it's an S3 key, fetch a signed URL from the backend.
 */
export function getImageUrl(urlOrKey: string): string {
  if (urlOrKey.startsWith("http")) return urlOrKey;
  // For S3 keys, the backend should provide signed URLs in API responses.
  // This fallback constructs a request if needed.
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${base}/images/signed-url?key=${encodeURIComponent(urlOrKey)}`;
}

/** Create an object URL for local preview (remember to revoke after use) */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/** Revoke a previously created object URL to free memory */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/** Check if a signed URL has expired (S3 URLs contain X-Amz-Expires) */
export function isSignedUrlExpired(url: string): boolean {
  try {
    const parsed = new URL(url);
    const date = parsed.searchParams.get("X-Amz-Date");
    const expires = parsed.searchParams.get("X-Amz-Expires");
    if (!date || !expires) return false;
    const created = new Date(
      date.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, "$1-$2-$3T$4:$5:$6Z")
    );
    const expiryMs = created.getTime() + parseInt(expires) * 1000;
    return Date.now() > expiryMs;
  } catch {
    return false;
  }
}
