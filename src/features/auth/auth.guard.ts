import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";
import { getAdminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import type { SessionUser } from "@/types";

export async function requireAdmin(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    throw new Error("Unauthorized");
  }

  const auth = getAdminAuth();
  let decodedToken;
  try {
    // This is a Firebase *session cookie* (created via createSessionCookie
    // in the login route), not an ID token — it must be verified with
    // verifySessionCookie(), which checks the correct issuer. Using
    // verifyIdToken() here rejects every valid, active admin session.
    decodedToken = await auth.verifySessionCookie(sessionCookie.value);
  } catch {
    throw new Error("Unauthorized");
  }

  const supabase = createServerClient();
  const { data: user, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("firebase_uid", decodedToken.uid)
    .single();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  if (!user.is_active) {
    throw new Error("Account is deactivated");
  }

  return user as SessionUser;
}
