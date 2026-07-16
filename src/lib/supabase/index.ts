import { createClient } from "@supabase/supabase-js";

// Browser / public client (anon key — respects RLS)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Server-side admin client (service role — bypasses RLS).
 *
 * Reads env vars at CALL time (not module-load time) so Next.js can
 * resolve them from the correct env-file priority order
 * (.env.local > .env.development > .env).
 */
export function createServerClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Storage helpers
export function getPublicUrl(bucket: string, path: string): string {
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
