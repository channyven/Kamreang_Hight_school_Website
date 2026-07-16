-- ============================================================
-- Fix stale teacher photo_url references: all 14 teacher photo
-- files on disk were converted to .webp (only .webp files exist
-- in public/images/about/teachers/ now), but only 6 of the 14 DB
-- rows were updated to match when that conversion happened.
-- The other 8 still pointed at deleted .jpg files, causing broken
-- images in both the admin teacher list and the public About page.
-- ============================================================

UPDATE teachers SET photo_url = '/images/about/teachers/teacher-03.webp' WHERE photo_url = '/images/about/teachers/teacher-03.jpg';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-04.webp' WHERE photo_url = '/images/about/teachers/teacher-04.jpg';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-05.webp' WHERE photo_url = '/images/about/teachers/teacher-05.jpg';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-06.webp' WHERE photo_url = '/images/about/teachers/teacher-06.jpg';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-07.webp' WHERE photo_url = '/images/about/teachers/teacher-07.jpg';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-10.webp' WHERE photo_url = '/images/about/teachers/teacher-10.jpg';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-13.webp' WHERE photo_url = '/images/about/teachers/teacher-13.jpg';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-14.webp' WHERE photo_url = '/images/about/teachers/teacher-14.jpg';
