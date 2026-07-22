"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  ArrowLeft, Edit, Download, Printer,
  User, Users, Phone, Mail, MapPin, GraduationCap, Calendar,
  BookOpen, CreditCard, Clock, AlertTriangle, QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { getStudentById } from "@/actions/students";
import type { Student } from "@/types";
import { formatDate, adminHref } from "@/utils";
import { exportStudentsToExcel } from "@/lib/export";
import StudentQrCard from "@/components/admin/students/StudentQrCard";

interface PageProps { params: Promise<{ id: string }>; }

// ─── Status helpers ──────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: "success" | "default" | "warning" | "danger" | "info"; dot: string }> = {
  active: { label: "Active", color: "success", dot: "bg-green-500" },
  inactive: { label: "Inactive", color: "default", dot: "bg-gray-400" },
  graduated: { label: "Graduated", color: "info", dot: "bg-blue-500" },
  suspended: { label: "Suspended", color: "danger", dot: "bg-yellow-500" },
  transferred: { label: "Transferred", color: "warning", dot: "bg-purple-500" },
  expelled: { label: "Expelled", color: "danger", dot: "bg-red-500" },
};

const STATUS_LABELS: Record<string, Record<string, string>> = {
  km: {
    active: "សកម្ម", inactive: "អសកម្ម", graduated: "បញ្ចប់",
    suspended: "ផ្អាក", transferred: "ផ្ទេរ", expelled: "បណ្តេញចេញ",
  },
  en: {
    active: "Active", inactive: "Inactive", graduated: "Graduated",
    suspended: "Suspended", transferred: "Transferred", expelled: "Expelled",
  },
};

// ─── Skeleton ─────────────────────────────────────────────────

function DetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-6">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-64" /></div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200"><Skeleton className="h-5 w-40" /></div>
              <div className="p-6"><Skeleton className="h-32 w-full" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── InfoRow helper ──────────────────────────────────────────

function InfoRow({ label, value, icon }: { label: string; value: string | number | null | undefined; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      {icon && <div className="w-5 h-5 text-gray-400 mt-0.5 shrink-0">{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-900 mt-0.5">{value ?? "—"}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function StudentDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const locale = useLocale();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [studentLoaded, setStudentLoaded] = useState(false);

  useEffect(() => {
    getStudentById(id).then((data) => {
      if (!data) { setError(true); setLoading(false); return; }
      setStudent(data as Student);
      setLoading(false);
      setStudentLoaded(true);
    });
  }, [id]);

  const getStatusLabel = (status: string) =>
    STATUS_LABELS[locale as keyof typeof STATUS_LABELS]?.[status] ?? status;

  if (loading) return <DetailsSkeleton />;

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
            <Link href={adminHref(locale, "students")}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Students</Link>
          </Button>
        </div>
      </div>
    );
  }

  const s = student;
  const statusConfig = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.active;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ═══ Header ═══ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
              <Link href={adminHref(locale, "students")}><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
              <p className="text-sm text-gray-500 mt-0.5">Viewing profile of {s.english_first_name} {s.english_last_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2 text-sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button asChild className="bg-school-blue-800 hover:bg-school-blue-900 h-9 gap-2 text-sm">
              <Link href={adminHref(locale, `students/${s.id}/edit`)}>
                <Edit className="w-4 h-4" /> Edit Student
              </Link>
            </Button>
          </div>
        </div>

        {/* ═══ PROFILE HEADER ═══ */}
        <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-school-blue-700 to-school-blue-900 h-24 sm:h-32" />
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Photo — only the photo overlaps the banner; it has its own
                  white ring so it stays legible regardless of what's behind it. */}
              <div className="shrink-0 ring-4 ring-white rounded-full -mt-12 sm:-mt-16">
                {s.photo ? (
                  <Image src={s.photo} alt={`${s.english_first_name} ${s.english_last_name}`} width={96} height={96}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover" />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-school-blue-100 to-school-blue-200 flex items-center justify-center">
                    <User className="w-10 h-10 text-school-blue-600" />
                  </div>
                )}
              </div>
              {/* Text block — no negative margin, so it always starts on the
                  white card body below the banner, never over the gradient. */}
              <div className="pt-2 flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                      {s.english_first_name} {s.english_last_name}
                    </h2>
                    {s.khmer_first_name && (
                      <p className="text-sm text-gray-500 font-khmer mt-0.5">
                        {s.khmer_first_name} {s.khmer_last_name}
                      </p>
                    )}
                  </div>
                  <Badge variant={statusConfig.color} className="text-xs capitalize self-start sm:self-center shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 inline-block`} />
                    {getStatusLabel(s.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                    <QrCode className="w-3.5 h-3.5" />
                    <span className="font-mono">{s.student_id}</span>
                  </div>
                  {s.faculty && (
                    <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                      {s.faculty}
                    </span>
                  )}
                  {s.class_name && (
                    <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                      Class {s.class_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══ LEFT COLUMN ═══ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-school-blue-800" />
                  <CardTitle className="text-base font-semibold text-gray-900">Personal Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <InfoRow label="Gender" value={s.gender ? (s.gender.charAt(0).toUpperCase() + s.gender.slice(1)) : null} icon={<User className="w-4 h-4" />} />
                  <InfoRow label="Date of Birth" value={s.date_of_birth ? formatDate(s.date_of_birth, locale) : null} icon={<Calendar className="w-4 h-4" />} />
                  <InfoRow label="Place of Birth" value={s.place_of_birth} icon={<MapPin className="w-4 h-4" />} />
                  <InfoRow label="Nationality" value={s.nationality} icon={<User className="w-4 h-4" />} />
                  <InfoRow label="Phone Number" value={s.phone_number} icon={<Phone className="w-4 h-4" />} />
                  <InfoRow label="Email" value={s.email} icon={<Mail className="w-4 h-4" />} />
                </div>
                <Separator className="my-3" />
                <InfoRow label="Address" value={
                  [s.street_address, s.commune, s.district, s.province, s.village].filter(Boolean).join(", ")
                } icon={<MapPin className="w-4 h-4" />} />
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-school-blue-800" />
                  <CardTitle className="text-base font-semibold text-gray-900">Academic Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <InfoRow label="Faculty / Department" value={s.faculty} icon={<BookOpen className="w-4 h-4" />} />
                  <InfoRow label="Major / Study Program" value={s.major} icon={<GraduationCap className="w-4 h-4" />} />
                  <InfoRow label="Class" value={s.class_name} icon={<Users className="w-4 h-4" />} />
                  <InfoRow label="Academic Year" value={s.academic_year} icon={<Calendar className="w-4 h-4" />} />
                  <InfoRow label="Study Year" value={s.study_year} icon={<BookOpen className="w-4 h-4" />} />
                  <InfoRow label="Semester" value={s.semester} icon={<Calendar className="w-4 h-4" />} />
                  <InfoRow label="GPA" value={s.gpa != null ? s.gpa.toFixed(2) : null} icon={<GraduationCap className="w-4 h-4" />} />
                  <InfoRow label="Credits Earned" value={s.credits_earned} icon={<CreditCard className="w-4 h-4" />} />
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <InfoRow label="Card Issue Date" value={s.card_issue_date ? formatDate(s.card_issue_date, locale) : null} icon={<Calendar className="w-4 h-4" />} />
                  <InfoRow label="Card Expiry Date" value={s.card_expiry_date ? formatDate(s.card_expiry_date, locale) : null} icon={<Calendar className="w-4 h-4" />} />
                </div>
              </CardContent>
            </Card>

            {/* Attendance Summary */}
            <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-school-blue-800" />
                  <CardTitle className="text-base font-semibold text-gray-900">Attendance Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-500">No attendance records yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Attendance history will be available once the attendance module is configured.</p>
                </div>
              </CardContent>
            </Card>

            {/* Parents / Guardians */}
            <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-school-blue-800" />
                  <CardTitle className="text-base font-semibold text-gray-900">Parents / Guardians</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow label="Father's Name (English)" value={s.father_name} icon={<User className="w-4 h-4" />} />
                  <InfoRow label="Father's Name (Khmer)" value={s.father_name_km} icon={<User className="w-4 h-4" />} />
                  <InfoRow label="Mother's Name (English)" value={s.mother_name} icon={<User className="w-4 h-4" />} />
                  <InfoRow label="Mother's Name (Khmer)" value={s.mother_name_km} icon={<User className="w-4 h-4" />} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ═══ RIGHT COLUMN — QR CODE CARD ═══ */}
          <div className="space-y-6">
            <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-school-blue-800" />
                  <CardTitle className="text-base font-semibold text-gray-900">Student ID Card</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {studentLoaded && <StudentQrCard student={s} />}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-200 px-6 py-4">
                <CardTitle className="text-base font-semibold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Button asChild variant="outline" className="w-full justify-start h-10 gap-3 text-sm">
                  <Link href={adminHref(locale, `students/${s.id}/edit`)}>
                    <Edit className="w-4 h-4 text-school-blue-700" /> Edit Student Record
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-10 gap-3 text-sm" onClick={() => window.print()}>
                  <Printer className="w-4 h-4 text-gray-500" /> Print Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-10 gap-3 text-sm"
                  onClick={() => exportStudentsToExcel([s], `${s.student_id}-${s.english_last_name}`)}
                >
                  <Download className="w-4 h-4 text-gray-500" /> Export Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>


      </div>
    </div>
  );
}
