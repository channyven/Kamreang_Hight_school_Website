"use server";

import { teacherSchema, type TeacherInput } from "@/schemas/validations";
import type { ActionResult, Teacher } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { TeacherService } from "@/services";
import { createServerClient } from "@/lib/supabase";

export async function fetchTeachers(): Promise<Teacher[]> {
  try { await requireAdmin(); } catch { return []; }
  const supabase = createServerClient();
  const { data } = await supabase.from("teachers").select("*").order("sort_order");
  return (data ?? []) as Teacher[];
}

export async function fetchTeacher(id: string): Promise<Teacher | null> {
  try { await requireAdmin(); } catch { return null; }
  const supabase = createServerClient();
  const { data } = await supabase.from("teachers").select("*").eq("id", id).maybeSingle();
  return data as Teacher | null;
}

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
