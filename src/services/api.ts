import axios, { AxiosError } from "axios";

export const API_BASE_URL: string =
  import.meta.env["VITE_API_BASE_URL"] || "http://localhost:8000/api/v1";
export const USE_MOCKS: boolean = (import.meta.env["VITE_USE_MOCKS"] ?? "true") === "true";
export const TOKEN_KEY = "flytogether_token";

export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      tokenStore.clear();
      if (!window.location.pathname.startsWith("/login")) window.location.assign("/login");
    }
    return Promise.reject(error);
  },
);

/** Error shape shared by mocks and the real API so components handle both identically. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;
  if (axios.isAxiosError(e)) {
    const detail = (e.response?.data as { detail?: unknown } | undefined)?.detail;
    return new ApiError(
      e.response?.status ?? 0,
      typeof detail === "string" ? detail : e.message || "Network error",
    );
  }
  return new ApiError(0, e instanceof Error ? e.message : "Unexpected error");
}

/** Runs the mock or the real call based on VITE_USE_MOCKS; always rejects with ApiError. */
export async function call<T>(mock: () => T | Promise<T>, real: () => Promise<T>): Promise<T> {
  try {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 250 + Math.random() * 350));
      return structuredClone(await mock());
    }
    return await real();
  } catch (e) {
    throw toApiError(e);
  }
}
