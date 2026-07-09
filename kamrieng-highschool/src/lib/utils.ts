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
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
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

// ─── Locale helpers ───────────────────────────────────────────

export function getLocalizedText(
  kmText: string | null | undefined,
  enText: string | null | undefined,
  locale: string
): string {
  if (locale === "km") return kmText ?? enText ?? "";
  return enText ?? kmText ?? "";
}

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
