"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  ArrowLeft, Printer, Download, Loader2, AlertTriangle,
  CheckCircle, Clock, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStudentById } from "@/actions/students";
import type { Student } from "@/types";
import { adminHref } from "@/utils";

// ─── Props ─────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

function toKhmerNum(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => KHMER_DIGITS[Number(d)]);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "សកម្ម",
    inactive: "អសកម្ម",
    graduated: "បញ្ចប់",
    suspended: "ផ្អាក",
    transferred: "ផ្ទេរ",
    expelled: "បណ្តេញចេញ",
  };
  return labels[status] ?? status;
}

const PRINCIPAL_NAME = "អ៊ុង កន្ធារតនា";
const PRINCIPAL_NAME_EN = "UNG KANPUTHEARA";

// ─── Skeleton ──────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading student card...</p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────

export default function StudentCardPreviewPage({ params }: PageProps) {
  const { id } = use(params);
  const locale = useLocale();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getStudentById(id).then((data) => {
      if (!data) { setError(true); setLoading(false); return; }
      setStudent(data as Student);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <CardSkeleton />;

  if (error || !student) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center pb-12">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Student Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">The student you are looking for does not exist or has been removed.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href={adminHref(locale, "students")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const s = student;
  const fullName = `${s.english_first_name} ${s.english_last_name}`;
  const khmerName = s.khmer_first_name ? `${s.khmer_first_name} ${s.khmer_last_name ?? ""}` : null;
  const genderLabel = s.gender ? (s.gender === "male" ? "ប្រុស" : s.gender === "female" ? "ស្រី" : s.gender) : "—";
  const parentName = [s.father_name, s.mother_name].filter(Boolean).join(" / ") || "—";
  const isExpired = s.status !== "active";

  const handlePrint = () => window.print();

  const formatDateKhmer = (d: string | null | undefined) => {
    if (!d) return "—";
    try {
      const dt = new Date(d);
      const day = toKhmerNum(dt.getDate());
      const month = toKhmerNum(dt.getMonth() + 1);
      const year = toKhmerNum(dt.getFullYear());
      return `${day}/${month}/${year}`;
    } catch { return d; }
  };

  const address = [s.street_address, s.commune, s.district, s.province, s.village]
    .filter(Boolean).join(", ") || "—";

  const academicYearKhmer = s.academic_year
    ? `ឆ្នាំសិក្សា ${toKhmerNum(s.academic_year.replace(/\s*\/\s*|\s*–\s*|\s*-\s*/g, "–"))}`
    : "ឆ្នាំសិក្សា –";

  return (
    <>
      {/* ═══ PAGE UI (hidden during print) ═══ */}
      <div className="no-print">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
                  <Link href={adminHref(locale, "students")}>
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-sm font-semibold text-gray-900">Card for {fullName}</h1>
                  <p className="text-xs text-gray-400">Student ID Card Preview</p>
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                className="h-9 gap-2 text-sm bg-blue-600 hover:bg-blue-700 shadow-sm"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4" />
                Print / Save as PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Status & Helper */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {isExpired ? (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-800">This card has expired.</p>
                <p className="text-xs text-red-600 mt-0.5">
                  The student&apos;s academic year has ended. Status: <span className="font-medium capitalize">{s.status}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">This student card is valid.</p>
                <p className="text-xs text-green-600 mt-0.5">The student is currently active and enrolled.</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
            <div className="flex items-start gap-2">
              <Download className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Use your browser&apos;s print dialog and choose <strong>Save as PDF</strong> to download the card, or print it directly.
                Set scale to <strong>100%</strong> or <strong>Default</strong> for the best result.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ STUDENT ID CARD ═══ */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12 print-section">
        <div className="flex justify-center">
          <div className="card-cambodia">
            {/* ── Header ── */}
            <div className="cc-header">
              <div className="cc-header-left">
                <Image
                  src="/images/studentCard/logoCard.png"
                  alt="Ministry of Education Logo"
                  width={55}
                  height={55}
                  className="cc-ministry-logo"
                />
              </div>              <div className="cc-header-center">
                  <p className="cc-ministry-title">ព្រះរាជាណាចក្រកម្ពុជា</p>
                  <p className="cc-ministry-sub">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                  <p className="cc-school-name-kh">វិទ្យាល័យ កំរៀង</p>
                  <p className="cc-school-name-en">KAMRIENG HIGH SCHOOL</p>
                </div>
              <div className="cc-header-right">
                {s.qr_code ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={s.qr_code} alt="QR Code" className="cc-qr" />
                ) : (
                  <div className="cc-qr-placeholder">
                    <User className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <p className="cc-qr-label">ស្កេនដើម្បីផ្ទៀងផ្ទាត់</p>
              </div>
            </div>

            {/* ── Title ── */}
            <div className="cc-title-section">
              <h2 className="cc-title">បណ្ណសម្គាល់សិស្ស</h2>
              <p className="cc-academic-year">{academicYearKhmer}</p>
            </div>

            {/* ── Body (contains watermark) ── */}
            <div className="cc-body">
              {/* Watermark */}
              <div className="cc-watermark">
                <Image
                  src="/images/studentCard/logoCard.png"
                  alt=""
                  width={180}
                  height={180}
                  className="cc-watermark-img"
                />
              </div>

              {/* Student Info — Two Columns */}
              <div className="cc-info-grid">
                {/* Left Column */}
                <div className="cc-info-col">
                  <InfoFieldKh label="ឈ្មោះសិស្ស" value={fullName} />
                  <InfoFieldKh label="ឈ្មោះជាភាសាខ្មែរ" value={khmerName ?? "—"} />
                  <InfoFieldKh label="ថ្ងៃខែឆ្នាំកំណើត" value={formatDateKhmer(s.date_of_birth)} />
                  <InfoFieldKh label="ឈ្មោះមាតាបិតា" value={parentName} />
                  <InfoFieldKh label="លេខទូរស័ព្ទ" value={s.phone_number || "—"} />
                  <InfoFieldKh label="លេខកូដសិស្ស" value={s.student_id} code />
                </div>

                {/* Right Column */}
                <div className="cc-info-col">
                  <InfoFieldKh label="ភេទ" value={genderLabel} />
                  <InfoFieldKh label="ថ្នាក់/កម្រិត" value={s.class_name ?? "—"} />
                  <InfoFieldKh label="អាសយដ្ឋាន" value={address} />
                  <InfoFieldKh label="ឆ្នាំសិក្សា" value={s.academic_year ?? "—"} />
                </div>
              </div>

              {/* ── Bottom Section: Photo + Principal ── */}
              <div className="cc-bottom">
                {/* Student Photo */}
                <div className="cc-photo-section">
                  {s.photo ? (
                    <Image
                      src={s.photo}
                      alt={fullName}
                      width={110}
                      height={145}
                      className="cc-student-photo"
                    />
                  ) : (
                    <div className="cc-photo-placeholder">
                      <User className="w-10 h-10 text-blue-400" />
                      <span className="cc-photo-placeholder-text">រូបថត</span>
                    </div>
                  )}
                </div>

                {/* Principal Section */}
                <div className="cc-principal-section">
                  <div className="cc-principal-title">នាយកវិទ្យាល័យ</div>
                  <div className="cc-principal-sig-line" />
                  <p className="cc-principal-name">{PRINCIPAL_NAME}</p>
                  <p className="cc-principal-name-en">{PRINCIPAL_NAME_EN}</p>
                  <div className="cc-stamp">◎ ជា​ផ្លូវការ ◎</div>
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="cc-footer">
              <span className="cc-footer-text">
                ចេញផ្សាយ {new Date().toLocaleDateString("km-KH", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ STYLES ═══ */}
      <style jsx>{`
        /* ── Print ─────────────────────────────────── */
        :global(.no-print) { display: block; }
        @media print {
          :global(.no-print) { display: none !important; }
          :global(body) {
            background: white !important;
            margin: 0 !important; padding: 0 !important;
          }
          :global(.print-section) {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          :global(.card-cambodia) {
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          :global(.cc-header) {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          :global(.cc-watermark-img) {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          :global(.cc-title-section) {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          :global(.cc-stamp) {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        /* ── Card Container ───────────────────────── */
        .card-cambodia {
          width: 340px;
          min-height: 520px;
          background: white;
          border-radius: 16px;
          border: 1.5px solid #2563eb;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          font-family: 'Segoe UI', 'Khmer OS', Arial, sans-serif;
          position: relative;
        }

        /* ── Header ───────────────────────────────── */
        .cc-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px 14px 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .cc-header-left { flex-shrink: 0; }
        .cc-ministry-logo {
          width: 55px;
          height: 55px;
          object-fit: contain;
        }
        .cc-header-center {
          flex: 1;
          min-width: 0;
          text-align: center;
        }
        .cc-ministry-title {
          font-size: 10px;
          font-weight: 700;
          color: #1e3a8a;
          line-height: 1.2;
          letter-spacing: 0.3px;
        }
        .cc-ministry-sub {
          font-size: 8px;
          color: #6b7280;
          line-height: 1.2;
          margin-top: 1px;
        }
        .cc-school-name-kh {
          font-size: 11px;
          font-weight: 700;
          color: #1e40af;
          margin-top: 3px;
          line-height: 1.2;
        }
        .cc-school-name-en {
          font-size: 8px;
          font-weight: 600;
          color: #3b82f6;
          letter-spacing: 0.5px;
          margin-top: 1px;
        }
        .cc-header-right {
          flex-shrink: 0;
        }
        .cc-qr {
          width: 80px;
          height: 80px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          padding: 3px;
          background: white;
        }
        .cc-qr-label {
          text-align: center;
          font-size: 6px;
          color: #9ca3af;
          margin-top: 2px;
          letter-spacing: 0.3px;
        }
        .cc-qr-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 6px;
          background: #f9fafb;
          border: 1px dashed #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Title ────────────────────────────────── */
        .cc-title-section {
          text-align: center;
          padding: 6px 14px 4px;
          background: #fefce8;
          border-bottom: 1px solid #fde68a;
        }
        .cc-title {
          font-size: 16px;
          font-weight: 800;
          color: #f59e0b;
          letter-spacing: 0.5px;
        }
        .cc-academic-year {
          font-size: 10px;
          color: #92400e;
          font-weight: 500;
          margin-top: 1px;
        }

        /* ── Body ─────────────────────────────────── */
        .cc-body {
          padding: 10px 14px 8px;
          position: relative;
          min-height: 340px;
        }

        /* ── Watermark ────────────────────────────── */
        .cc-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 0;
          opacity: 0.08;
        }
        .cc-watermark-img {
          width: 180px;
          height: 180px;
          object-fit: contain;
        }

        /* ── Info Grid ────────────────────────────── */
        .cc-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 10px;
          position: relative;
          z-index: 1;
        }
        .cc-info-col {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        /* ── Bottom Section ───────────────────────── */
        .cc-bottom {
          display: flex;
          gap: 12px;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
          position: relative;
          z-index: 1;
        }

        /* Photo */
        .cc-photo-section {
          flex-shrink: 0;
        }
        .cc-student-photo {
          width: 110px;
          height: 145px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #2563eb;
        }
        .cc-photo-placeholder {
          width: 110px;
          height: 145px;
          border-radius: 8px;
          border: 2px dashed #93c5fd;
          background: #eff6ff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .cc-photo-placeholder-text {
          font-size: 10px;
          color: #60a5fa;
          font-weight: 500;
        }

        /* Principal */
        .cc-principal-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4px 0;
        }
        .cc-principal-title {
          font-size: 10px;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 4px;
        }
        .cc-principal-sig-line {
          width: 100%;
          max-width: 120px;
          height: 1.5px;
          background: #1e40af;
          margin-bottom: 3px;
        }
        .cc-principal-name {
          font-size: 11px;
          font-weight: 700;
          color: #111827;
        }
        .cc-principal-name-en {
          font-size: 8px;
          font-weight: 600;
          color: #6b7280;
          letter-spacing: 0.5px;
        }
        .cc-stamp {
          font-size: 9px;
          font-weight: 700;
          color: #dc2626;
          margin-top: 4px;
          letter-spacing: 1px;
          border: 1.5px solid #dc2626;
          border-radius: 4px;
          padding: 2px 8px;
        }

        /* ── Footer ───────────────────────────────── */
        .cc-footer {
          text-align: center;
          padding: 5px 14px;
          background: #f8fafc;
          border-top: 1px solid #e5e7eb;
        }
        .cc-footer-text {
          font-size: 7px;
          color: #9ca3af;
        }

        /* ── Responsive ───────────────────────────── */
        @media (max-width: 420px) {
          .card-cambodia {
            width: 100%;
            min-height: auto;
            max-width: 340px;
          }
          .cc-header { padding: 10px 10px 6px; gap: 4px; }
          .cc-ministry-logo { width: 45px; height: 45px; }
          .cc-ministry-title { font-size: 9px; }
          .cc-school-name-kh { font-size: 10px; }
          .cc-qr { width: 68px; height: 68px; }
          .cc-qr-placeholder { width: 68px; height: 68px; }
          .cc-body { padding: 8px 10px 6px; }
          .cc-title { font-size: 14px; }
          .cc-info-grid { gap: 2px 6px; }
          .cc-student-photo { width: 90px; height: 120px; }
          .cc-photo-placeholder { width: 90px; height: 120px; }
          .cc-principal-sig-line { max-width: 90px; }
          .cc-watermark-img { width: 130px; height: 130px; }
        }
      `}</style>
    </>
  );
}

// ─── Info Field Khmer Component ────────────────────────────────

function InfoFieldKh({ label, value, code }: { label: string; value: string; code?: boolean }) {
  return (
    <div className="cc-field">
      <span className="cc-field-label">{label}</span>
      <span className={`cc-field-value${code ? " cc-field-code" : ""}`}>{value}</span>
      <style jsx>{`
        .cc-field {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .cc-field-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          letter-spacing: 0.3px;
          line-height: 1.3;
        }
        .cc-field-value {
          font-size: 13px;
          font-weight: 500;
          color: #1f2937;
          line-height: 1.4;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .cc-field-code {
          font-family: "Courier New", monospace;
          font-size: 12px;
          font-weight: 600;
          color: #2563eb;
        }
      `}</style>
    </div>
  );
}
