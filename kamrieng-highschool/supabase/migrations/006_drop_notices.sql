-- ============================================================
-- Remove Notice Board feature
-- ============================================================

-- Table (CASCADE drops its trigger, RLS policies, and indexes)
DROP TABLE IF EXISTS notices CASCADE;
