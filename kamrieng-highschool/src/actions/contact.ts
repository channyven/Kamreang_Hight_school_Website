"use server";

import { createServerClient } from "@/lib/supabase";
import { contactSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

export async function submitContactMessage(
  formData: unknown
): Promise<ActionResult<void>> {
  const parsed = contactSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("messages").insert({
    ...parsed.data,
    status: "unread",
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
