"use server";

import { teacherSchema, type TeacherInput } from "@/schemas/validations";
import type { ActionResult } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { TeacherService } from "@/services";

export async function createTeacher(
  data: TeacherInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = teacherSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const error = await new TeacherService().create(parsed.data);
  if (error) return { success: false, error };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("teachers");
  return { success: true };
}

export async function updateTeacher(
  id: string,
  data: TeacherInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = teacherSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const error = await new TeacherService().update(id, parsed.data);
  if (error) return { success: false, error };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("teachers");
  return { success: true };
}

export async function deleteTeacher(id: string): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const error = await new TeacherService().remove(id);
  if (error) return { success: false, error };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("teachers");
  return { success: true };
}
