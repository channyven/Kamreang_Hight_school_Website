import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Provide helpful diagnostics when env vars are missing.
if (!supabaseUrl || !supabaseAnonKey) {
  const msg = `Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local and restart the dev server.`;
  if (process.env.NODE_ENV === "production") {
    throw new Error(msg);
  } else {
    // Log a clear warning in development to help debugging without crashing other pages.
    // Some parts of the app may still require Supabase; those will throw when used.
    // eslint-disable-next-line no-console
    console.warn(msg);
  }
}

// Browser / public client (anon key — respects RLS)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = supabaseUrl && supabaseAnonKey ? createClient<any>(supabaseUrl, supabaseAnonKey) : (null as any);

// Server-side admin client (service role — bypasses RLS)
// Only use in Server Actions / Route Handlers
export function createServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Supabase service role key or URL is not configured. Set SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in environment variables."
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Storage helpers
export function getPublicUrl(bucket: string, path: string): string {
  if (!supabase) return "";
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export const STORAGE_BUCKETS = {
  NEWS_IMAGES: "news-images",
  ACHIEVEMENT_IMAGES: "achievement-images",
  AVATARS: "school-avatars",
  SETTINGS: "settings-images",
  SCHOOL_IMAGES: "school-images",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];
