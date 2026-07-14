"use server";

import { createServerClient } from "@/lib/supabase";
import { createUserSchema, updateUserSchema } from "@/schemas/validations";
import type { ActionResult } from "@/types";
import type { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { getAdminAuth } from "@/lib/firebase-admin";

type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

export async function createUser(
  data: CreateUserInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  // Create Firebase auth user via Admin SDK
  let firebaseUid: string;
  try {
    const auth = getAdminAuth();
    const userRecord = await auth.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      displayName: parsed.data.full_name,
    });
    firebaseUid = userRecord.uid;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create Firebase user";
    return { success: false, error: message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("admin_users").insert({
    email: parsed.data.email,
    full_name: parsed.data.full_name,
    role: parsed.data.role,
    firebase_uid: firebaseUid,
    is_active: true,
  });
  if (error) {
    // Rollback Firebase user creation
    try {
      const auth = getAdminAuth();
      await auth.deleteUser(firebaseUid);
    } catch { /* non-critical cleanup failure */ }
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateUser(
  id: string,
  data: UpdateUserInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
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
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase
    .from("admin_users")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteUser(id: string): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase.from("admin_users").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
