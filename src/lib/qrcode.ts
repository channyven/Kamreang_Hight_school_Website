/**
 * QR Code utility for the Student Management System.
 *
 * Generates QR codes as data URLs using the `qrcode` library.
 * Each QR code encodes a unique student URL that opens the
 * public student detail page when scanned.
 */

import QRCode from "qrcode";
import { randomUUID } from "crypto";

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

/**
 * Generate a unique QR token for a student.
 * Must be a valid UUID — the `students.qr_token` column is typed UUID.
 */
export function generateQrToken(): string {
  return randomUUID();
}

/**
 * Build the verification URL that the QR code will encode.
 * When scanned, this opens the student verification page.
 */
export function getStudentQrUrl(
  qrToken: string,
  baseUrl?: string
): string {
  const origin = baseUrl ?? DEFAULT_BASE_URL;
  return `${origin}/en/verify/${qrToken}`;
}

/**
 * Generate a QR code as a data URL (base64 PNG image).
 * Uses high error correction (H) to allow for potential logo overlay.
 */
export async function generateStudentQrCode(
  qrToken: string,
  baseUrl?: string
): Promise<string> {
  const url = getStudentQrUrl(qrToken, baseUrl);
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: {
      dark: "#2c2a7a",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
}

/**
 * Trigger a download of a QR code image.
 */
export function downloadQrCode(
  qrDataUrl: string,
  fileName: string
): void {
  const link = document.createElement("a");
  link.href = qrDataUrl;
  link.download = `${fileName}_QR.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
