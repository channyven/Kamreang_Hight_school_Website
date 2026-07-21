/**
 * Excel export utility for student data.
 * Generates an .xlsx workbook from student records and triggers a browser download.
 */

import * as XLSX from "xlsx";

interface ExportStudentRow {
  "Student ID": string;
  "English First Name": string;
  "English Last Name": string;
  "Khmer First Name": string;
  "Khmer Last Name": string;
  Gender: string;
  "Date of Birth": string;
  "Place of Birth": string;
  Nationality: string;
  "Phone Number": string;
  Email: string;
  Address: string;
  Province: string;
  District: string;
  Commune: string;
  Village: string;
  Faculty: string;
  Major: string;
  Class: string;
  "Academic Year": string;
  "Study Year": string;
  Semester: string;
  GPA: string;
  "Credits Earned": string;
  Status: string;
  "Card Issue Date": string;
  "Card Expiry Date": string;
  "Created At": string;
}

/**
 * Export an array of students to an Excel file and trigger download.
 */
export function exportStudentsToExcel(
  students: Array<{
    student_id: string;
    english_first_name: string;
    english_last_name: string;
    khmer_first_name?: string | null;
    khmer_last_name?: string | null;
    gender?: string | null;
    date_of_birth?: string | null;
    place_of_birth?: string | null;
    nationality?: string | null;
    phoneNumber?: string | number | null;
    email?: string | null;
    streetAddress?: string | null;
    province?: string | null;
    district?: string | null;
    commune?: string | null;
    village?: string | null;
    faculty?: string | null;
    major?: string | null;
    class_name?: string | null;
    academic_year?: string | null;
    study_year?: string | null;
    semester?: string | null;
    gpa?: number | null;
    credits_earned?: number | null;
    status?: string | null;
    card_issue_date?: string | null;
    card_expiry_date?: string | null;
    created_at?: string | null;
  }>,
  fileName: string = "students"
): void {
  const rows: ExportStudentRow[] = students.map((s) => {
    // Build full address
    const addressParts = [
      s.streetAddress,
      s.commune,
      s.district,
      s.province,
      s.village,
    ].filter(Boolean);
    const address = addressParts.length > 0 ? addressParts.join(", ") : "";

    // Format dates
    const formatDate = (d: string | null | undefined) =>
      d ? new Date(d).toLocaleDateString("en-US") : "";

    return {
      "Student ID": s.student_id ?? "",
      "English First Name": s.english_first_name ?? "",
      "English Last Name": s.english_last_name ?? "",
      "Khmer First Name": s.khmer_first_name ?? "",
      "Khmer Last Name": s.khmer_last_name ?? "",
      Gender: s.gender
        ? s.gender.charAt(0).toUpperCase() + s.gender.slice(1)
        : "",
      "Date of Birth": formatDate(s.date_of_birth),
      "Place of Birth": s.place_of_birth ?? "",
      Nationality: s.nationality ?? "",
      "Phone Number": s.phoneNumber?.toString() ?? "",
      Email: s.email ?? "",
      Address: address,
      Province: s.province ?? "",
      District: s.district ?? "",
      Commune: s.commune ?? "",
      Village: s.village ?? "",
      Faculty: s.faculty ?? "",
      Major: s.major ?? "",
      Class: s.class_name ?? "",
      "Academic Year": s.academic_year ?? "",
      "Study Year": s.study_year ?? "",
      Semester: s.semester ?? "",
      GPA: s.gpa != null ? s.gpa.toFixed(2) : "",
      "Credits Earned": s.credits_earned?.toString() ?? "",
      Status: s.status
        ? s.status.charAt(0).toUpperCase() + s.status.slice(1)
        : "",
      "Card Issue Date": formatDate(s.card_issue_date),
      "Card Expiry Date": formatDate(s.card_expiry_date),
      "Created At": formatDate(s.created_at),
    };
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths
  const colKeys = Object.keys(rows[0] ?? {}) as (keyof ExportStudentRow)[];
  const colWidths = colKeys.map((key) => {
    const maxLen = Math.max(
      String(key).length,
      ...rows.map((r) => String(r[key] ?? "").length)
    );
    return { wch: Math.min(maxLen + 3, 40) };
  });
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

  // Generate buffer and trigger download
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName.replace(/[^a-zA-Z0-9_-]/g, "_")}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
