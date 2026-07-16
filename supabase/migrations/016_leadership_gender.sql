-- ============================================================
-- Add a gender column to leadership, completing the Phone row
-- in the admin edit form. Same situation as phone in migration
-- 015: the TypeScript type already declared `gender?: string`
-- (used by mock data) but the live table never had the column.
-- ============================================================

ALTER TABLE leadership ADD COLUMN IF NOT EXISTS gender TEXT;
