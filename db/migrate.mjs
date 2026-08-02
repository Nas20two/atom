// Run Neon migrations locally or in CI:  npm run db:migrate
// Requires DATABASE_URL (or POSTGRES_URL) in the environment.
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("DATABASE_URL is not set — cannot run migrations.");
  process.exit(1);
}

const sql = neon(url);
const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "schema.sql");
const schema = readFileSync(file, "utf8");

// Split on statement-ending semicolons (schema has no functions/triggers).
const statements = schema
  .split(/;\s*(?:\r?\n|$)/)
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

for (const stmt of statements) {
  // eslint-disable-next-line no-await-in-loop
  await sql(stmt);
  console.log("applied:", stmt.split(/\s+/).slice(0, 4).join(" "), "...");
}

console.log("✅ Migration complete.");
