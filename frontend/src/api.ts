export type SessionUser = {
  id: string;
  name: string;
  email: string;
  workspace: { storage: "sqlite" | "mysql"; demo: boolean };
};
export type SessionResponse = {
  user: SessionUser | null;
  csrf_token: string | null;
};
let csrfToken: string | null = null;
export function setCSRFToken(value: string | null) {
  csrfToken = value;
}

/** Session cookies stay HttpOnly; the CSRF token is held only in memory. */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  const method = (options.method || "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "same-origin",
  });
  if (
    response.status === 401 &&
    !["/api/auth/login", "/api/auth/register"].includes(path)
  ) {
    setCSRFToken(null);
    window.dispatchEvent(new Event("schoolhouse:session-expired"));
    throw new Error("Your session expired. Sign in again to continue.");
  }
  return response;
}
