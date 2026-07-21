"use server";

import { studentSchema, type StudentInput } from "@/schemas/validations";
import type { ActionResult } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { StudentService } from "@/services";
import { generateStudentQrCode, generateQrToken } from "@/lib/qrcode";

export async function createStudent(
  data: StudentInput
): Promise<ActionResult<{ studentId: string }>> {
  try { await requireAdmin(); } catch (e) { console.error("[createStudent] Auth failed:", e); return { success: false, error: "Unauthorized" }; }
  const parsed = studentSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Validation failed";
    console.error("[createStudent] Validation error:", parsed.error.errors);
    return { success: false, error: msg };
  }

  const service = new StudentService();

  // Auto-generate sequential student ID server-side
  const studentId = await service.generateNextStudentId();
  // Auto-generate unique QR token
  const qrToken = generateQrToken();

  const result = await service.create({ ...parsed.data, student_id: studentId, qr_token: qrToken });
  if (result.error) {
    console.error("[createStudent] DB error:", result.error);
    return { success: false, error: result.error };
  }

  // Generate QR code with the student's QR token and update the record
  if (result.id) {
    try {
      const qrDataUrl = await generateStudentQrCode(qrToken);
      await new StudentService().updateQrCode(result.id, qrDataUrl);
    } catch (qrErr) {
      console.error("[createStudent] QR generation failed:", qrErr);
    }
  }

  revalidatePath("/[locale]/(admin)/admin/students", "page");
  revalidateTag("students");
  return { success: true, data: { studentId } };
}

export async function regenerateStudentQrCode(
  studentId: string
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  try {
    // Look up the student's qr_token first
    const student = await new StudentService().getById(studentId);
    const qrToken = student?.qr_token;
    if (!qrToken) {
      return { success: false, error: "Student has no QR token. Please recreate the student." };
    }

    const qrDataUrl = await generateStudentQrCode(qrToken);
    const error = await new StudentService().updateQrCode(studentId, qrDataUrl);
    if (error) {
      console.error("[regenerateQR] DB error:", error);
      return { success: false, error };
    }

    revalidatePath("/[locale]/(admin)/admin/students/[id]", "page");
    revalidateTag("students");
    return { success: true };
  } catch (e) {
    console.error("[regenerateQR] Error:", e);
    return { success: false, error: "Failed to regenerate QR code" };
  }
}

export async function updateStudent(
  id: string,
  data: StudentInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch (e) { console.error("[updateStudent] Auth failed:", e); return { success: false, error: "Unauthorized" }; }
  const parsed = studentSchema.safeParse(data);
  if (!parsed.success) {
    console.error("[updateStudent] Validation error:", parsed.error.errors);
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const error = await new StudentService().update(id, parsed.data);
  if (error) { console.error("[updateStudent] DB error:", error); return { success: false, error }; }

  revalidatePath("/[locale]/(admin)/admin/students", "page");
  revalidateTag("students");
  return { success: true };
}

export async function deleteStudent(id: string): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const error = await new StudentService().remove(id);
  if (error) { console.error("[deleteStudent] DB error:", error); return { success: false, error }; }

  revalidatePath("/[locale]/(admin)/admin/students", "page");
  revalidateTag("students");
  return { success: true };
}

export async function getStudents(options?: {
  status?: string;
  faculty?: string;
  search?: string;
}) {
  try { await requireAdmin(); } catch { return []; }
  return new StudentService().getAll(options);
}

export async function getStudentById(id: string) {
  try { await requireAdmin(); } catch { return null; }
  return new StudentService().getById(id);
}
