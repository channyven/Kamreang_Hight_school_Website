"use server";

import { createServerClient } from "@/lib/supabase";
import { createUserSchema, updateUserSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";
import type { z } from "zod";

type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

export async function createUser(
  data: CreateUserInput
): Promise<ActionResult<void>> {
  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = parsed.data;

  // Create Firebase auth account via Admin SDK is typically done client-side.
  // Here we insert the user record; firebase_uid is provided after Firebase creates the account.
  const { error } = await supabase.from("admin_users").insert({
    ...rest,
    firebase_uid: `pending_${Date.now()}`,
  });
  if (error) return { success: false, error: error.message };

  return { success: true };
}

export async function updateUser(
  id: string,
  data: UpdateUserInput
): Promise<ActionResult<void>> {
  const parsed = updateUserSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("admin_users")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  return { success: true };
}

export async function toggleUserActive(
  id: string,
  isActive: boolean
): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("admin_users")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteUser(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("admin_users").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
