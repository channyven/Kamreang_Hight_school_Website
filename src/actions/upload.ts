"use server";

import { createServerClient, STORAGE_BUCKETS } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth-guard";

export async function uploadStudentPhoto(formData: FormData): Promise<{ url: string; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { url: "", error: "Unauthorized" };
  }

  const file = formData.get("file") as File;
  if (!file) return { url: "", error: "No file provided" };

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return { url: "", error: "Only JPEG, PNG, WebP, and GIF images are allowed" };
  }

  // Validate size (10 MB max)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { url: "", error: "Image must be smaller than 10 MB" };
  }

  const supabase = createServerClient();
  const ext = file.name.split(".").pop() ?? "bin";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const path = `students/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.STUDENT_PHOTOS)
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    return { url: "", error: `Upload failed: ${uploadError.message}` };
  }

  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKETS.STUDENT_PHOTOS)
    .getPublicUrl(path);

  return { url: publicUrlData.publicUrl };
}
