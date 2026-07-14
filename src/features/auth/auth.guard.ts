import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";
import { getAdminAuth } from "@/lib/firebase-admin";
import type { SessionUser } from "@/types";

export async function requireAdmin(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session");

  if (!sessionCookie?.value) {
    throw new Error("Unauthorized");
  }

  const auth = getAdminAuth();
  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(sessionCookie.value);
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
