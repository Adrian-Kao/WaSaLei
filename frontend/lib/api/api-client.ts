export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("user-storage");
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

export function apiFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = getStoredAuthToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = input.startsWith("http") ? input : `${API_BASE_URL}${input}`;
  return fetch(url, { ...init, headers });
}
