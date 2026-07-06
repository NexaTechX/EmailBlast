import type { VercelRequest } from "@vercel/node";
import { sql } from "./db";

export type AuthUser = { id: string; email?: string };

/** Extract Bearer token from Authorization header. */
export function getBearerToken(req: VercelRequest): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice(7).trim();
}

function decodeJwtPayload(token: string): { sub?: string; email?: string; exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/**
 * Validate session token by calling Neon Data API with the user's JWT.
 * RLS ensures only valid tokens succeed.
 */
export async function verifyAuthToken(
  token: string,
): Promise<AuthUser | null> {
  const dataApiUrl = (
    process.env.NEON_DATA_API_URL ||
    process.env.VITE_NEON_DATA_API_URL ||
    ""
  ).replace(/\/$/, "");

  const payload = decodeJwtPayload(token);
  if (!payload?.sub) return null;
  if (payload.exp && payload.exp * 1000 < Date.now()) return null;

  if (!dataApiUrl) {
    console.error("NEON_DATA_API_URL not configured");
    return null;
  }

  try {
    const res = await fetch(`${dataApiUrl}/profiles?select=id&limit=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return null;
    return { id: payload.sub, email: payload.email };
  } catch (err) {
    console.error("Token validation failed:", err);
    return null;
  }
}

/** Require authenticated user; returns 401 response body or user. */
export async function requireAuth(
  req: VercelRequest,
): Promise<{ user: AuthUser } | { status: number; error: string }> {
  const token = getBearerToken(req);
  if (!token) return { status: 401, error: "Missing Authorization header" };

  const user = await verifyAuthToken(token);
  if (!user) return { status: 401, error: "Invalid or expired token" };

  return { user };
}

/** Verify the campaign belongs to the authenticated user. */
export async function verifyCampaignOwnership(
  campaignId: string,
  userId: string,
): Promise<boolean> {
  const rows = await sql`
    select id from campaigns where id = ${campaignId} and user_id = ${userId} limit 1
  `;
  return rows.length > 0;
}
