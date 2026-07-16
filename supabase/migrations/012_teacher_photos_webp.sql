-- ============================================================
-- Performance: recompress the 6 teacher photos that were over
-- 200KB (JPG) to WebP at quality 80 (60-92% smaller, same visual
-- content). Repoint the DB rows to the new .webp files.
-- ============================================================

UPDATE teachers SET photo_url = '/images/about/teachers/teacher-01.webp' WHERE photo_url = '/images/about/teachers/teacher-01.jpg';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-02.webp' WHERE photo_url = '/images/about/teachers/teacher-02.jpg';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-08.webp' WHERE photo_url = '/images/about/teachers/teacher-08.jpg';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-09.webp' WHERE photo_url = '/images/about/teachers/teacher-09.jpg';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-11.webp' WHERE photo_url = '/images/about/teachers/teacher-11.jpg';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-12.webp' WHERE photo_url = '/images/about/teachers/teacher-12.jpg';
