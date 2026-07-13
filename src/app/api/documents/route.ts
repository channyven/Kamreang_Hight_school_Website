import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/documents
 *
 * Returns all active documents from the existing `downloads` table,
 * joined with `download_categories`, sorted by newest first.
 */
export async function GET() {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("downloads")
      .select("*, category:download_categories(name_km, name_en, slug)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/documents error:", error);
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? [], { status: 200 });
  } catch (err) {
    console.error("GET /api/documents unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
