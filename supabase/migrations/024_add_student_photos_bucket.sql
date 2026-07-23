-- ============================================================
-- Storage bucket for student photos (STORAGE_BUCKETS.STUDENT_PHOTOS)
-- ============================================================

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('student-photos', 'student-photos', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Public read
DROP POLICY IF EXISTS "Public read student photos" ON storage.objects;
CREATE POLICY "Public read student photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'student-photos');

-- Service role full access
DROP POLICY IF EXISTS "School website service role student photos" ON storage.objects;
CREATE POLICY "School website service role student photos" ON storage.objects
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
