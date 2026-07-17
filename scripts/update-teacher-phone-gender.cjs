#!/usr/bin/env node

/**
 * Apply migration and populate phone/gender from Excel data.
 *
 * This script:
 *   1. Attempts to run the SQL migration (ALTER TABLE) via Supabase.
 *   2. Then reads the Excel file and updates phone & gender for each teacher.
 *
 * Usage:
 *   node scripts/update-teacher-phone-gender.cjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { createClient } = require("@supabase/supabase-js");

// ── Config ──────────────────────────────────────────────────────
const EXCEL_PATH = path.resolve(
  __dirname,
  "..",
  "data",
  "ស្ថិតិបុគ្គលិក (2).xls"
);
const SHEET_NAME = "វិទ្យាល័យ";

// Path to migration file
const MIGRATION_PATH = path.resolve(
  __dirname,
  "..",
  "supabase/migrations/014_add_teacher_phone_gender.sql"
);

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
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

// ── Normalize gender ────────────────────────────────────────────
function normalizeGender(val) {
  if (!val) return null;
  const g = String(val).trim();
  if (g === "ប្រុស") return "Male";
  if (g === "ស្រី") return "Female";
  return g;
}

// ── Check columns exist, else print migration instructions ────
async function ensureColumns(supabase, supabaseUrl) {
  console.log("🔧 Checking if phone/gender columns exist...\n");

  // Try selecting the columns — PostgREST returns an error object if they don't exist
  const { error } = await supabase.from("teachers").select("phone, gender").limit(1);

  if (!error) {
    console.log("✅ Columns already exist, proceeding with data update.\n");
    return true;
  }

  // Columns are missing — print migration instructions
  const migrationSql = fs.readFileSync(MIGRATION_PATH, "utf-8");

  // Extract project ref from the Supabase URL
  const projectRef = (supabaseUrl || "").replace("https://", "").split(".")[0];
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;

  console.log("⚠️  The `phone` and `gender` columns are missing from the `teachers` table.\n");
  console.log("Please run this SQL in your Supabase SQL Editor:\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(migrationSql.trim());
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`\nOpen: ${sqlEditorUrl}`);
  console.log("Paste the SQL above and click 'Run'.\n");
  console.log("After running the SQL, re-run this script:\n");
  console.log("  node scripts/update-teacher-phone-gender.cjs\n");
  return false;
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  const env = loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── Step 1: Ensure columns exist ────────────────────────────
  const columnsOk = await ensureColumns(supabase, supabaseUrl);
  if (!columnsOk) {
    process.exit(1);
  }

  // ── Step 2: Read Excel & build lookup ───────────────────────
  console.log("📖 Reading Excel file...");
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[SHEET_NAME];
  if (!ws) {
    console.error(`❌ Sheet "${SHEET_NAME}" not found.`);
    process.exit(1);
  }
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const excelMap = new Map();
  for (let i = 8; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[1]) continue;
    const nameKm = String(row[1]).trim();
    if (!nameKm) continue;
    excelMap.set(nameKm, {
      phone: row[9] ? String(row[9]).trim() : null,
      gender: normalizeGender(row[2]),
    });
  }
  console.log(`✅ Parsed ${excelMap.size} staff records from Excel.\n`);

  // ── Step 3: Fetch all teachers ──────────────────────────────
  console.log("📥 Fetching teachers from Supabase...");
  const { data: teachers, error: fetchError } = await supabase
    .from("teachers")
    .select("id, name_km");

  if (fetchError) {
    console.error("❌ Failed to fetch teachers:", fetchError.message);
    process.exit(1);
  }
  console.log(`✅ Found ${teachers.length} teachers.\n`);

  // ── Step 4: Update each teacher ─────────────────────────────
  let updated = 0;
  let skipped = 0;

  for (const teacher of teachers) {
    const match = excelMap.get(teacher.name_km);
    if (!match || (!match.phone && !match.gender)) {
      skipped++;
      continue;
    }

    const updatePayload = {};
    if (match.phone) updatePayload.phone = match.phone;
    if (match.gender) updatePayload.gender = match.gender;

    const { error: updateError } = await supabase
      .from("teachers")
      .update(updatePayload)
      .eq("id", teacher.id);

    if (updateError) {
      console.error(`❌ Failed to update "${teacher.name_km}":`, updateError.message);
    } else {
      updated++;
    }
  }

  console.log(
    `\n🎉 Done! Updated ${updated} teachers, skipped ${skipped} (no match in Excel).`
  );
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
