#!/usr/bin/env node

/**
 * Import teachers from the Excel file (ស្ថិតិបុគ្គលិក) into Supabase.
 *
 * Usage:
 *   node scripts/import-teachers-from-excel.cjs
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
const SHEET_NAME = "វិទ្យាល័យ"; // The sheet with actual data

// ── Load env vars ───────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local not found. Create it with SUPABASE_SERVICE_ROLE_KEY");
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
    // Remove surrounding quotes if any
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

// ── Parse grade level string like "10.11" or "7" into array [10, 11] or [7] ──
function parseGradeLevels(val) {
  if (val === null || val === undefined || val === "") return [];
  const str = String(val).trim();
  // Split by dot, comma, or hyphen
  const parts = str.split(/[.,\-\/\\]+/).map((p) => parseInt(p.trim(), 10));
  return parts.filter((n) => !isNaN(n) && n >= 7 && n <= 12);
}

// ── Normalize gender ────────────────────────────────────────────
function normalizeGender(val) {
  if (!val) return undefined;
  const g = String(val).trim();
  if (g === "ប្រុស") return "Male";
  if (g === "ស្រី") return "Female";
  return g;
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log("📖 Reading Excel file...");
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[SHEET_NAME];
  if (!ws) {
    console.error(`❌ Sheet "${SHEET_NAME}" not found. Sheets: ${wb.SheetNames.join(", ")}`);
    process.exit(1);
  }

  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log(`Total rows in sheet: ${rows.length}`);

  // Data rows start at index 8 (0-indexed). Headers are in rows 6-7.
  const DATA_START_ROW = 8;
  const teachers = [];

  for (let i = DATA_START_ROW; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[1]) continue; // Skip empty rows

    const nameKm = String(row[1] ?? "").trim();
    if (!nameKm) continue;

    const subjectKm = row[7] ? String(row[7]).trim() : "";
    const qualificationKm = row[4] ? String(row[4]).trim() : "";
    const phone = row[9] ? String(row[9]).trim() : "";
    const gender = normalizeGender(row[2]);
    const gradeLevels = parseGradeLevels(row[8]);

    const record = {
      name_km: nameKm,
      // name_en left empty — user chose to leave blank
      name_en: "",
      subject_km: subjectKm,
      subject_en: "",
      department_km: "",
      department_en: "",
      qualification_km: qualificationKm,
      qualification_en: "",
      // No photo_url — will use avatar fallback
      photo_url: "",
      years_experience: null,
      grade_levels: gradeLevels,
      is_active: true,
      sort_order: i - DATA_START_ROW + 1,
    };

    // phone and gender columns don't exist in the teachers table yet.
    // They are defined in the TypeScript type but need a DB migration.
    // Skipping them for now.

    teachers.push(record);
  }

  console.log(`\n✅ Parsed ${teachers.length} staff records from Excel.\n`);

  // Display first 3 as preview
  console.log("📋 Preview (first 3):");
  teachers.slice(0, 3).forEach((t, idx) => {
    console.log(`  ${idx + 1}. ${t.name_km} | ${t.subject_km || "—"} | Grades: [${t.grade_levels}] | ${t.phone || "—"}`);
  });
  console.log("");

  // ── Connect to Supabase ──────────────────────────────────────
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

  // ── Delete existing teachers ─────────────────────────────────
  console.log("🗑️  Deleting all existing teachers...");
  const { error: deleteError } = await supabase
    .from("teachers")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all

  if (deleteError) {
    console.error("❌ Failed to delete existing teachers:", deleteError.message);
    process.exit(1);
  }
  console.log("✅ Existing teachers deleted.");

  // ── Insert new teachers ──────────────────────────────────────
  console.log(`\n📥 Inserting ${teachers.length} teachers...`);

  // Insert in batches of 20
  const BATCH_SIZE = 20;
  let inserted = 0;
  for (let i = 0; i < teachers.length; i += BATCH_SIZE) {
    const batch = teachers.slice(i, i + BATCH_SIZE);
    const { error: insertError } = await supabase
      .from("teachers")
      .insert(batch);

    if (insertError) {
      console.error(`❌ Batch ${i / BATCH_SIZE + 1} failed:`, insertError.message);
      console.error("  First record in batch:", JSON.stringify(batch[0], null, 2));
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`  ✓ Inserted ${inserted}/${teachers.length}`);
  }

  console.log(`\n🎉 Successfully imported ${inserted} teachers into Supabase!`);
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
