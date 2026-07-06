import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "drizzle", "migrations");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = neon(url);

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

console.log(`Applying ${files.length} migration file(s)...`);

for (const file of files) {
  const content = readFileSync(join(migrationsDir, file), "utf8");
  const statements = content
    .split(";")
    .map((s) =>
      // Strip full-line comments so a leading comment doesn't discard the
      // SQL that follows it within the same semicolon-delimited block.
      s
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter((s) => s.length > 0);

  console.log(`\n→ ${file} (${statements.length} statement(s))`);
  for (const statement of statements) {
    try {
      await sql.query(statement);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/already exists|duplicate column/i.test(msg)) {
        console.log("  (skipped — already applied)");
      } else {
        console.error(`  Failed: ${msg}`);
        process.exit(1);
      }
    }
  }
}

console.log("\nMigrations complete.");
