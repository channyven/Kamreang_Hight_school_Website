-- ============================================================
-- Remove Activities feature
-- ============================================================

-- Redefine increment_view_count without the activities branch
-- (search_path pinned to avoid privilege escalation)
CREATE OR REPLACE FUNCTION increment_view_count(p_table TEXT, p_id UUID)
RETURNS VOID AS $$
BEGIN
  IF p_table = 'news' THEN
    UPDATE news SET view_count = view_count + 1 WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Tables (CASCADE drops their triggers, RLS policies, and indexes)
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS activity_categories CASCADE;

-- Storage policy for the removed bucket
DROP POLICY IF EXISTS "Public read activity images" ON storage.objects;

-- Storage bucket (also removes its objects)
DELETE FROM storage.objects WHERE bucket_id = 'activity-images';
DELETE FROM storage.buckets WHERE id = 'activity-images';
