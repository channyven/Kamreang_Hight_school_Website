#!/usr/bin/env node

/**
 * Match teacher photos from the image folder to Supabase teacher records.
 *
 * Reads all image filenames from public/images/about/រូបភាពគ្រូវិទ្យាល័យកំរៀង/,
 * extracts the Khmer name from each filename, matches it against the
 * teacher name_km in Supabase, and updates the photo_url.
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// ── Config ──────────────────────────────────────────────────────
const IMAGE_DIR = path.resolve(
  __dirname,
  "..",
  "public",
  "images",
  "about",
  "រូបភាពគ្រូវិទ្យាល័យកំរៀង"
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

/**
 * Extract Khmer name from a filename like "2804 ឆោម ឆវន្ត.JPG"
 * Returns the Khmer name part: "ឆោម ឆវន្ត"
 */
function extractKhmerName(filename) {
  // Remove extension
  let name = filename.replace(/\.[^.]+$/, "");
  // Remove leading numbers and whitespace (e.g., "2804 ", "2805​ ")
  name = name.replace(/^[\d\s]+/, "");
  // Remove zero-width characters
  name = name.replace(/[\u200B-\u200D\uFEFF]/g, "");
  return name.trim();
}

/**
 * Normalize a Khmer name for comparison (remove extra spaces, zero-width chars)
 */
function normalizeName(name) {
  if (!name) return "";
  return name.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}

async function main() {
  // ── Read image directory ───────────────────────────────────
  console.log("📁 Reading image directory...");
  if (!fs.existsSync(IMAGE_DIR)) {
    console.error(`❌ Directory not found: ${IMAGE_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGE_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
  });

  console.log(`📸 Found ${files.length} image files.\n`);

  // ── Match photos to Khmer names ────────────────────────────
  const photoMap = new Map(); // normalized name → image filename
  for (const file of files) {
    const khmerName = extractKhmerName(file);
    if (khmerName) {
      const normalized = normalizeName(khmerName);
      photoMap.set(normalized, file);
    }
  }

  console.log(`📋 Extracted ${photoMap.size} Khmer names from filenames.\n`);

  // ── Connect to Supabase ────────────────────────────────────
  const env = loadEnv();
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: teachers, error } = await supabase
    .from("teachers")
    .select("id, name_km")
    .order("sort_order");

  if (error) {
    console.error("❌ Failed to fetch teachers:", error.message);
    process.exit(1);
  }
  console.log(`👩‍🏫 Fetched ${teachers.length} teachers from Supabase.\n`);

  // ── Match and update ───────────────────────────────────────
  let matched = 0;
  let updated = 0;
  let notFound = [];

  for (const teacher of teachers) {
    const normalized = normalizeName(teacher.name_km);
    const imageFile = photoMap.get(normalized);

    if (!imageFile) {
      // Try partial match — some filenames may have subtle differences
      let partialMatch = null;
      for (const [photoName, fileName] of photoMap) {
        // Check if one contains the other
        if (
          photoName.includes(normalized) ||
          normalized.includes(photoName)
        ) {
          partialMatch = fileName;
          // Prefer exact match
          if (photoName === normalized) break;
        }
      }

      if (partialMatch) {
        // Build the public URL path
        const photoUrl = `/images/about/រូបភាពគ្រូវិទ្យាល័យកំរៀង/${partialMatch}`;

        const { error: updateErr } = await supabase
          .from("teachers")
          .update({ photo_url: photoUrl })
          .eq("id", teacher.id);

        if (updateErr) {
          console.error(`  ❌ Failed to update "${teacher.name_km}": ${updateErr.message}`);
        } else {
          console.log(`  ✅ ${teacher.name_km} → ${partialMatch}`);
          updated++;
        }
        matched++;
      } else {
        notFound.push(teacher.name_km);
      }
      continue;
    }

    // Exact match found
    matched++;
    const photoUrl = `/images/about/រូបភាពគ្រូវិទ្យាល័យកំរៀង/${imageFile}`;

    const { error: updateErr } = await supabase
      .from("teachers")
      .update({ photo_url: photoUrl })
      .eq("id", teacher.id);

    if (updateErr) {
      console.error(`  ❌ Failed to update "${teacher.name_km}": ${updateErr.message}`);
    } else {
      console.log(`  ✅ ${teacher.name_km} → ${imageFile}`);
      updated++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total teachers: ${teachers.length}`);
  console.log(`   Matched photos: ${matched}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Not found: ${notFound.length}`);

  if (notFound.length > 0) {
    console.log(`\n   Teachers without matching photos:`);
    notFound.forEach((name) => console.log(`     - ${name}`));
  }

  console.log(`\n🎉 Done!`);
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
