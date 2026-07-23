import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date helpers ─────────────────────────────────────────────

// Khmer numerals/month names are rendered manually rather than via
// `toLocaleDateString("km-KH", …)` because Intl's km-KH support is
// implementation-defined and varies between Node's ICU (server render)
// and a visitor's browser (client hydration). That mismatch produces a
// hydration error that forces React to discard and rebuild the tree,
// which in production can leave the router unable to navigate afterward.
const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

const KHMER_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ",
];

function toKhmerNumeral(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => KHMER_DIGITS[Number(d)]);
}

export function formatDate(
  date: string | Date | null | undefined,
  locale: string = "en"
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  if (locale === "km") {
    return `${toKhmerNumeral(d.getDate())} ${KHMER_MONTHS[d.getMonth()]} ${toKhmerNumeral(d.getFullYear())}`;
  }
  return format(d, "MMMM d, yyyy");
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatShortDate(date: string | Date, locale = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (locale === "km") {
    return `${toKhmerNumeral(d.getDate())} ${KHMER_MONTHS[d.getMonth()]} ${toKhmerNumeral(d.getFullYear())}`;
  }
  return format(d, "MMM d, yyyy");
}

// ─── String helpers ───────────────────────────────────────────

export function slugify(text: string): string {
  let slug = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  if (!slug) {
    slug = "post-" + Array.from(text).reduce((acc, ch) => acc + ch.charCodeAt(0), 0).toString(36);
  }
  return slug;
}

export function truncate(text: string, length: number): string {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "…";
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

// ─── File helpers ─────────────────────────────────────────────

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function getFileIcon(fileType: string | null | undefined): string {
  if (!fileType) return "file";
  if (fileType.includes("pdf")) return "file-text";
  if (fileType.includes("word") || fileType.includes("document"))
    return "file-text";
  if (fileType.includes("excel") || fileType.includes("spreadsheet"))
    return "table";
  if (fileType.includes("image")) return "image";
  return "file";
}

// ─── Number helpers ───────────────────────────────────────────

export function formatNumber(n: number, locale = "en"): string {
  const grouped = n.toLocaleString("en-US");
  return locale === "km" ? toKhmerNumeral(grouped) : grouped;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ─── URL helpers ──────────────────────────────────────────────

export function buildStorageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${path}`;
}

/**
 * Convert a Google Drive share link to a proxied image URL suitable
 * for <img> or Next.js <Image>.
 *
 * The returned URL goes through our API proxy which fetches the image
 * server-side (avoiding Google's hotlink blocking) and returns it as
 * a same-origin response.
 *
 * Uses Google's thumbnail endpoint internally — it returns a 302 redirect
 * to the raw image that fetch() follows automatically.
 *
 * The file MUST be publicly shared ("Anyone with the link can view").
 *
 * Accepted input formats:
 *   https://drive.google.com/file/d/FILE_ID/view
 *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   https://drive.google.com/open?id=FILE_ID
 *   https://drive.google.com/uc?id=FILE_ID
 *   https://drive.google.com/uc?export=download&id=FILE_ID
 *   https://drive.google.com/thumbnail?id=FILE_ID&sz=...
 *   https://drive.usercontent.google.com/download?id=FILE_ID&export=view
 *   https://lh3.googleusercontent.com/d/FILE_ID=...
 *
 * If the input is not a recognised Google Drive link, returns it unchanged.
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return url;

  // Already a proxied URL — return as-is
  if (url.startsWith("/api/proxy-image?url=")) {
    return url;
  }

  // Already a known direct format — return as-is
  if (
    url.startsWith("https://drive.google.com/thumbnail?id=") ||
    url.startsWith("https://drive.usercontent.google.com/download?id=") ||
    url.startsWith("https://lh3.googleusercontent.com/d/")
  ) {
    return url;
  }

  // Extract the file ID from various Google Drive URL patterns
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) {
    return url;
  }

  // Google Drive blocks hotlinking when browsers send Sec-Fetch-* headers.
  // Serve the image through our own API proxy which fetches it server-side
  // (without those headers) and returns it as a same-origin response.
  const directUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=view`;
  return `/api/proxy-image?url=${encodeURIComponent(directUrl)}`;
}

/**
 * Extract the file ID from a Google Drive URL.
 * Returns null if no recognised pattern is found.
 */
function extractGoogleDriveFileId(url: string): string | null {
  // Pattern 1: /file/d/FILE_ID/view or /file/d/FILE_ID/view?whatever
  const fileMatch = url.match(
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_\-.]+)\//
  );
  if (fileMatch) return fileMatch[1];

  // Pattern 2: /open?id=FILE_ID
  const queryIdMatch = url.match(/[?&]id=([a-zA-Z0-9_\-.]+)/);
  if (queryIdMatch) {
    const beforeQuery = url.split("?")[0] || "";
    if (
      beforeQuery.endsWith("/open") ||
      beforeQuery.endsWith("/uc") ||
      beforeQuery.endsWith("/download") ||
      beforeQuery.endsWith("/thumbnail")
    ) {
      return queryIdMatch[1];
    }
  }

  // Pattern 3: lh3.googleusercontent.com/d/FILE_ID or .../FILE_ID=w...
  const lhMatch = url.match(
    /lh\d+\.googleusercontent\.com\/d\/([a-zA-Z0-9_\-]+)/
  );
  if (lhMatch) return lhMatch[1];

  return null;
}


// ─── Locale helpers ───────────────────────────────────────────

export function getLocalizedText(
  kmText: string | null | undefined,
  enText: string | null | undefined,
  locale: string
): string {
  if (locale === "km") return kmText ?? enText ?? "";
  return enText ?? kmText ?? "";
}

// ─── Avatar helper ────────────────────────────────────────────

/**
 * Generate a placeholderc avatar URL using ui-avatars.com.
 * Renders the initials of the given name over a school-branded background.
 * Swap this for real photo URLs once actual images are available.
 */
export function getAvatarUrl(
  name: string | null | undefined,
  size: number = 96,
  bg: string = "1e3a8a",
  fg: string = "fff"
): string {
  const safeName = encodeURIComponent(name?.trim() || "?");
  return `https://ui-avatars.com/api/?name=${safeName}&background=${bg}&color=${fg}&size=${size}&font-size=0.5&bold=true&format=png`;
}

// ─── Admin path helper (security-by-obscurity) ───────────────

export { ADMIN_PATH, adminHref } from "@/lib/admin-path";

// ─── Misc ─────────────────────────────────────────────────────

export function generateUniqueSlug(base: string, existing: string[]): string {
  const slug = slugify(base);
  if (!existing.includes(slug)) return slug;
  let counter = 1;
  while (existing.includes(`${slug}-${counter}`)) counter++;
  return `${slug}-${counter}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
