import type { Student } from "@/types";
import {
  formatDateKhmer, getGenderLabelKh, getAddress,
  getAcademicYearKh, getFullName, getKhmerName,
  getLunarDateKh, getGregorianDateKh,
} from "@/lib/student-card-format";

// Mirrors the official Cambodia-style card design in
// src/app/[locale]/(admin)/admin/students/[id]/card/page.tsx (the
// `.card-cambodia` markup) so a student's card looks identical whether
// viewed individually or printed in bulk from the Students list. That page
// renders via React/styled-jsx; this one builds a static HTML string for a
// popup print window, so the two can't share code directly — keep them in
// sync by eye if the card design changes.

function buildCardHtml(s: Student): string {
  const fullName = getFullName(s);
  const khmerName = getKhmerName(s) ?? fullName;
  const qr = s.qr_code ?? null;
  const issueDate = new Date();

  const photoHtml = s.photo
    ? `<img src="${s.photo}" alt="${fullName}" class="cc-student-photo" />`
    : `<div class="cc-photo-placeholder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5451c3" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span class="cc-photo-placeholder-text">រូបថត</span></div>`;

  const qrHtml = qr
    ? `<img src="${qr}" alt="QR Code" class="cc-qr" />`
    : `<div class="cc-qr-placeholder"></div>`;

  return `
    <div class="card-cambodia">
      <div class="cc-header">
        <div class="cc-header-left">
          <img src="/images/studentCard/logoCard.png" alt="Ministry Logo" class="cc-ministry-logo" />
          <div class="cc-header-ministry">
            <p class="cc-ministry-line">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
            <p class="cc-ministry-line">មន្ទីរអប់រំ យុវជន និងកីឡាខេត្តបាត់ដំបង</p>
            <p class="cc-school-name-kh">វិទ្យាល័យ កំរៀង</p>
          </div>
        </div>
        <div class="cc-header-right">
          <div class="cc-kingdom">
            <p class="cc-kingdom-title">ព្រះរាជាណាចក្រកម្ពុជា</p>
            <p class="cc-kingdom-line">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
          </div>
          <div class="cc-qr-wrap">
            ${qrHtml}
            <div class="cc-qr-seal"><img src="/images/studentCard/logoCard.png" alt="" /></div>
          </div>
        </div>
      </div>

      <div class="cc-title-section">
        <h2 class="cc-title">បណ្ណសម្គាល់ខ្លួនសិស្ស</h2>
        <p class="cc-academic-year">${getAcademicYearKh(s.academic_year)}</p>
      </div>

      <div class="cc-body">
        <div class="cc-watermark">
          <img src="/images/studentCard/logoCard.png" alt="" class="cc-watermark-img" />
        </div>

        <div class="cc-info-grid">
          <div class="cc-field"><span class="cc-field-label">គោត្តនាម និងនាម</span><span class="cc-field-value">${khmerName}</span></div>
          <div class="cc-field"><span class="cc-field-label">ភេទ</span><span class="cc-field-value">${getGenderLabelKh(s.gender)}</span></div>
          <div class="cc-field"><span class="cc-field-label">ថ្ងៃខែឆ្នាំកំណើត</span><span class="cc-field-value">${formatDateKhmer(s.date_of_birth)}</span></div>
          <div class="cc-field"><span class="cc-field-label">ថ្នាក់</span><span class="cc-field-value">${s.class_name ?? "—"}</span></div>
          <div class="cc-field cc-field-span"><span class="cc-field-label">អាសយដ្ឋាន</span><span class="cc-field-value">${getAddress(s)}</span></div>
          <div class="cc-field"><span class="cc-field-label">លេខទូរស័ព្ទ</span><span class="cc-field-value">${s.phone_number || "—"}</span></div>
          <div class="cc-field"><span class="cc-field-label">ឈ្មោះឪពុក</span><span class="cc-field-value">${s.father_name || "—"}</span></div>
          <div class="cc-field"><span class="cc-field-label">អត្តលេខ</span><span class="cc-field-value cc-field-code">${s.student_id}</span></div>
          <div class="cc-field"><span class="cc-field-label">ឈ្មោះម្តាយ</span><span class="cc-field-value">${s.mother_name || "—"}</span></div>
        </div>

        <div class="cc-bottom">
          <div class="cc-photo-section">${photoHtml}</div>
          <div class="cc-issue-signature">
            <div class="cc-issue-dates">
              <p class="cc-lunar-date">${getLunarDateKh(issueDate)}</p>
              <p class="cc-gregorian-date">ស្រុកកំរៀង ខេត្តបាត់ដំបង, ${getGregorianDateKh(issueDate)}</p>
            </div>
            <div class="cc-principal-section">
              <div class="cc-principal-title">នាយកវិទ្យាល័យ</div>
              <img src="/images/studentCard/Signature.png" alt="Signature" class="cc-signature-img" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildPrintDocument(students: Student[], docTitle: string, subtitle: string): string {
  const cardsHtml = students.map(buildCardHtml).join("\n");
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${docTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 10mm; }
    body {
      font-family: 'Segoe UI', 'Khmer OS', Arial, sans-serif;
      background: #f8fafc;
      padding: 20px;
    }
    .print-header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #2c2a7a;
    }
    .print-header h1 {
      font-size: 16px;
      color: #2c2a7a;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .print-header p {
      font-size: 10px;
      color: #64748b;
      margin-top: 4px;
    }
    .cards-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6mm;
      justify-content: center;
    }

    /* ── Card (mirrors the single-card design) ── */
    .card-cambodia {
      width: 84mm;
      min-height: 106mm;
      background: white;
      border-radius: 13px;
      border: 1.5px solid #8a8a8a;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      position: relative;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .cc-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 5px;
      padding: 10px 11px 6px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .cc-header-left { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 3px; max-width: 136px; }
    .cc-ministry-logo { width: 44px; height: 44px; object-fit: contain; }
    .cc-header-ministry { text-align: center; }
    .cc-ministry-line { font-size: 7px; font-weight: 700; color: #000; line-height: 1.3; }
    .cc-school-name-kh { font-size: 9px; font-weight: 700; color: #000; margin-top: 2px; line-height: 1.2; }
    .cc-header-right { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
    .cc-kingdom { text-align: right; }
    .cc-kingdom-title { font-size: 10px; font-weight: 700; color: #000; line-height: 1.2; }
    .cc-kingdom-line { font-size: 7px; font-weight: 700; color: #000; line-height: 1.3; }
    .cc-qr-wrap { position: relative; }
    .cc-qr { width: 64px; height: 64px; border-radius: 5px; border: 1px solid #d1d5db; padding: 2px; background: white; }
    .cc-qr-placeholder { width: 64px; height: 64px; border-radius: 5px; background: #f9fafb; border: 1px dashed #d1d5db; }
    .cc-qr-seal {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 19px; height: 19px; border-radius: 50%; background: white;
      padding: 2px; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.05);
    }
    .cc-qr-seal img { width: 16px; height: 16px; }

    .cc-title-section {
      text-align: center;
      padding: 5px 11px 6px;
      background: transparent;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .cc-title { font-size: 13px; font-weight: 800; color: #dfad32; letter-spacing: 0.5px; }
    .cc-academic-year { font-size: 8px; color: #000; font-weight: 500; margin-top: 1px; }

    .cc-body { padding: 8px 11px 6px; position: relative; min-height: 256px; }
    .cc-watermark {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none; z-index: 0; opacity: 0.08;
    }
    .cc-watermark-img {
      width: 144px; height: 144px; object-fit: contain;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .cc-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; position: relative; z-index: 1; }
    .cc-field { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px; }
    .cc-field-span { grid-column: 1 / -1; }
    .cc-field-label { font-size: 9px; font-weight: 600; color: #6b7280; letter-spacing: 0.3px; line-height: 1.3; white-space: nowrap; }
    .cc-field-label::after { content: ":"; }
    .cc-field-value { font-size: 9px; font-weight: 500; color: #000; line-height: 1.4; word-wrap: break-word; overflow-wrap: break-word; }
    .cc-field-code { font-family: 'Courier New', monospace; font-size: 9px; font-weight: 600; color: #000; }

    .cc-bottom { display: flex; gap: 8px; margin-top: 6px; padding-top: 5px; border-top: 1px solid #e5e7eb; position: relative; z-index: 1; }
    .cc-photo-section { flex-shrink: 0; }
    .cc-student-photo { width: 120px; height: 120px; object-fit: cover; border-radius: 6px; }
    .cc-photo-placeholder {
      width: 80px; height: 88px; border-radius: 6px;
      border: 2px dashed #adace2; background: #f4f4fb;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .cc-photo-placeholder-text { font-size: 8px; color: #000; font-weight: 500; }

    .cc-issue-signature { flex: 1; display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-start; text-align: right; }
    .cc-issue-dates { margin-bottom: 3px; }
    .cc-lunar-date, .cc-gregorian-date { font-size: 6px; color: #000; line-height: 1.4; }
    .cc-principal-section { display: flex; flex-direction: column; align-items: flex-end; }
    .cc-principal-title { font-size: 8px; font-weight: 700; color: #000; }
    .cc-signature-img { width: 120px; height: auto; margin-top: -3px; }

    .card-cambodia, .card-cambodia * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    @media print {
      body { background: white; padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="print-header no-print">
    <h1>KAMRIENG HIGH SCHOOL</h1>
    <p>${subtitle}</p>
  </div>
  <div class="cards-grid">${cardsHtml}</div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        setTimeout(function() { window.close(); }, 500);
      }, 800);
    };
  </script>
</body>
</html>
  `;
}

/**
 * Opens a new window and prints a grid of student ID cards.
 * Returns false if the browser's popup blocker prevented the window from
 * opening — must be called synchronously from a click handler (no
 * setTimeout/await in between) or blockers will swallow it silently.
 */
export function openPrintWindow(students: Student[], docTitle: string, subtitle: string): boolean {
  const win = window.open("", "_blank");
  if (!win) return false;
  win.document.write(buildPrintDocument(students, docTitle, subtitle));
  win.document.close();
  return true;
}
