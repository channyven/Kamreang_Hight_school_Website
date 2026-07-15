-- ============================================================
-- Add UNIQUE constraint on school_info.section to support upsert
-- ============================================================

-- Remove any duplicate rows first, keeping only the first one per section
DELETE FROM school_info a
USING school_info b
WHERE a.id > b.id AND a.section = b.section;

-- Now add the unique constraint
ALTER TABLE school_info ADD CONSTRAINT school_info_section_key UNIQUE (section);
