import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";
import { getAdminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 days

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Verify the Firebase ID token using Admin SDK
    const auth = getAdminAuth();
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (err) {
      // Log the real reason server-side only (never expose to the client).
      // Common codes: auth/argument-error = token from a different Firebase
      // project than the service account; auth/id-token-expired = clock
      // skew or stale token.
      const e = err as { code?: string; message?: string };
      console.error("Token verification failed:", e.code ?? "", e.message ?? err);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Look up the admin account BEFORE issuing a session cookie, so a
    // Firebase-authenticated user with no admin_users row (or an inactive
    // one) never receives a valid __session cookie in the first place.
    const supabase = createServerClient();
    const { data: user, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("firebase_uid", decodedToken.uid)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No matching admin_users row for this Firebase UID
        return NextResponse.json({ error: "No account found in the system" }, { status: 403 });
      }
      console.error("Supabase admin_users lookup error:", error);
      return NextResponse.json({ error: "Failed to verify account" }, { status: 500 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: "Account has been deactivated" }, { status: 403 });
    }

    // Create the session cookie now that we've confirmed an active admin
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE * 1000,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Session create error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ success: true });
}
