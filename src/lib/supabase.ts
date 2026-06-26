// Compatibility shim. The app was built on supabase-js; we now run on the Neon
// client (Neon Data API + Neon Auth via the SupabaseAuthAdapter), whose auth and
// query surfaces are API-compatible. Re-exporting it as `supabase` lets the
// existing data/auth call sites keep working unchanged. The real client lives in
// ./neon — this alias can be inlined later.
export { client as supabase } from "./neon";
