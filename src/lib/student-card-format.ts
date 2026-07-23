import { fromDate } from "@thyrith/momentkh";
import type { Student } from "@/types";

const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

const GREGORIAN_MONTHS_KH = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ",
];

/** Converts ASCII digits in a string/number to Khmer numerals. */
export function toKhmerNum(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => KHMER_DIGITS[Number(d)]);
}

/** Formats a date as DD/MM/YYYY using Khmer numerals. */
export function formatDateKhmer(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    const day = toKhmerNum(dt.getDate());
    const month = toKhmerNum(dt.getMonth() + 1);
    const year = toKhmerNum(dt.getFullYear());
    return `${day}/${month}/${year}`;
  } catch {
    return d;
  }
}

export function getGenderLabelKh(gender: string | null | undefined): string {
  if (!gender) return "—";
  if (gender === "male") return "ប្រុស";
  if (gender === "female") return "ស្រី";
  return gender;
}

export function getAddress(s: Student): string {
  return (
    [s.street_address, s.commune, s.district, s.province, s.village]
      .filter(Boolean)
      .join(", ") || "—"
  );
}

export function getAcademicYearKh(academicYear: string | null | undefined): string {
  return academicYear
    ? `ឆ្នាំសិក្សា ${toKhmerNum(academicYear.replace(/\s*\/\s*|\s*–\s*|\s*-\s*/g, "–"))}`
    : "ឆ្នាំសិក្សា –";
}

export function getFullName(s: Student): string {
  return `${s.english_first_name} ${s.english_last_name}`;
}

export function getKhmerName(s: Student): string | null {
  return s.khmer_first_name ? `${s.khmer_first_name} ${s.khmer_last_name ?? ""}` : null;
}

/** Full Khmer lunar calendar date, e.g. "ថ្ងៃសៅរ៍ ១១កើត ខែកត្ដិក ឆ្នាំម្សាញ់ សប្តស័ក ព.ស.២៥៦៩" */
export function getLunarDateKh(date: Date): string {
  const { khmer } = fromDate(date);
  return `ថ្ងៃ${khmer.dayOfWeekName} ${toKhmerNum(khmer.day)}${khmer.moonPhaseName} ខែ${khmer.monthName} ឆ្នាំ${khmer.animalYearName} ${khmer.sakName} ព.ស.${toKhmerNum(khmer.beYear)}`;
}

/** Gregorian date in Khmer, e.g. "ថ្ងៃទី ១ ខែវិច្ឆិកា ឆ្នាំ២០២៥" */
export function getGregorianDateKh(date: Date): string {
  const monthName = GREGORIAN_MONTHS_KH[date.getMonth()];
  return `ថ្ងៃទី ${toKhmerNum(date.getDate())} ខែ${monthName} ឆ្នាំ${toKhmerNum(date.getFullYear())}`;
}
