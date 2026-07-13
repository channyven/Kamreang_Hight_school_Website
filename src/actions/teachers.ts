"use server";

import { createServerClient } from "@/lib/supabase";
import { teacherSchema, type TeacherInput } from "@/schemas/validations";
import type { ActionResult } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";

export async function createTeacher(
  data: TeacherInput
): Promise<ActionResult<void>> {
  const parsed = teacherSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("teachers").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("teachers");
  return { success: true };
}

export async function updateTeacher(
  id: string,
  data: TeacherInput
): Promise<ActionResult<void>> {
  const parsed = teacherSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("teachers")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("teachers");
  return { success: true };
}

export async function deleteTeacher(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("teachers").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("teachers");
  return { success: true };
}
