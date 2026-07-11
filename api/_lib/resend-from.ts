/**
 * EmailBlast owns the Resend account and verified sending domain.
 * Users set a display name + reply-to; they never verify domains in Resend.
 */

export function getPlatformFromEmail(): string {
  const email =
    process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";
  return email;
}

export function buildSendIdentity(opts: {
  senderName?: string | null;
  replyToEmail?: string | null;
}): { from: string; reply_to?: string } {
  const platformEmail = getPlatformFromEmail();
  const name = opts.senderName?.trim();
  const from = name ? `${name} <${platformEmail}>` : platformEmail;

  const reply = opts.replyToEmail?.trim();
  if (reply && reply.toLowerCase() !== platformEmail.toLowerCase()) {
    return { from, reply_to: reply };
  }
  return { from };
}
