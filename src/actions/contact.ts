"use server";

import nodemailer from "nodemailer";
import { contactSchema } from "@/schemas/validations";
import { createServerClient } from "@/lib/supabase";
import type { ActionResult } from "@/types";

export async function submitContactMessage(
  formData: unknown
): Promise<ActionResult<void>> {
  const parsed = contactSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid data",
    };
  }

  const { name, phone, email, subject, message } = parsed.data;
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
      console.error("Database insert error:", dbError);
      errors.push("Failed to save message");
    }
  } catch (error) {
    console.error("Database insert error:", error);
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
    console.error("Email send error:", error);
    errors.push("Failed to send email");
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join("; ") };
  }

  return { success: true };
}
