export const apiBase = "/api";
export const coachIdStorageKey = "coachos_coach_id";
export const authTokenStorageKey = "coachos_auth_token";

export function getStoredCoachId() {
  try { return localStorage.getItem(coachIdStorageKey); }
  catch { return null; }
}

export function getStoredAuthToken() {
  try { return localStorage.getItem(authTokenStorageKey); }
  catch { return null; }
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const coachId = getStoredCoachId();
  const token = getStoredAuthToken();
  const separator = path.includes("?") ? "&" : "?";
  const scopedPath = coachId ? `${path}${separator}coachId=${encodeURIComponent(coachId)}` : path;
  const authHeaders: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};
  const res = await fetch(`${apiBase}${scopedPath}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...authHeaders, ...(init?.headers ?? {}) }
  });
  if (!res.ok) throw new Error(`API error ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}
