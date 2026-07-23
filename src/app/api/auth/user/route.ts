import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth-guard";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firebase_uid } = await request.json();
    if (!firebase_uid) {
      return NextResponse.json({ error: "Missing firebase_uid" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("firebase_uid", firebase_uid)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
