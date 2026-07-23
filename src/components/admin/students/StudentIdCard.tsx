"use client";

import Image from "next/image";
import { User } from "lucide-react";
import type { Student } from "@/types";
import {
  formatDateKhmer, getGenderLabelKh, getAddress,
  getAcademicYearKh, getFullName, getKhmerName,
  getLunarDateKh, getGregorianDateKh,
} from "@/lib/student-card-format";

interface Props {
  student: Student;
}

/**
 * The visual "Cambodia-style" official student ID card. Shared between the
 * full-page preview/print route (students/[id]/card) and the quick-view
 * popup (StudentCardModal) so both always render identically.
 */
export default function StudentIdCard({ student: s }: Props) {
  const fullName = getFullName(s);
  const khmerName = getKhmerName(s);
  const genderLabel = getGenderLabelKh(s.gender);
  const address = getAddress(s);
  const academicYearKhmer = getAcademicYearKh(s.academic_year);
  const issueDate = new Date();
  const lunarDate = getLunarDateKh(issueDate);
  const gregorianDate = getGregorianDateKh(issueDate);

  return (
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
          <div className="cc-header-ministry">
            <p className="cc-ministry-line">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
            <p className="cc-ministry-line">មន្ទីរអប់រំ យុវជន និងកីឡាខេត្តបាត់ដំបង</p>
            <p className="cc-school-name-kh">វិទ្យាល័យ កំរៀង</p>
          </div>
        </div>
        <div className="cc-header-right">
          <div className="cc-kingdom">
            <p className="cc-kingdom-title">ព្រះរាជាណាចក្រកម្ពុជា</p>
            <p className="cc-kingdom-line">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
          </div>
          <div className="cc-qr-wrap">
            {s.qr_code ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={s.qr_code} alt="QR Code" className="cc-qr" />
            ) : (
              <div className="cc-qr-placeholder">
                <User className="w-8 h-8 text-gray-300" />
              </div>
            )}
            <div className="cc-qr-seal">
              <Image
                src="/images/studentCard/logoCard.png"
                alt=""
                width={20}
                height={20}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Title ── */}
      <div className="cc-title-section">
        <h2 className="cc-title">បណ្ណសម្គាល់ខ្លួនសិស្ស</h2>
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

        {/* Student Info — grid auto-flows row-major through these
            fields; the address field spans both columns. */}
        <div className="cc-info-grid">
          <InfoFieldKh label="គោត្តនាម និងនាម" value={khmerName ?? fullName} />
          <InfoFieldKh label="ភេទ" value={genderLabel} />
          <InfoFieldKh label="ថ្ងៃខែឆ្នាំកំណើត" value={formatDateKhmer(s.date_of_birth)} />
          <InfoFieldKh label="ថ្នាក់" value={s.class_name ?? "—"} />
          <InfoFieldKh label="អាសយដ្ឋាន" value={address} span />
          <InfoFieldKh label="លេខទូរស័ព្ទ" value={s.phone_number || "—"} />
          <InfoFieldKh label="ឈ្មោះឪពុក" value={s.father_name || "—"} />
          <InfoFieldKh label="អត្តលេខ" value={s.student_id} code />
          <InfoFieldKh label="ឈ្មោះម្តាយ" value={s.mother_name || "—"} />
        </div>

        {/* ── Bottom Section: Photo + Issue date + Signature ── */}
        <div className="cc-bottom">
          {/* Student Photo */}
          <div className="cc-photo-section">
            {s.photo ? (
              <Image
                src={s.photo}
                alt={fullName}
                width={100}
                height={110}
                className="cc-student-photo"
              />
            ) : (
              <div className="cc-photo-placeholder">
                <User className="w-8 h-8 text-school-blue-400" />
                <span className="cc-photo-placeholder-text">រូបថត</span>
              </div>
            )}
          </div>

          {/* Issue date + Principal signature */}
          <div className="cc-issue-signature">
            <div className="cc-issue-dates">
              <p className="cc-lunar-date">{lunarDate}</p>
              <p className="cc-gregorian-date">ស្រុកកំរៀង ខេត្តបាត់ដំបង, {gregorianDate}</p>
            </div>
            <div className="cc-principal-section">
              <div className="cc-principal-title">នាយកវិទ្យាល័យ</div>
              <Image
                src="/images/studentCard/Signature.png"
                alt="Signature"
                width={100}
                height={59}
                className="cc-signature-img"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ STYLES ═══ */}
      <style jsx>{`
        @media print {
          .card-cambodia {
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .card-cambodia, .card-cambodia * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        /* ── Card Container ───────────────────────── */
        .card-cambodia {
          width: 284px;
          min-height: 370px;
          background: white;
          border-radius: 13px;
          border: 1.5px solid #8a8a8a;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          font-family: 'Segoe UI', 'Khmer OS', Arial, sans-serif;
          position: relative;
        }

        /* ── Header ───────────────────────────────── */
        .cc-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 5px;
          padding: 10px 11px 6px;
        }
        .cc-header-left {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          max-width: 136px;
        }
        .cc-ministry-logo {
          width: 44px;
          height: 44px;
          object-fit: contain;
        }
        .cc-header-ministry {
          text-align: center;
        }
        .cc-ministry-line {
          font-size: 7px;
          font-weight: 700;
          color: #000;
          line-height: 1.3;
        }
        .cc-school-name-kh {
          font-size: 9px;
          font-weight: 700;
          color: #000;
          margin-top: 2px;
          line-height: 1.2;
        }
        .cc-header-right {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
        }
        .cc-kingdom {
          text-align: right;
        }
        .cc-kingdom-title {
          font-size: 10px;
          font-weight: 700;
          color: #000;
          line-height: 1.2;
        }
        .cc-kingdom-line {
          font-size: 7px;
          font-weight: 700;
          color: #000;
          line-height: 1.3;
        }
        .cc-qr-wrap {
          position: relative;
        }
        .cc-qr {
          width: 64px;
          height: 64px;
          border-radius: 5px;
          border: 1px solid #d1d5db;
          padding: 2px;
          background: white;
        }
        .cc-qr-placeholder {
          width: 64px;
          height: 64px;
          border-radius: 5px;
          background: #f9fafb;
          border: 1px dashed #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cc-qr-seal {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 19px;
          height: 19px;
          border-radius: 50%;
          background: white;
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.05);
        }

        /* ── Title ────────────────────────────────── */
        .cc-title-section {
          text-align: center;
          padding: 5px 11px 3px;
          background: transparent;
          padding-bottom:6px;
        }
        .cc-title {
          font-size: 13px;
          font-weight: 800;
          color: #dfad32;
          letter-spacing: 0.5px;
        }
        .cc-academic-year {
          font-size: 8px;
          color: #000;
          font-weight: 500;
          margin-top: 1px;
        }

        /* ── Body ─────────────────────────────────── */
        .cc-body {
          padding: 8px 11px 6px;
          position: relative;
          min-height: 256px;
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
          width: 144px;
          height: 144px;
          object-fit: contain;
        }

        /* ── Info Grid ────────────────────────────── */
        /* Fields flow row-major in DOM order; the address field spans
           both columns via its own span prop. */
        .cc-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 12px;
          position: relative;
          z-index: 1;
        }

        /* ── Bottom Section ───────────────────────── */
        .cc-bottom {
          display: flex;
          gap: 10px;
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px solid #e5e7eb;
          position: relative;
          z-index: 1;
        }

        /* Photo */
        .cc-photo-section {
          flex-shrink: 0;
        }
        .cc-student-photo {
          width: 80px;
          height: 88px;
          object-fit: cover;
          border-radius: 6px;
        }
        .cc-photo-placeholder {
          width: 80px;
          height: 88px;
          border-radius: 6px;
          border: 2px dashed #adace2;
          background: #f4f4fb;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .cc-photo-placeholder-text {
          font-size: 8px;
          color: #000;
          font-weight: 500;
        }

        /* Issue date + Principal signature */
        .cc-issue-signature {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-start;
          text-align: right;
        }
        .cc-issue-dates {
          margin-bottom: 3px;
        }
        .cc-lunar-date, .cc-gregorian-date {
          font-size: 6px;
          color: #000;
          line-height: 1.4;
        }
        .cc-principal-section {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .cc-principal-title {
          font-size: 8px;
          font-weight: 700;
          color: #000;
        }
        .cc-signature-img {
          width: 72px;
          height: auto;
          margin-top: -3px;
        }

        /* ── Responsive ───────────────────────────── */
        @media (max-width: 420px) {
          .card-cambodia {
            width: 100%;
            min-height: auto;
            max-width: 320px;
          }
          .cc-header { padding: 8px 8px 5px; gap: 4px; }
          .cc-header-left { max-width: 112px; }
          .cc-ministry-logo { width: 36px; height: 36px; }
          .cc-ministry-line, .cc-kingdom-line { font-size: 6px; }
          .cc-school-name-kh, .cc-kingdom-title { font-size: 8px; }
          .cc-qr { width: 54px; height: 54px; }
          .cc-qr-placeholder { width: 54px; height: 54px; }
          .cc-body { padding: 6px 8px 5px; }
          .cc-title { font-size: 11px; }
          .cc-info-grid { gap: 2px 5px; }
          .cc-student-photo { width: 64px; height: 72px; }
          .cc-photo-placeholder { width: 64px; height: 72px; }
          .cc-signature-img { width: 60px; }
          .cc-watermark-img { width: 104px; height: 104px; }
        }
      `}</style>
    </div>
  );
}

// ─── Info Field Khmer Component ────────────────────────────────

function InfoFieldKh({ label, value, code, span }: { label: string; value: string; code?: boolean; span?: boolean }) {
  return (
    <div className={`cc-field${span ? " cc-field-span" : ""}`}>
      <span className="cc-field-label">{label}</span>
      <span className={`cc-field-value${code ? " cc-field-code" : ""}`}>{value}</span>
      <style jsx>{`
        .cc-field {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 4px;
        }
        .cc-field-span {
          grid-column: 1 / -1;
        }
        .cc-field-label {
          font-size: 9px;
          font-weight: 600;
          color: #6b7280;
          letter-spacing: 0.3px;
          line-height: 1.3;
          white-space: nowrap;
        }
        .cc-field-label::after {
          content: ":";
        }
        .cc-field-value {
          font-size: 9px;
          font-weight: 500;
          color: #000;
          line-height: 1.4;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .cc-field-code {
          font-family: "Courier New", monospace;
          font-size: 9px;
          font-weight: 600;
          color: #000;
        }
      `}</style>
    </div>
  );
}
