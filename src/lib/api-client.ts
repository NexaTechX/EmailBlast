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
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      `Could not reach ${path}. For local /api routes, run \`npm run dev:api\` in a second terminal.`,
    );
  }
  const detail = await res.text().catch(() => "");
  if (!res.ok) {
    if (!detail) {
      throw new Error(
        `Request failed (${res.status}). If this is /api/*, start the API with \`npm run dev:api\`.`,
      );
    }
    try {
      const parsed = JSON.parse(detail) as { error?: string };
      throw new Error(parsed.error || detail || `Request failed (${res.status})`);
    } catch (e) {
      if (e instanceof Error && e.message !== detail) throw e;
      throw new Error(detail || `Request failed (${res.status})`);
    }
  }
  if (!detail) return {};
  try {
    return JSON.parse(detail);
  } catch {
    throw new Error(`Invalid JSON response from ${path}`);
  }
}
