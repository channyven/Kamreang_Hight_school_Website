-- ============================================================
-- Add phone/gender to leadership + add Ung Kanputheara as Principal
-- ============================================================

-- Add columns for phone and gender (idempotent)
ALTER TABLE leadership ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE leadership ADD COLUMN IF NOT EXISTS gender TEXT;

-- Insert Ung Kanputheara as School Principal (sort_order = 1)
-- Use INSERT ... ON CONFLICT so it's safe to re-run
INSERT INTO leadership (name_km, name_en, title_km, title_en, position_km, position_en, phone, gender, sort_order, is_active)
VALUES (
  'អ៊ុង កនពុទ្ធារ៉ា',
  'Ung Kanputheara',
  'នាយកវិទ្យាល័យ',
  'School Principal',
  'នាយកវិទ្យាល័យ',
  'School Principal',
  '095858545',
  'Male',
  1,
  true
)
ON CONFLICT (id) DO NOTHING;
