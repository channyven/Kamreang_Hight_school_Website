import { createServerClient } from "@/lib/supabase";
import type { Student } from "@/types";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User, GraduationCap, QrCode, ArrowLeft,
} from "lucide-react";
import { formatDate } from "@/utils";

interface PageProps { params: Promise<{ id: string; locale: string }>; }

async function getStudent(id: string): Promise<Student | null> {
  const supabase = createServerClient();
  const { data } = await supabase.from("students").select("*").eq("id", id).single();
  return data as Student | null;
}

export default async function PublicStudentPage({ params }: PageProps) {
  const { id, locale } = await params;
  const student = await getStudent(id);

  if (!student) notFound();

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
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to School
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Scanned from QR Code</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-20" />

          <div className="px-6 pb-6">
            {/* Photo & Name */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-10 mb-6">
              <div className="shrink-0 ring-4 ring-white rounded-full">
                {s.photo ? (
                  <Image src={s.photo} alt={`${s.english_first_name} ${s.english_last_name}`}
                    width={80} height={80} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-500" />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900">
                  {s.english_first_name} {s.english_last_name}
                </h2>
                {s.khmer_first_name && (
                  <p className="text-sm text-gray-500 font-khmer">{s.khmer_first_name} {s.khmer_last_name}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
                  <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                    <QrCode className="w-3 h-3 inline mr-1" />{s.student_id}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[s.status] ?? "bg-gray-100 text-gray-800"}`}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Personal Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-500" /> Personal
                </h3>
                <InfoField label="Gender" value={s.gender ? s.gender.charAt(0).toUpperCase() + s.gender.slice(1) : null} />
                <InfoField label="Date of Birth" value={s.date_of_birth ? formatDate(s.date_of_birth, locale) : null} />
                <InfoField label="Phone" value={s.phoneNumber} />
                <InfoField label="Email" value={s.email} />
                <InfoField label="Address" value={
                  [s.streetAddress, s.commune, s.district, s.province, s.village].filter(Boolean).join(", ")
                } />
              </div>

              {/* Academic Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-500" /> Academic
                </h3>
                <InfoField label="Department" value={s.faculty} />
                <InfoField label="Major" value={s.major} />
                <InfoField label="Class" value={s.class_name} />
                <InfoField label="Academic Year" value={s.academic_year} />
                <InfoField label="GPA" value={s.gpa != null ? s.gpa.toFixed(2) : null} />
                <InfoField label="Card Issue Date" value={s.card_issue_date ? formatDate(s.card_issue_date, locale) : null} />
                <InfoField label="Card Expiry Date" value={s.card_expiry_date ? formatDate(s.card_expiry_date, locale) : null} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          Kamrieng High School — Student Information
        </p>
      </div>
    </div>
  );
}
