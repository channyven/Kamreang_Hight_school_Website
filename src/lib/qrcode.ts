/**
 * QR Code utility for the Student Management System.
 *
 * Generates QR codes as data URLs using the `qrcode` library.
 * Each QR code encodes a unique student URL that opens the
 * public student detail page when scanned.
 */

import QRCode from "qrcode";

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

/**
 * Generate a short, unique QR token for a student.
 */
export function generateQrToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Build the verification URL that the QR code will encode.
 * When scanned, this opens the student verification page.
 */
export function getStudentQrUrl(
  qrToken: string,
  baseUrl?: string
): string {
  const origin = baseUrl ?? DEFAULT_BASE_URL;
  return `${origin}/en/verify/${qrToken}`;
}

/**
 * Generate a QR code as a data URL (base64 PNG image).
 * Uses high error correction (H) to allow for potential logo overlay.
 */
export async function generateStudentQrCode(
  qrToken: string,
  baseUrl?: string
): Promise<string> {
  const url = getStudentQrUrl(qrToken, baseUrl);
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: {
      dark: "#1e3a8a",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
}

/**
 * Trigger a download of a QR code image.
 */
export function downloadQrCode(
  qrDataUrl: string,
  fileName: string
): void {
  const link = document.createElement("a");
  link.href = qrDataUrl;
  link.download = `${fileName}_QR.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Print a focused QR card for a single student — used from the QR detail modal.
 */
export function printQrCard(student: {
  name: string;
  nameKm?: string;
  studentId: string;
  qrDataUrl: string;
  photo?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  className?: string | null;
  academicYear?: string | null;
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

  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>QR Code - ${student.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 portrait; margin: 20mm; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f8fafc;
      padding: 20px;
    }
    .print-container { max-width: 500px; width: 100%; }
    .qr-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
    }
    .card-header {
      background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
      padding: 24px 28px;
      text-align: center;
    }
    .card-header .school-name {
      color: white;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .card-header .school-sub {
      color: rgba(255,255,255,0.6);
      font-size: 11px;
      margin-top: 4px;
      letter-spacing: 0.5px;
    }
    .card-body { padding: 28px; }
    .main-row { display: flex; gap: 24px; align-items: center; }
    .photo-section { flex-shrink: 0; }
    .photo {
      width: 90px; height: 90px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #e2e8f0;
    }
    .photo-placeholder {
      width: 90px; height: 90px;
      border-radius: 50%;
      background: #f1f5f9;
      border: 3px dashed #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .info-section { flex: 1; }
    .info-section .name {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }
    .info-section .name-kh {
      font-size: 14px;
      color: #64748b;
      margin-top: 2px;
      font-family: 'Khmer OS', 'Moul', serif;
    }
    .info-section .id {
      display: inline-block;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: 600;
      background: #eff6ff;
      color: #1d4ed8;
      padding: 3px 10px;
      border-radius: 4px;
      margin-top: 6px;
    }
    .details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }
    .detail-item {}
    .detail-item .label {
      font-size: 9px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    .detail-item .value {
      font-size: 13px;
      color: #0f172a;
      font-weight: 500;
      margin-top: 1px;
    }
    .qr-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }
    .qr-section img {
      width: 180px;
      height: 180px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      padding: 8px;
      background: white;
    }
    .qr-section .scan-label {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 6px;
      font-family: monospace;
      letter-spacing: 1px;
    }
    .card-footer {
      text-align: center;
      padding: 12px 28px;
      background: #fafbfc;
      border-top: 1px solid #f1f5f9;
    }
    .card-footer .printed-date {
      font-size: 9px;
      color: #94a3b8;
    }
    @media print {
      body { background: white; padding: 0; }
      .qr-card { box-shadow: none; border: 1px solid #e2e8f0; }
    }
  </style>
</head>
<body>
  <div class="print-container">
    <div class="qr-card">
      <div class="card-header">
        <div class="school-name">KAMRIENG HIGH SCHOOL</div>
        <div class="school-sub">Student QR Identification</div>
      </div>
      <div class="card-body">
        <div class="main-row">
          <div class="photo-section">${photoHtml}</div>
          <div class="info-section">
            <div class="name">${student.name}</div>
            ${student.nameKm ? `<div class="name-kh">${student.nameKm}</div>` : ""}
            <div class="id">${student.studentId}</div>
          </div>
        </div>

        <div class="details">
          ${genderLabel ? `<div class="detail-item"><div class="label">Gender</div><div class="value">${genderLabel}</div></div>` : ""}
          ${student.dateOfBirth ? `<div class="detail-item"><div class="label">Date of Birth</div><div class="value">${formatDate(student.dateOfBirth)}</div></div>` : ""}
          ${student.className ? `<div class="detail-item"><div class="label">Class</div><div class="value">${student.className}</div></div>` : ""}
          ${student.academicYear ? `<div class="detail-item"><div class="label">Academic Year</div><div class="value">${student.academicYear}</div></div>` : ""}
        </div>

        <div class="qr-section">
          <img src="${student.qrDataUrl}" alt="QR Code" />
          <div class="scan-label">Scan to view student profile</div>
        </div>
      </div>
      <div class="card-footer">
        <div class="printed-date">Printed on ${now}</div>
      </div>
    </div>
  </div>
  <script>window.onload = function() { setTimeout(function() { window.print(); setTimeout(function() { window.close(); }, 500); }, 500); }</script>
</body>
</html>
  `);
  win.document.close();
}

/**
 * Print a professional student ID card with photo, name, ID, QR code, and school branding.
 */
export function printStudentCard(student: {
  name: string;
  studentId: string;
  qrDataUrl: string;
  photo?: string | null;
  faculty?: string | null;
}): void {
  const win = window.open("", "_blank");
  if (!win) return;

  const photoHtml = student.photo
    ? `<img src="${student.photo}" alt="Photo" class="photo" />`
    : `<div class="photo-placeholder"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`;

  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Student ID Card</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f0f4f8;
      padding: 20px;
    }
    .card {
      width: 340px;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
    }
    .card-header {
      background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .card-header .logo {
      width: 36px;
      height: 36px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .card-header .title {
      color: white;
    }
    .card-header .title h2 {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .card-header .title p {
      font-size: 10px;
      color: rgba(255,255,255,0.7);
      margin-top: 1px;
    }
    .card-body {
      padding: 20px;
    }
    .card-row {
      display: flex;
      gap: 16px;
    }
    .photo-section {
      flex-shrink: 0;
    }
    .photo {
      width: 80px;
      height: 80px;
      border-radius: 10px;
      object-fit: cover;
      border: 2px solid #e2e8f0;
    }
    .photo-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 10px;
      background: #f1f5f9;
      border: 2px dashed #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .info-section {
      flex: 1;
      min-width: 0;
    }
    .info-section .name {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .info-section .name-kh {
      font-size: 11px;
      color: #64748b;
      margin-top: 1px;
    }
    .info-section .student-id {
      display: inline-block;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      font-weight: 600;
      background: #eff6ff;
      color: #1d4ed8;
      padding: 2px 8px;
      border-radius: 4px;
      margin-top: 6px;
    }
    .info-section .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 8px;
    }
    .info-section .tag {
      font-size: 9px;
      color: #64748b;
      background: #f8fafc;
      padding: 2px 6px;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
    }
    .qr-section {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .qr-section img {
      width: 80px;
      height: 80px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      padding: 3px;
      background: white;
    }
    .qr-section .scan-me {
      font-size: 7px;
      color: #94a3b8;
      font-family: monospace;
    }
    .card-footer {
      border-top: 1px solid #f1f5f9;
      padding: 10px 20px;
      background: #fafbfc;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-footer .meta {
      font-size: 8px;
      color: #94a3b8;
    }
    .card-footer .status {
      font-size: 9px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 600;
    }
    .status-active { background: #dcfce7; color: #16a34a; }
    .status-graduated { background: #dbeafe; color: #2563eb; }
    .status-suspended { background: #fef9c3; color: #ca8a04; }
    .status-expelled { background: #fee2e2; color: #dc2626; }
    .status-default { background: #f1f5f9; color: #64748b; }

    .bottom-text {
      text-align: center;
      margin-top: 16px;
      font-size: 9px;
      color: #94a3b8;
    }

    @media print {
      body { background: white; padding: 0; }
      .card { box-shadow: none; border: 1px solid #e2e8f0; }
    }
  </style>
</head>
<body>
  <div>
    <div class="card">
      <div class="card-header">
        <div class="logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><path d="M6 12v4h12v-4"/></svg>
        </div>
        <div class="title">
          <h2>KAMRIENG HIGH SCHOOL</h2>
          <p>Student Identification Card</p>
        </div>
      </div>

      <div class="card-body">
        <div class="card-row">
          <div class="photo-section">${photoHtml}</div>
          <div class="info-section">
            <div class="name">${student.name}</div>
            <div class="student-id">${student.studentId}</div>
            ${student.faculty ? `<div class="tags"><span class="tag">${student.faculty}</span></div>` : ""}
          </div>
          <div class="qr-section">
            <img src="${student.qrDataUrl}" alt="QR" />
            <span class="scan-me">Scan to view</span>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <div class="meta">Valid student ID card</div>
        <div class="status status-active">Active</div>
      </div>
    </div>
    <div class="bottom-text">Scan the QR code to view complete student profile</div>
  </div>
  <script>window.onload = function() { setTimeout(function() { window.print(); setTimeout(function() { window.close(); }, 500); }, 500); }</script>
</body>
</html>
  `);
  win.document.close();
}
