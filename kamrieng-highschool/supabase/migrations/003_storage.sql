-- ============================================================
-- Storage Buckets
-- ============================================================

-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('news-images',        'news-images',        true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('activity-images',    'activity-images',    true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('achievement-images', 'achievement-images', true, 5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('gallery-images',     'gallery-images',     true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('documents',          'documents',          true, 20971520, ARRAY['application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('school-avatars',     'school-avatars',     true, 2097152,  ARRAY['image/jpeg','image/png','image/webp']),
  ('settings-images',    'settings-images',    true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- ─── Storage Policies ────────────────────────────────────────
-- (each guarded with DROP POLICY IF EXISTS since this project is
-- shared with other apps and CREATE POLICY has no IF NOT EXISTS)

-- Public read on all public buckets
DROP POLICY IF EXISTS "Public read news images" ON storage.objects;
CREATE POLICY "Public read news images" ON storage.objects
  FOR SELECT USING (bucket_id = 'news-images');

DROP POLICY IF EXISTS "Public read activity images" ON storage.objects;
CREATE POLICY "Public read activity images" ON storage.objects
  FOR SELECT USING (bucket_id = 'activity-images');

DROP POLICY IF EXISTS "Public read achievement images" ON storage.objects;
CREATE POLICY "Public read achievement images" ON storage.objects
  FOR SELECT USING (bucket_id = 'achievement-images');

DROP POLICY IF EXISTS "Public read gallery images" ON storage.objects;
CREATE POLICY "Public read gallery images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Public read documents" ON storage.objects;
CREATE POLICY "Public read documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Public read school avatars" ON storage.objects;
CREATE POLICY "Public read school avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'school-avatars');

DROP POLICY IF EXISTS "Public read settings images" ON storage.objects;
CREATE POLICY "Public read settings images" ON storage.objects
  FOR SELECT USING (bucket_id = 'settings-images');

-- Service role full upload/delete access
DROP POLICY IF EXISTS "School website service role upload" ON storage.objects;
CREATE POLICY "School website service role upload" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "School website service role update" ON storage.objects;
CREATE POLICY "School website service role update" ON storage.objects
  FOR UPDATE USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "School website service role delete" ON storage.objects;
CREATE POLICY "School website service role delete" ON storage.objects
  FOR DELETE USING (auth.role() = 'service_role');
