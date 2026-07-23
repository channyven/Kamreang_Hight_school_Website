"use server";

import { createServerClient } from "@/lib/supabase";
import {
  bankAccountSchema,
  donationPurposeSchema,
  donationQrSchema,
  type BankAccountInput,
  type DonationPurposeInput,
  type DonationQrInput,
} from "@/schemas/validations";
import type { ActionResult, BankAccount, DonationPurpose, DonationQr } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

// Admin reads go through the service-role client because RLS on
// bank_accounts / donation_purposes only allows the anon role to see
// is_active = true rows (see 017_bank_accounts.sql, 018_donation_purposes.sql)
// — the browser `supabase` client would silently hide inactive rows from
// the admin lists otherwise.

export async function getAllBankAccounts(): Promise<BankAccount[]> {
  try { await requireAdmin(); } catch { return []; }
  const supabase = createServerClient();
  const { data } = await supabase
    .from("bank_accounts")
    .select("*")
    .order("sort_order")
    .order("created_at");
  return (data ?? []) as BankAccount[];
}

export async function getBankAccountById(id: string): Promise<BankAccount | null> {
  try { await requireAdmin(); } catch { return null; }
  const supabase = createServerClient();
  const { data } = await supabase.from("bank_accounts").select("*").eq("id", id).maybeSingle();
  return data as BankAccount | null;
}

export async function createBankAccount(data: BankAccountInput): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = bankAccountSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("bank_accounts").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/donate", "page");
  revalidateTag("bank_accounts");
  return { success: true };
}

export async function updateBankAccount(
  id: string,
  data: BankAccountInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = bankAccountSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("bank_accounts")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/donate", "page");
  revalidateTag("bank_accounts");
  return { success: true };
}

export async function deleteBankAccount(id: string): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase.from("bank_accounts").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/donate", "page");
  revalidateTag("bank_accounts");
  return { success: true };
}

// ─── Donation Purposes ("Why Donate" cards) ───────────────────

export async function getAllDonationPurposes(): Promise<DonationPurpose[]> {
  try { await requireAdmin(); } catch { return []; }
  const supabase = createServerClient();
  const { data } = await supabase
    .from("donation_purposes")
    .select("*")
    .order("sort_order")
    .order("created_at");
  return (data ?? []) as DonationPurpose[];
}

export async function getDonationPurposeById(id: string): Promise<DonationPurpose | null> {
  try { await requireAdmin(); } catch { return null; }
  const supabase = createServerClient();
  const { data } = await supabase.from("donation_purposes").select("*").eq("id", id).maybeSingle();
  return data as DonationPurpose | null;
}

export async function createDonationPurpose(data: DonationPurposeInput): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = donationPurposeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("donation_purposes").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/donate", "page");
  revalidateTag("donation_purposes");
  return { success: true };
}

export async function updateDonationPurpose(
  id: string,
  data: DonationPurposeInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = donationPurposeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("donation_purposes")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/donate", "page");
  revalidateTag("donation_purposes");
  return { success: true };
}

export async function deleteDonationPurpose(id: string): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase.from("donation_purposes").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/donate", "page");
  revalidateTag("donation_purposes");
  return { success: true };
}

// ─── Donation QR codes ────────────────────────────────────────

export async function getAllDonationQrCodes(): Promise<DonationQr[]> {
  try { await requireAdmin(); } catch { return []; }
  const supabase = createServerClient();
  const { data } = await supabase
    .from("donation_qr_codes")
    .select("*")
    .order("sort_order")
    .order("created_at");
  return (data ?? []) as DonationQr[];
}

export async function getDonationQrById(id: string): Promise<DonationQr | null> {
  try { await requireAdmin(); } catch { return null; }
  const supabase = createServerClient();
  const { data } = await supabase.from("donation_qr_codes").select("*").eq("id", id).maybeSingle();
  return data as DonationQr | null;
}

export async function createDonationQr(data: DonationQrInput): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = donationQrSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("donation_qr_codes").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/donate", "page");
  revalidateTag("donation_qr_codes");
  return { success: true };
}

export async function updateDonationQr(
  id: string,
  data: DonationQrInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = donationQrSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("donation_qr_codes")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/donate", "page");
  revalidateTag("donation_qr_codes");
  return { success: true };
}

export async function deleteDonationQr(id: string): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase.from("donation_qr_codes").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/donate", "page");
  revalidateTag("donation_qr_codes");
  return { success: true };
}
