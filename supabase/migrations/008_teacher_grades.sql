-- ============================================================
-- Teachers: track which grades (7-12) each teacher is assigned
-- to teach, so the public site can group teachers by grade.
-- ============================================================

ALTER TABLE teachers ADD COLUMN IF NOT EXISTS grade_levels INTEGER[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_teachers_grade_levels ON teachers USING GIN (grade_levels);
