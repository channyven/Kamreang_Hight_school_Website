-- ============================================================
-- QR Code Verification Token
-- Migration 018: Add qr_token column to students table
-- ============================================================

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS qr_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_students_qr_token ON students (qr_token);
