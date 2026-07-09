const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

for (const line of fs.readFileSync(path.join(__dirname, ".env"), "utf-8").split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
}

const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { createClient } = require("@supabase/supabase-js");

const EMAIL = process.argv[2];
if (!EMAIL) {
  console.error("Usage: node scripts-tmp-bootstrap-admin.js <email>");
  process.exit(1);
}

function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  return Array.from(crypto.randomFillSync(new Uint8Array(16)))
    .map((b) => chars[b % chars.length])
    .join("");
}

async function main() {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
  const auth = getAuth();

  let userRecord;
  let password = null;
  try {
    userRecord = await auth.getUserByEmail(EMAIL);
    console.log(`Firebase user already exists: ${userRecord.uid}`);
  } catch (e) {
    if (e.code !== "auth/user-not-found") throw e;
    password = genPassword();
    userRecord = await auth.createUser({
      email: EMAIL,
      password,
      emailVerified: true,
    });
    console.log(`Created new Firebase user: ${userRecord.uid}`);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .eq("firebase_uid", userRecord.uid)
    .maybeSingle();

  if (existing) {
    console.log("admin_users row already exists for this UID, updating role/active status...");
    await supabase
      .from("admin_users")
      .update({ role: "administrator", is_active: true })
      .eq("id", existing.id);
  } else {
    const { error } = await supabase.from("admin_users").insert({
      firebase_uid: userRecord.uid,
      email: EMAIL,
      full_name: "Administrator",
      role: "administrator",
      is_active: true,
    });
    if (error) throw new Error(`Supabase insert failed: ${error.message}`);
    console.log("Inserted admin_users row.");
  }

  console.log("\n=== DONE ===");
  console.log("email:", EMAIL);
  console.log("uid:", userRecord.uid);
  if (password) console.log("password:", password);
  else console.log("password: (unchanged, user already existed in Firebase)");
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
