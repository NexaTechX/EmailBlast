export type MergeTagContext = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
};

export const MERGE_TAGS = [
  { tag: "{{first_name}}", label: "First name" },
  { tag: "{{last_name}}", label: "Last name" },
  { tag: "{{email}}", label: "Email" },
] as const;
