/**
 * Vestora Frontend — Validation utility helpers.
 */

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate password strength (min 6 chars) */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/** Validate that a string is non-empty after trimming */
export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/** Validate file is an image */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/** Validate file size (default max 10MB) */
export function isValidFileSize(file: File, maxMB = 10): boolean {
  return file.size <= maxMB * 1024 * 1024;
}
