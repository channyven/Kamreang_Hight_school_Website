"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  ArrowLeft, Printer, Download, Loader2, AlertTriangle,
  CheckCircle, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStudentById } from "@/actions/students";
import type { Student } from "@/types";
import { adminHref } from "@/utils";
import { getFullName } from "@/lib/student-card-format";
import StudentIdCard from "@/components/admin/students/StudentIdCard";

// ─── Props ─────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

// ─── Skeleton ──────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-school-blue-800 mx-auto mb-4" />
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
          <Button asChild className="bg-school-blue-800 hover:bg-school-blue-900">
            <Link href={adminHref(locale, "students")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const s = student;
  const fullName = getFullName(s);
  const isExpired = s.status !== "active";

  const handlePrint = () => window.print();

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
                className="h-9 gap-2 text-sm bg-school-blue-800 hover:bg-school-blue-900 shadow-sm"
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

          <div className="bg-school-blue-50 border border-school-blue-200 rounded-xl px-5 py-3">
            <div className="flex items-start gap-2">
              <Download className="w-4 h-4 text-school-blue-700 mt-0.5 shrink-0" />
              <p className="text-xs text-school-blue-800 leading-relaxed">
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
          <StudentIdCard student={s} />
        </div>
      </div>

      {/* ═══ STYLES ═══ */}
      <style jsx global>{`
        /* ── Print ─────────────────────────────────── */
        .no-print { display: block; }
        /* Try to size the printed page to the card itself (320x416px ≈
           85x110mm). "Save as PDF" honors this, but most physical printers
           ignore a custom @page size and fall back to their own default
           paper size (A4/Letter) — so we ALSO center the card on whatever
           page size actually gets used, instead of relying on the page
           shrinking to match it. */
        @page {
          size: 97mm 122mm;
          margin: 6mm;
        }
        @media print {
          .no-print { display: none !important; }
          html, body {
            height: 100% !important;
          }
          body {
            background: white !important;
            margin: 0 !important; padding: 0 !important;
          }
          /* The admin shell's <main> is the actual container around this
             page's content — reset its padding and center whatever's left
             (just the card, since .no-print hides the rest of this page
             and the sidebar/topbar hide themselves via their own print:hidden
             classes) on the page, regardless of what paper size the
             printer/driver actually ends up using. */
          main {
            padding: 0 !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-height: 100vh !important;
          }
          .print-section {
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
