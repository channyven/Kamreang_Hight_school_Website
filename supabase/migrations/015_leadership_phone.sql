-- ============================================================
-- Add a phone column to leadership. The TypeScript Leadership
-- type already declared `phone?: string` (used by mock data),
-- but the live table never had the column and the admin edit
-- form didn't expose it. Wiring it up end-to-end.
-- ============================================================

ALTER TABLE leadership ADD COLUMN IF NOT EXISTS phone TEXT;
