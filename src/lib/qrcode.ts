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
  link.download = `${fileName}-qr.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
