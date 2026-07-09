import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";

const SESSION_COOKIE = "__session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 days

export async function POST(request: NextRequest) {
  try {
    const { idToken, firebase_uid } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    // Look up the user record using the service-role client (bypasses RLS)
    if (firebase_uid) {
      const supabase = createServerClient();
      const { data } = await supabase
        .from("admin_users")
        .select("*")
        .eq("firebase_uid", firebase_uid)
        .single();
      return NextResponse.json({ success: true, user: data ?? null });
    }

    return NextResponse.json({ success: true, user: null });
  } catch (error) {
    console.error("Session create error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ success: true });
}
