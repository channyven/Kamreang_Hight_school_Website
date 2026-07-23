"use server";

import nodemailer from "nodemailer";
import { headers } from "next/headers";
import { contactSchema } from "@/schemas/validations";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/error-logger";
import type { ActionResult } from "@/types";

export async function submitContactMessage(
  formData: unknown
): Promise<ActionResult<void>> {
  // ─── Rate Limiting ──────────────────────────────────────────
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "unknown";
  
  if (!checkRateLimit(ip, 3, 60 * 60 * 1000)) { // 3 messages per hour
    return {
      success: false,
      error: "Too many messages. Please try again later.",
    };
  }

  const parsed = contactSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid data",
    };
  }

  const { name, phone, email, subject, message } = parsed.data;

  // ─── Content Filtering ──────────────────────────────────────
  const spamPatterns = [
    /https?:\/\//i, // No URLs in message
    /\[url=/,       // BBCode URLs
    /<a href=/i,    // HTML URLs
    /casino/i,      // Common spam keywords
    /lottery/i,
    /bitcoin/i,
    /crypto/i,
  ];

  if (spamPatterns.some(pattern => pattern.test(message) || pattern.test(subject))) {
    return {
      success: false,
      error: "Your message contains prohibited content.",
    };
  }

  const errors: string[] = [];

  // ─── Persist to database (messages table) ───────────────────
  // This ensures the message appears in the admin messages inbox.
  try {
    const supabase = createServerClient();
    const { error: dbError } = await supabase.from("messages").insert({
      name,
      email,
      phone: phone || null,
      subject,
      message,
      status: "unread",
    });
    if (dbError) {
      logError(dbError, { tags: ["contact", "database"], severity: "high" });
      errors.push("Failed to save message");
    }
  } catch (error) {
    logError(error, { tags: ["contact", "database"], severity: "high" });
    errors.push("Failed to save message");
  }

  // ─── Send Email ──────────────────────────────────────────────
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL!,
      replyTo: email,
      subject: `New Message: ${subject}`,
      html: `
        <div style="font-family: Arial; padding: 20px; border: 1px solid #ddd;">
          <h2>New Contact Message</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Phone:</b> ${phone || "N/A"}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Subject:</b> ${subject}</p>
          <hr/>
          <p><b>Message:</b></p>
          <p>${message}</p>
        </div>
      `,
    });
  } catch (error) {
    logError(error, { tags: ["contact", "email"], severity: "high" });
    errors.push("Failed to send email");
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join("; ") };
  }

  return { success: true };
}
