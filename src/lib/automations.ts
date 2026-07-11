import { supabase } from "./supabase";

export type AutomationStep = {
  delay_hours: number;
  subject: string;
  content: string;
};

export type AutomationTrigger = {
  type: "subscriber_added";
  list_id: string;
};

export type AutomationActions = {
  steps: AutomationStep[];
};

export type AutomationRow = {
  id: string;
  campaign_id: string;
  name: string;
  triggers: AutomationTrigger[] | null;
  actions: AutomationActions | null;
  status: "draft" | "active" | "paused";
  created_at?: string;
  updated_at?: string;
};

function parseTriggers(raw: unknown): AutomationTrigger[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (t): t is AutomationTrigger =>
      !!t &&
      typeof t === "object" &&
      (t as AutomationTrigger).type === "subscriber_added" &&
      typeof (t as AutomationTrigger).list_id === "string",
  );
}

function parseActions(raw: unknown): AutomationActions {
  if (!raw || typeof raw !== "object") return { steps: [] };
  const steps = (raw as AutomationActions).steps;
  if (!Array.isArray(steps)) return { steps: [] };
  return {
    steps: steps.map((s) => ({
      delay_hours: Number(s.delay_hours) || 0,
      subject: String(s.subject || ""),
      content: String(s.content || ""),
    })),
  };
}

export async function listAutomations(): Promise<AutomationRow[]> {
  const { data, error } = await supabase
    .from("campaign_automations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    ...row,
    triggers: parseTriggers(row.triggers),
    actions: parseActions(row.actions),
  })) as AutomationRow[];
}

/** Enroll subscribers (by email) into active automations for a list. */
export async function enrollSubscribersInAutomations(
  listId: string,
  emails: string[],
): Promise<void> {
  if (!listId || emails.length === 0) return;

  const normalized = [
    ...new Set(emails.map((e) => e.toLowerCase().trim()).filter(Boolean)),
  ];

  const { data: automations, error: aErr } = await supabase
    .from("campaign_automations")
    .select("id, triggers, actions, status")
    .eq("status", "active");
  if (aErr) throw aErr;

  const matching = (automations || []).filter((a) => {
    const triggers = parseTriggers(a.triggers);
    return triggers.some(
      (t) => t.type === "subscriber_added" && t.list_id === listId,
    );
  });
  if (matching.length === 0) return;

  const { data: subs, error: sErr } = await supabase
    .from("subscribers")
    .select("id, email")
    .eq("list_id", listId)
    .in("email", normalized)
    .is("unsubscribed_at", null);
  if (sErr) throw sErr;
  if (!subs?.length) return;

  const rows: Array<{
    automation_id: string;
    subscriber_id: string;
    current_step: number;
    next_run_at: string;
    status: string;
  }> = [];

  for (const auto of matching) {
    const actions = parseActions(auto.actions);
    const firstDelay = actions.steps[0]?.delay_hours ?? 0;
    const nextRun = new Date(
      Date.now() + Math.max(0, firstDelay) * 60 * 60 * 1000,
    ).toISOString();

    for (const sub of subs) {
      rows.push({
        automation_id: auto.id,
        subscriber_id: sub.id,
        current_step: 0,
        next_run_at: nextRun,
        status: "active",
      });
    }
  }

  if (rows.length === 0) return;

  const { error: eErr } = await supabase
    .from("automation_enrollments")
    .upsert(rows, {
      onConflict: "automation_id,subscriber_id",
      ignoreDuplicates: true,
    });
  if (eErr) throw eErr;
}

export async function createAutomation(input: {
  name: string;
  listId: string;
  steps: AutomationStep[];
  senderName: string;
  senderEmail: string;
}): Promise<AutomationRow> {
  const { name, listId, steps, senderName, senderEmail } = input;
  if (!steps.length) throw new Error("Add at least one email step");

  const { data: campaign, error: cErr } = await supabase
    .from("campaigns")
    .insert([
      {
        title: `[Automation] ${name}`,
        subject: steps[0].subject,
        content: steps[0].content,
        sender_name: senderName,
        sender_email: senderEmail,
        status: "draft",
        list_id: listId,
        automation_enabled: true,
      },
    ])
    .select()
    .single();
  if (cErr) throw cErr;

  const { data, error } = await supabase
    .from("campaign_automations")
    .insert([
      {
        campaign_id: campaign.id,
        name,
        triggers: [{ type: "subscriber_added", list_id: listId }],
        actions: { steps },
        status: "draft",
      },
    ])
    .select()
    .single();
  if (error) throw error;

  return {
    ...data,
    triggers: parseTriggers(data.triggers),
    actions: parseActions(data.actions),
  } as AutomationRow;
}

export async function setAutomationStatus(
  id: string,
  status: "draft" | "active" | "paused",
): Promise<void> {
  const { error } = await supabase
    .from("campaign_automations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAutomation(id: string): Promise<void> {
  const { error } = await supabase
    .from("campaign_automations")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
