-- ============================================================
-- Fix teacher photo paths: the original per-name PNG files
-- (seeded by 007_admin_content_wiring.sql) were removed from
-- public/images/about/ and replaced with numbered JPGs in
-- public/images/about/teachers/. Remap DB rows to the files
-- that actually exist so the About page stops returning 400
-- from /_next/image.
-- ============================================================

UPDATE teachers SET photo_url = '/images/about/teachers/teacher-01.jpg' WHERE photo_url = '/images/about/teacher-srey-vipol.png';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-02.jpg' WHERE photo_url = '/images/about/teacher-chan-srey-pech.png';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-03.jpg' WHERE photo_url = '/images/about/teacher-heng-chandara.png';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-04.jpg' WHERE photo_url = '/images/about/teacher-nuon-sopheak.png';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-05.jpg' WHERE photo_url = '/images/about/teacher-mom-srey-leak.png';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-06.jpg' WHERE photo_url = '/images/about/teacher-pen-vitou.png';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-07.jpg' WHERE photo_url = '/images/about/teacher-ly-dany.png';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-08.jpg' WHERE photo_url = '/images/about/teacher-touch-somaly.png';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-09.jpg' WHERE photo_url = '/images/about/teacher-hun-ratanak.png';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-10.jpg' WHERE photo_url = '/images/about/teacher-sun-srey-mom.png';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-11.jpg' WHERE photo_url = '/images/about/teacher-nob-channey.png';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-12.jpg' WHERE photo_url = '/images/about/teacher-chhour-manith.png';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-13.jpg' WHERE photo_url = '/images/about/teacher-sreap-mara.png';
UPDATE teachers SET photo_url = '/images/about/teachers/teacher-14.jpg' WHERE photo_url = '/images/about/teacher-van-srina.png';
