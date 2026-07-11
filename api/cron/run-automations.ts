import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { sql } from "../_lib/db";
import { injectTracking, APP_URL } from "../_lib/tracking";
import {
  assertCanSendEmails,
  FREE_MONTHLY_EMAIL_LIMIT,
} from "../_lib/plan-limits";
import { applyMergeTags } from "../_lib/merge-tags";
import { buildSendIdentity } from "../_lib/resend-from";

const resend = new Resend(process.env.RESEND_API_KEY);
const isProd = process.env.NODE_ENV === "production";

type Step = { delay_hours?: number; subject?: string; content?: string };

function parseSteps(actions: unknown): Step[] {
  if (!actions || typeof actions !== "object") return [];
  const steps = (actions as { steps?: Step[] }).steps;
  return Array.isArray(steps) ? steps : [];
}

/** GET|POST /api/cron/run-automations — process due drip enrollments. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (isProd && !cronSecret) {
    return res.status(500).json({ error: "CRON_SECRET must be set in production" });
  }
  if (cronSecret) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "RESEND_API_KEY not configured" });
  }

  try {
    const due = await sql`
      select e.id as enrollment_id, e.user_id, e.automation_id, e.subscriber_id,
             e.current_step, a.campaign_id, a.actions, a.status as automation_status,
             s.email as subscriber_email, s.first_name, s.last_name,
             c.sender_name, c.sender_email,
             p.mailing_address
      from automation_enrollments e
      join campaign_automations a on a.id = e.automation_id
      join subscribers s on s.id = e.subscriber_id
      join campaigns c on c.id = a.campaign_id
      left join profiles p on p.id = e.user_id
      where e.status = 'active'
        and a.status = 'active'
        and e.next_run_at <= now()
        and s.unsubscribed_at is null
      order by e.next_run_at asc
      limit 50
    `;

    let processed = 0;
    let skipped = 0;

    for (const row of due as Array<{
      enrollment_id: string;
      user_id: string;
      automation_id: string;
      subscriber_id: string;
      current_step: number;
      campaign_id: string;
      actions: unknown;
      subscriber_email: string;
      first_name: string | null;
      last_name: string | null;
      sender_name: string | null;
      sender_email: string;
      mailing_address: string | null;
    }>) {
      const claimed = await sql`
        update automation_enrollments
        set updated_at = now()
        where id = ${row.enrollment_id}
          and status = 'active'
          and next_run_at <= now()
        returning id, current_step
      `;
      if (claimed.length === 0) {
        skipped++;
        continue;
      }

      const steps = parseSteps(row.actions);
      const stepIndex = row.current_step;
      const step = steps[stepIndex];
      if (!step?.subject || !step?.content) {
        await sql`
          update automation_enrollments
          set status = 'completed', updated_at = now()
          where id = ${row.enrollment_id}
        `;
        continue;
      }

      if (!row.mailing_address?.trim()) {
        await sql`
          update automation_enrollments
          set status = 'failed', updated_at = now()
          where id = ${row.enrollment_id}
        `;
        continue;
      }

      try {
        await assertCanSendEmails(row.user_id, 1);
      } catch {
        console.error(
          `automation skip ${row.enrollment_id}: monthly limit ${FREE_MONTHLY_EMAIL_LIMIT}`,
        );
        skipped++;
        continue;
      }

      const identity = buildSendIdentity({
        senderName: row.sender_name,
        replyToEmail: row.sender_email,
      });
      const personalized = applyMergeTags(step.content, {
        email: row.subscriber_email,
        first_name: row.first_name,
        last_name: row.last_name,
      });
      const html = injectTracking(
        personalized,
        row.campaign_id,
        row.subscriber_email,
        APP_URL,
        row.mailing_address.trim(),
      );

      const { error } = await resend.emails.send({
        ...identity,
        to: row.subscriber_email,
        subject: step.subject,
        html,
        tags: [
          { name: "campaign_id", value: row.campaign_id },
          { name: "automation_id", value: row.automation_id },
        ],
      });

      if (error) {
        console.error("automation send error", error);
        await sql`
          update automation_enrollments
          set status = 'failed', updated_at = now()
          where id = ${row.enrollment_id}
        `;
        continue;
      }

      try {
        await sql`
          insert into campaign_analytics (campaign_id, email, event_type, metadata)
          values (
            ${row.campaign_id},
            ${row.subscriber_email},
            'sent',
            ${JSON.stringify({ automation_id: row.automation_id, step: stepIndex })}::jsonb
          )
        `;
      } catch (err) {
        console.error("automation sent analytics error", err);
      }

      const nextStep = stepIndex + 1;
      if (nextStep >= steps.length) {
        await sql`
          update automation_enrollments
          set current_step = ${nextStep}, status = 'completed', updated_at = now()
          where id = ${row.enrollment_id}
        `;
      } else {
        const delayHours = Math.max(0, Number(steps[nextStep].delay_hours) || 0);
        await sql`
          update automation_enrollments
          set current_step = ${nextStep},
              next_run_at = now() + make_interval(hours => ${delayHours}),
              updated_at = now()
          where id = ${row.enrollment_id}
        `;
      }
      processed++;
    }

    return res.status(200).json({ processed, skipped, due: due.length });
  } catch (err) {
    console.error("cron run-automations error", err);
    const message = err instanceof Error ? err.message : "Cron failed";
    return res.status(500).json({ error: message });
  }
}
