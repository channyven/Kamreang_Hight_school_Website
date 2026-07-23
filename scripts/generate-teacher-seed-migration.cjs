#!/usr/bin/env node

/**
 * Generate a SQL migration file (015_seed_teachers_data.sql) containing
 * INSERT statements for all 68 teachers currently in the Supabase DB.
 *
 * Usage:
 *   node scripts/generate-teacher-seed-migration.cjs
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// ── Load env vars ───────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local not found.");
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  const env = {};
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
  return env;
}

// ── SQL escaping helpers ────────────────────────────────────────

/** Escape a string value for SQL (single quotes + NULL handling) */
function esc(val) {
  if (val === null || val === undefined) return "NULL";
  const str = String(val).replace(/'/g, "''");
  return "'" + str + "'";
}

/** Format grade_levels integer array for PostgreSQL */
function fmtGrades(arr) {
  if (!arr || arr.length === 0) return "'{}'";
  return "'{" + arr.join(",") + "}'";
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  const env = loadEnv();
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Fetch all teachers ordered by sort_order
  console.log("📥 Fetching teachers from Supabase...");
  const { data: teachers, error } = await supabase
    .from("teachers")
    .select("*")
    .order("sort_order");

  if (error) {
    console.error("❌ Failed to fetch teachers:", error.message);
    process.exit(1);
  }
  console.log(`✅ Found ${teachers.length} teachers.\n`);

  // ── Build SQL ───────────────────────────────────────────────
  let sql = `-- ============================================================
-- Seed teachers data (${teachers.length} records)
-- Generated from the staff Excel spreadsheet imported via
-- scripts/import-teachers-from-excel.cjs
-- ============================================================

-- First, delete any existing seed teachers from the old migration
-- (007_admin_content_wiring.sql seeded 14 dummy teachers) so that
-- fresh runs of this migration replace them with the real records.
DELETE FROM teachers WHERE name_en = '' AND photo_url = '';

INSERT INTO teachers
  (name_km, name_en, subject_km, subject_en, department_km, department_en,
   qualification_km, qualification_en, photo_url, years_experience,
   grade_levels, phone, gender, is_active, sort_order)
VALUES
`;

  const rows = [];
  for (const t of teachers) {
    const vals = [
      esc(t.name_km),
      esc(t.name_en || ""),
      esc(t.subject_km || ""),
      esc(t.subject_en || ""),
      esc(t.department_km || ""),
      esc(t.department_en || ""),
      esc(t.qualification_km || ""),
      esc(t.qualification_en || ""),
      esc(t.photo_url || ""),
      t.years_experience != null ? t.years_experience : "NULL",
      fmtGrades(t.grade_levels),
      esc(t.phone || ""),
      esc(t.gender || ""),
      t.is_active ? "true" : "false",
      t.sort_order,
    ];
    rows.push("  (" + vals.join(", ") + ")");
  }

  sql += rows.join(",\n");
  sql += "\nON CONFLICT DO NOTHING;\n";

  // ── Write migration file ────────────────────────────────────
  const migPath = path.resolve(
    __dirname,
    "..",
    "supabase/migrations/015_seed_teachers_data.sql"
  );
  fs.writeFileSync(migPath, sql, "utf-8");
  console.log(`✅ Wrote ${teachers.length} teachers to supabase/migrations/015_seed_teachers_data.sql`);
  console.log("📋 Preview (first 2 lines of data):\n");
  console.log(rows.slice(0, 2).join(",\n"));
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
