import { createHmac, timingSafeEqual } from "crypto";

const SECRET =
  process.env.TRACKING_SECRET ||
  process.env.CRON_SECRET ||
  process.env.RESEND_API_KEY ||
  "dev-insecure-secret";

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function createTrackingToken(
  campaignId: string,
  email: string,
  expDays = 90,
): string {
  const exp = Math.floor(Date.now() / 1000) + expDays * 86400;
  const payload = `${campaignId}:${email.toLowerCase()}:${exp}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

export function verifyTrackingToken(
  token: string,
  campaignId: string,
  email: string,
): boolean {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return false;
    const payload = Buffer.from(encoded, "base64url").toString("utf8");
    const expected = sign(payload);
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return false;
    if (!timingSafeEqual(sigBuf, expBuf)) return false;

    const [cid, em, expStr] = payload.split(":");
    if (cid !== campaignId || em !== email.toLowerCase()) return false;
    const exp = Number(expStr);
    if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function createUnsubscribeToken(
  campaignId: string,
  email: string,
  expDays = 365,
): string {
  return createTrackingToken(campaignId, email, expDays);
}

export function verifyUnsubscribeToken(
  token: string,
  campaignId: string,
  email: string,
): boolean {
  return verifyTrackingToken(token, campaignId, email);
}
