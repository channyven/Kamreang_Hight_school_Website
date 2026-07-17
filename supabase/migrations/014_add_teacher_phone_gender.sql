-- ============================================================
-- Add phone & gender columns to teachers table
-- These fields exist in the TypeScript Teacher interface and
-- are present in the staff Excel spreadsheet, but were missing
-- from the original table schema.
-- ============================================================

ALTER TABLE teachers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS gender TEXT;
