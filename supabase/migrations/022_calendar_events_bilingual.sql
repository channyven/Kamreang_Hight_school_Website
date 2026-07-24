-- ============================================================
-- Add bilingual fields to calendar_events
-- ============================================================

ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS title_km TEXT,
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS description_km TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Migrate existing data: copy title -> title_en, description -> description_en
UPDATE calendar_events
SET
  title_en = COALESCE(title_en, title),
  title_km = COALESCE(title_km, title),
  description_en = COALESCE(description_en, description),
  description_km = COALESCE(description_km, description)
WHERE title_en IS NULL;