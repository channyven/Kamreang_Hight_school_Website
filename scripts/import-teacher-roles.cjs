#!/usr/bin/env node

/**
 * Import role (មុខងារ) data from the Excel file into the teachers table.
 *
 * Uses department_km field to store the role since it's currently unused
 * for imported teachers and avoids needing a DB migration.
 *
 * Usage:
 *   node scripts/import-teacher-roles.cjs
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { createClient } = require("@supabase/supabase-js");

const EXCEL_PATH = path.resolve(
  __dirname,
  "..",
  "data",
  "ស្ថិតិបុគ្គលិក (2).xls"
);
const SHEET_NAME = "វិទ្យាល័យ";

function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  const env = {};
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[k] = v;
  }
  return env;
}

// Role mapping: Khmer role → English role
const ROLE_MAP = {
  "នាយក": "Principal",
  "នាយករង": "Vice Principal",
  "លេខាធិការ": "Secretary",
  "ហេរញ្ញឹក": "Finance Officer",
  "បេឡា": "Cashier",
  "ប្រធានក្រុម": "Subject Group Leader",
  "បណ្ណារក្ស": "Librarian",
  "គ្រូបង្រៀន": "Teacher",
  "គ្រូ": "Teacher",
  "មន្រ្តីការិយាល័យ": "Office Staff",
  "យុវជន": "Youth Affairs Officer",
  "ស្មៀន": "Clerk",
};

function translateRole(km) {
  if (!km) return "Teacher";
  const trimmed = km.trim();
  return ROLE_MAP[trimmed] || "Teacher";
}

async function main() {
  console.log("📖 Reading Excel file...");
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[SHEET_NAME];
  if (!ws) {
    console.error(`❌ Sheet "${SHEET_NAME}" not found`);
    process.exit(1);
  }
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Build name → role map (data starts at row 8, column 6 = role)
  const roleMap = new Map();
  for (let i = 8; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[1]) continue;
    const nameKm = String(row[1]).trim();
    if (!nameKm) continue;
    const roleKm = row[6] ? String(row[6]).trim() : "";
    roleMap.set(nameKm, { role_km: roleKm, role_en: translateRole(roleKm) });
  }
  console.log(`✅ Found ${roleMap.size} staff with roles in Excel.\n`);

  // Connect to Supabase
  const env = loadEnv();
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Fetch all teachers
  const { data: teachers, error } = await supabase
    .from("teachers")
    .select("id, name_km, department_km");

  if (error) {
    console.error("❌ Failed to fetch teachers:", error.message);
    process.exit(1);
  }
  console.log(`👩‍🏫 Fetched ${teachers.length} teachers.\n`);

  // Update each teacher with their role
  let updated = 0;
  let skipped = 0;
  let missing = [];

  for (const teacher of teachers) {
    const match = roleMap.get(teacher.name_km);
    if (!match) {
      missing.push(teacher.name_km);
      skipped++;
      continue;
    }

    const { error: updateErr } = await supabase
      .from("teachers")
      .update({
        department_km: match.role_km,
        department_en: match.role_en,
      })
      .eq("id", teacher.id);

    if (updateErr) {
      console.error(`  ❌ Failed to update "${teacher.name_km}": ${updateErr.message}`);
      skipped++;
    } else {
      console.log(`  ✅ ${teacher.name_km} → ${match.role_km} (${match.role_en})`);
      updated++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total: ${teachers.length}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  if (missing.length > 0) {
    console.log(`\n   Missing from Excel:`);
    missing.forEach((n) => console.log(`     - ${n}`));
  }
  console.log(`\n🎉 Done!`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
