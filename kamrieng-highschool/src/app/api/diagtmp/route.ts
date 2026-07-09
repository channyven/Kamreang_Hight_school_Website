import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getAdminAuth() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
      }),
    });
  }
  return getAuth();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "missing ?email=" }, { status: 400 });

  const auth = getAdminAuth();
  const userRecord = await auth.getUserByEmail(email);

  const supabase = createServerClient();
  const { data: existing, error: selectError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("firebase_uid", userRecord.uid)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json({ step: "select", error: selectError.message }, { status: 500 });
  }

  if (existing) {
    const { error } = await supabase
      .from("admin_users")
      .update({ role: "administrator", is_active: true })
      .eq("id", existing.id);
    if (error) return NextResponse.json({ step: "update", error: error.message }, { status: 500 });
    return NextResponse.json({ status: "updated existing row", uid: userRecord.uid, email });
  }

  const { error } = await supabase.from("admin_users").insert({
    firebase_uid: userRecord.uid,
    email,
    full_name: "Administrator",
    role: "administrator",
    is_active: true,
  });
  if (error) return NextResponse.json({ step: "insert", error: error.message }, { status: 500 });

  return NextResponse.json({ status: "created new row", uid: userRecord.uid, email });
}
