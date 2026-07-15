import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
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
<<<<<<< Updated upstream
    
    } catch (error) {
    console.error("Firebase token verification error:", error);
=======
    } catch (err) {
      // Log the real reason server-side only (never expose to the client).
      // Common codes: auth/argument-error = token from a different Firebase
      // project than the service account; auth/id-token-expired = clock
      // skew or stale token.
      const e = err as { code?: string; message?: string };
      console.error("Token verification failed:", e.code ?? "", e.message ?? err);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
>>>>>>> Stashed changes

    return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
         );
       }
      // Create Firebase session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE * 1000,
    });

    // Save session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    // Look up the user record using the service-role client (bypasses RLS)
    const supabase = createServerClient();
    const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("firebase_uid", decodedToken.uid)
    .single();

    if (error) {
  console.error("Supabase error:", error);
}
    return NextResponse.json({ success: true, user: data ?? null });
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
