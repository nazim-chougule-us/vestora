/**
 * Vestora Frontend — Base API client.
 * Typed fetch wrapper with auth token handling, error normalization,
 * and base URL configuration.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Standard API error shape */
export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

/** Generic fetch wrapper with credentials and JSON handling */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Include auth token from localStorage if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Send httpOnly cookies
  });

  if (!response.ok) {
    let detail = "An unexpected error occurred";
    try {
      const errorBody = await response.json();
      detail = errorBody.detail || detail;
    } catch {
      // Response body wasn't JSON
    }

    // Auto-logout on 401 — clear stale tokens and redirect
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }

    throw new ApiError(response.status, detail);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/** API client methods */
export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),

  /** Upload a file via multipart/form-data */
  upload: <T>(endpoint: string, formData: FormData) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return fetch(url, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    }).then(async (res) => {
      if (!res.ok) {
        let detail = "Upload failed";
        try {
          const err = await res.json();
          detail = err.detail || detail;
        } catch {}
        throw new ApiError(res.status, detail);
      }
      return res.json() as Promise<T>;
    });
  },
};
