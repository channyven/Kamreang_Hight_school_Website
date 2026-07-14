-- ============================================================
-- Add missing columns to the downloads table
-- The migration 010_create_documents_table.sql created a
-- separate `documents` table, but the application code uses the
-- `downloads` table with a `download_categories` join.
-- ============================================================

-- Add file_size column if it does not exist
ALTER TABLE downloads
  ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Add sort_order column if it does not exist
ALTER TABLE downloads
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Add an index for sort_order ordering
CREATE INDEX IF NOT EXISTS idx_downloads_sort_order
  ON downloads (sort_order ASC, created_at DESC);
