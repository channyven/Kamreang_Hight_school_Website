import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Load the Firebase Admin SDK service-account credentials.
 *
 * Resolution order:
 * 1. `.firebase-service-account.json` in the project root (checked into gitignore).
 * 2. Individual env vars FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 *    (set in .env / .env.local).
 */
function loadCredential(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} {
  // 1) Try the JSON key file first (most reliable — no escape-soup issues)
  const keyPath = join(process.cwd(), ".firebase-service-account.json");
  if (existsSync(keyPath)) {
    const serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));
    console.log("[firebase-admin] Using .firebase-service-account.json");
    return {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    };
  }

  // 2) Fall back to individual env vars
  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials are missing. Either place a " +
      ".firebase-service-account.json in the project root, or set " +
      "FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY (and optionally " +
      "FIREBASE_PROJECT_ID) in .env.local. " +
      "Get them from Firebase Console → Project settings → Service accounts → " +
      "Generate new private key."
    );
  }

  console.log("[firebase-admin] Using env-var credentials");
  return { projectId, clientEmail, privateKey };
}

function getAdminAuth() {
  if (getApps().length === 0) {
    const cred = loadCredential();
    initializeApp({ credential: cert(cred) });
  }
  return getAuth();
}

export { getAdminAuth };
export type { Auth } from "firebase-admin/auth";
