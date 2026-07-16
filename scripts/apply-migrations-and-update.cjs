#!/usr/bin/env node

/**
 * Apply migration 014 (add phone/gender columns) and update phone/gender data.
 *
 * This script:
 *   1. Checks if phone/gender columns exist
 *   2. If not, attempts to add them (via pg module or prints instructions)
 *   3. Populates phone & gender from the Excel file into existing teacher records
 *
 * Usage:
 *   node scripts/apply-migrations-and-update.cjs
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

const MIGRATION_014_SQL = `-- ============================================================
-- Add phone & gender columns to teachers table
-- ============================================================
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS gender TEXT;`;

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

// ── Normalize gender ────────────────────────────────────────────
function normalizeGender(val) {
  if (!val) return null;
  const g = String(val).trim();
  if (g === "ប្រុស") return "Male";
  if (g === "ស្រី") return "Female";
  return g;
}

// ── Check columns via Supabase client ──────────────────────────
async function checkColumnsExist(supabase) {
  const { error } = await supabase.from("teachers").select("phone, gender").limit(1);
  return !error;
}

// ── Try to run migration via pg module ──────────────────────────
async function tryApplyMigration(supabaseUrl, serviceKey) {
  // Extract project ref from URL
  const projectRef = (supabaseUrl || "")
    .replace("https://", "")
    .split(".")[0];

  // Try different common Supabase regions for the connection pooler
  const regions = [
    "us-east-1",
    "us-east-2",
    "us-west-1",
    "us-west-2",
    "eu-west-1",
    "eu-central-1",
    "ap-southeast-1",
    "ap-southeast-2",
    "ap-northeast-1",
  ];

  for (const region of regions) {
    const connString = `postgresql://postgres.${projectRef}:${encodeURIComponent(serviceKey)}@aws-0-${region}.pooler.supabase.co:6543/postgres?pgbouncer=true`;

    try {
      const { Pool } = require("pg");
      const pool = new Pool({ connectionString: connString, max: 1, connectionTimeoutMillis: 3000 });
      const client = await pool.connect();
      await client.query(MIGRATION_014_SQL);
      client.release();
      await pool.end();
      return true;
    } catch {
      // Try next region
    }
  }
  return false;
}

// ── Print migration instructions ────────────────────────────────
function printMigrationInstructions(supabaseUrl) {
  const projectRef = (supabaseUrl || "")
    .replace("https://", "")
    .split(".")[0];
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;

  console.log("⚠️  Could not apply migration automatically via database connection.\n");
  console.log("Please run this SQL in your Supabase SQL Editor:\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(MIGRATION_014_SQL.trim());
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`\n📎 ${sqlEditorUrl}`);
  console.log("Paste the SQL above and click 'Run'.\n");
  console.log("Then re-run this script:\n");
  console.log("  node scripts/apply-migrations-and-update.cjs\n");
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log("=== Apply Migration 014 + Update Phone/Gender ===\n");

  const env = loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("❌ Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── Step 1: Check / apply migration ─────────────────────────
  console.log("🔧 Checking if phone/gender columns exist...");
  const columnsExist = await checkColumnsExist(supabase);

  if (columnsExist) {
    console.log("✅ Columns already exist.\n");
  } else {
    console.log("📦 Columns missing. Attempting to add via database connection...\n");
    const applied = await tryApplyMigration(supabaseUrl, serviceKey);

    if (!applied) {
      printMigrationInstructions(supabaseUrl);
      process.exit(1);
    }
    console.log("✅ Migration applied successfully.\n");
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

  // ── Step 3: Fetch all teachers from Supabase ────────────────
  console.log("📥 Fetching teachers from Supabase...");
  const { data: teachers, error: fetchError } = await supabase
    .from("teachers")
    .select("id, name_km");

  if (fetchError) {
    console.error("❌ Failed to fetch teachers:", fetchError.message);
    process.exit(1);
  }
  console.log(`✅ Found ${teachers.length} teachers.\n`);

  // ── Step 4: Update phone & gender ───────────────────────────
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
    `\n🎉 Done! Updated ${updated} teachers, skipped ${skipped} (no Excel match).`
  );
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
