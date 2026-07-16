-- ============================================================
-- Performance: recompress the 3 large milestone images (PNG/JPG,
-- 840KB-3.4MB) to WebP at quality 80 (57-90% smaller). The school
-- founding photo was also resized from 2048x2048 down to a 1200px
-- max dimension — it's only ever displayed in a ~208px-tall card,
-- so this has no visible effect. Repoint the DB rows to .webp.
-- ============================================================

UPDATE milestones SET image_url = '/images/about/school%20founding.webp' WHERE image_url = '/images/about/school%20founding.jpg';
UPDATE milestones SET image_url = '/images/about/Best%20School%20Award.webp' WHERE image_url = '/images/about/Best%20School%20Award.png';
UPDATE milestones SET image_url = '/images/about/Enrollment%20Growth.webp' WHERE image_url = '/images/about/Enrollment%20Growth.png';
