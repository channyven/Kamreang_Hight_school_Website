import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth-guard";

/**
 * Simple in-memory rate limiter for API routes
 */
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60 * 1000; // 1 minute
  const maxRequests = 30; // 30 requests per minute
  
  const record = rateLimiter.get(ip);
  if (!record || now > record.resetTime) {
    rateLimiter.set(ip, { count: 1, resetTime: now + window });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * GET /api/documents
 *
 * Returns all active documents from the existing `downloads` table,
 * joined with `download_categories`, sorted by newest first.
 * This endpoint is public but rate-limited to prevent abuse.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting based on IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

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

    // Add cache headers for better performance
    return NextResponse.json(data ?? [], { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
      }
    });
  } catch (err) {
    console.error("GET /api/documents unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
