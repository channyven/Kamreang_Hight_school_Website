-- ─────────────────────────────────────────────────────────────
-- Achievement Photo Gallery
-- ─────────────────────────────────────────────────────────────
-- Adds a JSONB column to store an array of image URLs (strings)
-- that make up the photo gallery for an achievement.
-- Google Drive share links are converted to direct URLs client-side.

ALTER TABLE achievements
  ADD COLUMN gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb;
