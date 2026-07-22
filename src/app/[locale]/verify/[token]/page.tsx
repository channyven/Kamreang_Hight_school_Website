import { createServerClient } from "@/lib/supabase";
import type { Student } from "@/types";

import Image from "next/image";
import {
  User, GraduationCap, CreditCard, QrCode, CheckCircle, AlertTriangle,
} from "lucide-react";
import { formatDate } from "@/utils";

interface PageProps {
  params: Promise<{ token: string; locale: string }>;
}

async function getStudentByToken(token: string): Promise<Student | null> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("students")
    .select("*")
    .eq("qr_token", token)
    .single();
  return data as Student | null;
}

export default async function VerifyStudentPage({ params }: PageProps) {
  const { token, locale } = await params;
  const student = await getStudentByToken(token);

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Student Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            This QR code does not match any student record. It may have been deactivated or the link is invalid.
          </p>
          <p className="text-xs text-gray-400">
            Please contact the school administration for assistance.
          </p>
        </div>
      </div>
    );
  }

  const s = student;

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    graduated: "bg-blue-100 text-blue-800",
    suspended: "bg-yellow-100 text-yellow-800",
    transferred: "bg-purple-100 text-purple-800",
    expelled: "bg-red-100 text-red-800",
  };

  const InfoField = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div className="border-b border-gray-100 pb-3 last:border-0">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-900">{value ?? "—"}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <CheckCircle className="w-3.5 h-3.5" />
            Verified Student
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Student Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Official student record — scanned from QR code</p>
        </div>

        {/* Verified Badge */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-20 relative">
            <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-[10px] text-white font-mono font-bold tracking-wider uppercase">
                Verified
              </span>
            </div>
          </div>

          <div className="px-6 pb-6">
            {/* Photo & Name */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-10 mb-6">
              <div className="shrink-0 ring-4 ring-white rounded-full">
                {s.photo ? (
                  <Image
                    src={s.photo}
                    alt={`${s.english_first_name} ${s.english_last_name}`}
                    width={88}
                    height={88}
                    className="w-22 h-22 sm:w-24 sm:h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <User className="w-9 h-9 text-blue-500" />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900">
                  {s.english_first_name} {s.english_last_name}
                </h2>
                {s.khmer_first_name && (
                  <p className="text-sm text-gray-500 font-khmer">
                    {s.khmer_first_name} {s.khmer_last_name}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
                  <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 font-semibold">
                    <QrCode className="w-3 h-3 inline mr-1" />
                    {s.student_id}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[s.status] ?? "bg-gray-100 text-gray-800"}`}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-500" /> Personal Information
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <InfoField label="Gender" value={s.gender ? s.gender.charAt(0).toUpperCase() + s.gender.slice(1) : null} />
                  <InfoField label="Date of Birth" value={s.date_of_birth ? formatDate(s.date_of_birth, locale) : null} />
                  <InfoField label="Phone" value={s.phone_number} />
                  <InfoField label="Email" value={s.email} />
                  <InfoField label="Address" value={
                    [s.street_address, s.commune, s.district, s.province, s.village].filter(Boolean).join(", ")
                  } />
                </div>
              </div>

              {/* Academic Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-500" /> Academic Information
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <InfoField label="High School" value={s.faculty} />
                  <InfoField label="Study Track" value={s.major} />
                  <InfoField label="Grade" value={s.study_year} />
                  <InfoField label="Class" value={s.class_name} />
                  <InfoField label="Academic Year" value={s.academic_year} />
                  <InfoField label="Semester" value={s.semester} />
                  <InfoField label="GPA" value={s.gpa != null ? s.gpa.toFixed(2) : null} />
                </div>
              </div>
            </div>

            {/* Card Validity */}
            {(s.card_issue_date || s.card_expiry_date) && (
              <>
                <hr className="my-4 border-gray-100" />
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">Card Validity</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoField label="Card Issue Date" value={s.card_issue_date ? formatDate(s.card_issue_date, locale) : null} />
                  <InfoField label="Card Expiry Date" value={s.card_expiry_date ? formatDate(s.card_expiry_date, locale) : null} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          Kamrieng High School — Official Student Verification
        </p>
      </div>
    </div>
  );
}
