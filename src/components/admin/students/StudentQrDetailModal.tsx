"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Printer, QrCode, User, GraduationCap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { downloadQrCode } from "@/lib/qrcode";
import type { Student } from "@/types";

// ─── Constants ─────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: "success" | "default" | "warning" | "danger" | "info" }> = {
  active: { label: "Active", color: "success" },
  inactive: { label: "Inactive", color: "default" },
  graduated: { label: "Graduated", color: "info" },
  suspended: { label: "Suspended", color: "danger" },
  transferred: { label: "Transferred", color: "warning" },
  expelled: { label: "Expelled", color: "danger" },
};

// ─── Props ─────────────────────────────────────────────────────

interface Props {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Modal ─────────────────────────────────────────────────────

export default function StudentQrDetailModal({ student, open, onOpenChange }: Props) {
  const s = student;
  const qrDataUrl = s.qr_code ?? null;
  const fullName = `${s.english_first_name} ${s.english_last_name}`;
  const khmerName = s.khmer_first_name ? `${s.khmer_first_name} ${s.khmer_last_name ?? ""}` : null;
  const statusConfig = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.active;

  const handleDownload = () => {
    if (qrDataUrl) {
      const lastName = s.english_last_name?.replace(/[^a-zA-Z0-9]/g, "") ?? "Student";
      downloadQrCode(qrDataUrl, `${s.student_id}_${lastName}`);
    }
  };

  const handlePrint = () => {
    if (!qrDataUrl) return;
    printStudentIdCard({
      name: fullName,
      nameKm: khmerName ?? undefined,
      studentId: s.student_id,
      qrDataUrl,
      photo: s.photo,
      gender: s.gender,
      dateOfBirth: s.date_of_birth,
      className: s.class_name,
      academicYear: s.academic_year,
      faculty: s.faculty,
      status: s.status,
    });
  };

  const formatDate = (d: string | null | undefined) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => onOpenChange(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 32px)" }}
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full sm:w-[560px] mx-auto overflow-hidden">
              {/* ── Header ── */}
              <div className="relative bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-4">
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-200" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">KAMRIENG HIGH SCHOOL</h2>
                    <p className="text-xs text-blue-200/80 mt-0.5">Student Identification Card</p>
                  </div>
                </div>
              </div>

              {/* ── ID Card Content ── */}
              <div className="p-6">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  {/* Top Row: Photo + Info */}
                  <div className="flex items-start gap-5">
                    {/* Student Photo */}
                    <div className="shrink-0">
                      {s.photo ? (
                        <div className="w-20 h-20 rounded-xl overflow-hidden ring-2 ring-blue-100 shadow-sm">
                          <Image
                            src={s.photo}
                            alt={fullName}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center ring-2 ring-blue-50">
                          <User className="w-8 h-8 text-blue-400" />
                        </div>
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div>
                        <p className="text-base font-bold text-gray-900 truncate">{fullName}</p>
                        {khmerName && (
                          <p className="text-sm text-gray-500 font-khmer truncate">{khmerName}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200">
                          {s.student_id}
                        </span>
                        <Badge variant={statusConfig.color} className="text-[10px] capitalize">
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="shrink-0">
                      {qrDataUrl ? (
                        <div className="bg-white rounded-lg border-2 border-blue-100 p-1.5 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={qrDataUrl}
                            alt={`QR - ${fullName}`}
                            className="w-[100px] h-[100px] object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-[100px] h-[100px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                          <QrCode className="w-10 h-10 text-blue-300" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-4 border-t border-gray-200" />

                  {/* Detail Grid */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <DetailItem
                      icon={<GraduationCap className="w-3.5 h-3.5 text-blue-500" />}
                      label="Class"
                      value={s.class_name}
                    />
                    <DetailItem
                      icon={<Building2 className="w-3.5 h-3.5 text-purple-500" />}
                      label="Department"
                      value={s.faculty}
                    />
                    <DetailItem
                      icon={<User className="w-3.5 h-3.5 text-green-500" />}
                      label="Gender"
                      value={s.gender ? s.gender.charAt(0).toUpperCase() + s.gender.slice(1) : null}
                    />
                    <DetailItem
                      icon={<GraduationCap className="w-3.5 h-3.5 text-amber-500" />}
                      label="Academic Year"
                      value={s.academic_year}
                    />
                    <DetailItem
                      icon={<QrCode className="w-3.5 h-3.5 text-cyan-500" />}
                      label="Date of Birth"
                      value={formatDate(s.date_of_birth)}
                    />
                    <DetailItem
                      icon={<User className="w-3.5 h-3.5 text-rose-500" />}
                      label="Nationality"
                      value={s.nationality}
                    />
                  </div>

                  {/* Scan indication */}
                  <div className="mt-4 pt-3 border-t border-dashed border-gray-200 text-center">
                    <p className="text-[10px] text-gray-400 font-mono tracking-wider">
                      Scan QR code to view complete student profile
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Action Buttons ── */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 text-sm"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-4 h-4" />
                  Close
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 text-sm"
                  disabled={!qrDataUrl}
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                  Download QR
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 gap-2 text-sm bg-blue-600 hover:bg-blue-700"
                  disabled={!qrDataUrl}
                  onClick={handlePrint}
                >
                  <Printer className="w-4 h-4" />
                  Print Card
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Detail Item Component ─────────────────────────────────────

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value ?? "—"}</p>
      </div>
    </div>
  );
}

// ─── Print Function ────────────────────────────────────────────

function printStudentIdCard(student: {
  name: string;
  nameKm?: string;
  studentId: string;
  qrDataUrl: string;
  photo?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  className?: string | null;
  academicYear?: string | null;
  faculty?: string | null;
  status?: string | null;
}): void {
  const win = window.open("", "_blank");
  if (!win) return;

  const photoHtml = student.photo
    ? `<img src="${student.photo}" alt="Photo" class="photo" />`
    : `<div class="photo-placeholder"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`;

  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatDate = (d: string | null | undefined) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return d;
    }
  };

  const genderLabel = student.gender
    ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1)
    : "";

  const statusClass = student.status === "active" ? "status-active"
    : student.status === "graduated" ? "status-graduated"
    : student.status === "suspended" ? "status-suspended"
    : student.status === "expelled" ? "status-expelled"
    : "status-default";

  const statusLabel = student.status
    ? student.status.charAt(0).toUpperCase() + student.status.slice(1)
    : "";

  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Student ID Card - ${student.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f1f5f9;
      padding: 20px;
    }
    .card-wrapper { max-width: 520px; width: 100%; }
    .id-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.12);
      border: 1px solid #e2e8f0;
    }
    .card-top {
      background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
      padding: 24px 28px;
      text-align: center;
    }
    .card-top .school-name {
      color: white;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 1.5px;
    }
    .card-top .card-type {
      color: rgba(255,255,255,0.65);
      font-size: 12px;
      margin-top: 4px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .card-body { padding: 24px 28px; }
    .main-row { display: flex; gap: 20px; align-items: flex-start; }
    .photo-wrap { flex-shrink: 0; }
    .photo {
      width: 96px; height: 96px;
      border-radius: 14px;
      object-fit: cover;
      border: 3px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .photo-placeholder {
      width: 96px; height: 96px;
      border-radius: 14px;
      background: #f1f5f9;
      border: 3px dashed #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .info-wrap { flex: 1; min-width: 0; }
    .info-wrap .name {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.3;
    }
    .info-wrap .name-kh {
      font-size: 15px;
      color: #64748b;
      margin-top: 2px;
      font-family: 'Khmer OS', 'Moul', serif;
    }
    .info-wrap .student-id {
      display: inline-block;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      font-weight: 600;
      background: #eff6ff;
      color: #1d4ed8;
      padding: 3px 12px;
      border-radius: 5px;
      margin-top: 8px;
      border: 1px solid #bfdbfe;
    }
    .qr-wrap { flex-shrink: 0; }
    .qr-wrap img {
      width: 110px; height: 110px;
      border-radius: 10px;
      border: 2px solid #e2e8f0;
      padding: 5px;
      background: white;
    }
    .qr-wrap .scan-label {
      text-align: center;
      font-size: 7px;
      color: #94a3b8;
      font-family: monospace;
      letter-spacing: 0.5px;
      margin-top: 3px;
    }
    .divider {
      margin: 18px 0;
      border: none;
      border-top: 1px solid #f1f5f9;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 20px;
    }
    .detail-item { }
    .detail-item .label {
      font-size: 9px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 600;
    }
    .detail-item .value {
      font-size: 14px;
      color: #0f172a;
      font-weight: 500;
      margin-top: 2px;
    }
    .detail-item .value-mono {
      font-family: 'Courier New', monospace;
    }
    .status-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 12px;
      border-radius: 20px;
      text-transform: capitalize;
      margin-top: 4px;
    }
    .status-active { background: #dcfce7; color: #16a34a; }
    .status-graduated { background: #dbeafe; color: #2563eb; }
    .status-suspended { background: #fef9c3; color: #ca8a04; }
    .status-expelled { background: #fee2e2; color: #dc2626; }
    .status-default { background: #f1f5f9; color: #64748b; }
    .card-footer {
      text-align: center;
      padding: 12px 28px;
      background: #fafbfc;
      border-top: 1px solid #f1f5f9;
    }
    .card-footer .print-date {
      font-size: 9px;
      color: #94a3b8;
    }
    @media print {
      body { background: white; padding: 0; }
      .id-card { box-shadow: none; border: 1px solid #d1d5db; }
      .card-top { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .status-active, .status-graduated, .status-suspended, .status-expelled { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="card-wrapper">
    <div class="id-card">
      <div class="card-top">
        <div class="school-name">KAMRIENG HIGH SCHOOL</div>
        <div class="card-type">Student Identification Card</div>
      </div>
      <div class="card-body">
        <div class="main-row">
          <div class="photo-wrap">${photoHtml}</div>
          <div class="info-wrap">
            <div class="name">${student.name}</div>
            ${student.nameKm ? `<div class="name-kh">${student.nameKm}</div>` : ""}
            <div class="student-id">${student.studentId}</div>
            ${statusLabel ? `<div class="status-badge ${statusClass}">${statusLabel}</div>` : ""}
          </div>
          <div class="qr-wrap">
            <img src="${student.qrDataUrl}" alt="QR" />
            <div class="scan-label">SCAN TO VERIFY</div>
          </div>
        </div>

        <hr class="divider" />

        <div class="details-grid">
          ${student.className ? `<div class="detail-item"><div class="label">Class</div><div class="value">${student.className}</div></div>` : ""}
          ${student.faculty ? `<div class="detail-item"><div class="label">Department</div><div class="value">${student.faculty}</div></div>` : ""}
          ${genderLabel ? `<div class="detail-item"><div class="label">Gender</div><div class="value">${genderLabel}</div></div>` : ""}
          ${student.academicYear ? `<div class="detail-item"><div class="label">Academic Year</div><div class="value">${student.academicYear}</div></div>` : ""}
          ${student.dateOfBirth ? `<div class="detail-item"><div class="label">Date of Birth</div><div class="value">${formatDate(student.dateOfBirth)}</div></div>` : ""}
        </div>
      </div>
      <div class="card-footer">
        <div class="print-date">Printed on ${now} · Official Student ID Card</div>
      </div>
    </div>
  </div>
  <script>window.onload = function() { setTimeout(function() { window.print(); setTimeout(function() { window.close(); }, 500); }, 500); }</script>
</body>
</html>
  `);
  win.document.close();
}
