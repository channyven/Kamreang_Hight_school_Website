"use server";

import { achievementSchema, type AchievementInput } from "@/schemas/validations";
import type { ActionResult } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { AchievementService } from "@/services";

export async function createAchievement(
  data: AchievementInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = achievementSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const error = await new AchievementService().create(parsed.data);
  if (error) return { success: false, error };

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("achievements");
  return { success: true };
}

export async function updateAchievement(
  id: string,
  data: AchievementInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = achievementSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const error = await new AchievementService().update(id, parsed.data);
  if (error) return { success: false, error };

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("achievements");
  return { success: true };
}

export async function deleteAchievement(
  id: string
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const error = await new AchievementService().remove(id);
  if (error) return { success: false, error };

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("achievements");
  return { success: true };
}
