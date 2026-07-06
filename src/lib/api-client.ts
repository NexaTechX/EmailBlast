import { client } from "./neon";

/** Attach the current session JWT to server API requests. */
export async function authHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await client.auth.getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  return headers;
}

export async function postJson(path: string, body: unknown) {
  const headers = await authHeaders();
  const res = await fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    try {
      const parsed = JSON.parse(detail) as { error?: string };
      throw new Error(parsed.error || detail || `Request failed (${res.status})`);
    } catch (e) {
      if (e instanceof Error && e.message !== detail) throw e;
      throw new Error(detail || `Request failed (${res.status})`);
    }
  }
  return res.json();
}
