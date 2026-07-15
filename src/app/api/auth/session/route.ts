import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAdminAuth } from "@/lib/firebase-admin";

const SESSION_COOKIE = "__session";
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
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Look up the user record using the service-role client (bypasses RLS)
    const supabase = createServerClient();
    const { data } = await supabase
      .from("admin_users")
      .select("*")
      .eq("firebase_uid", decodedToken.uid)
      .single();

    // Attach the cookie DIRECTLY to the response so the browser
    // receives the Set-Cookie header.  Using cookies().set() in a
    // route handler can silently fail because NextResponse.json()
    // creates a fresh response object.
    const response = NextResponse.json({ success: true, user: data ?? null });
    response.cookies.set(SESSION_COOKIE, idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Session create error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
