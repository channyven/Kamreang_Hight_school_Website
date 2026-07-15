-- ============================================================
-- Storage bucket for school / about-page images
-- ============================================================

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('school-images', 'school-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Public read
DROP POLICY IF EXISTS "Public read school images" ON storage.objects;
CREATE POLICY "Public read school images" ON storage.objects
  FOR SELECT USING (bucket_id = 'school-images');

-- Service role full access
DROP POLICY IF EXISTS "School website service role school images" ON storage.objects;
CREATE POLICY "School website service role school images" ON storage.objects
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
