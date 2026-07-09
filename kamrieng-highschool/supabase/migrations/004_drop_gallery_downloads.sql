-- ============================================================
-- Remove Gallery and Downloads features
-- ============================================================

-- Functions referencing the tables being dropped
DROP FUNCTION IF EXISTS increment_download_count(UUID);

-- Tables (CASCADE drops their triggers, RLS policies, and indexes)
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS galleries CASCADE;
DROP TABLE IF EXISTS downloads CASCADE;
DROP TABLE IF EXISTS download_categories CASCADE;

-- Storage policies for the removed buckets
DROP POLICY IF EXISTS "Public read gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Public read documents" ON storage.objects;

-- Storage buckets (also removes their objects)
DELETE FROM storage.objects WHERE bucket_id IN ('gallery-images', 'documents');
DELETE FROM storage.buckets WHERE id IN ('gallery-images', 'documents');
