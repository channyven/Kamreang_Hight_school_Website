-- ============================================================
-- Migration 019: Add RLS policies for students, departments, classes
-- The browser client uses the anon key, so we need SELECT policies
-- for the anon role. Mutations (insert/update/delete) remain
-- protected behind service_role policies and server actions.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- Enable RLS on tables (idempotent)
-- ─────────────────────────────────────────────────────────────

ALTER TABLE IF EXISTS students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classes ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- STUDENTS – anon SELECT only
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Allow anon read students" ON students;
CREATE POLICY "Allow anon read students" ON students
  FOR SELECT
  USING (true);

-- Keep existing service_role policy for full CRUD
DROP POLICY IF EXISTS "Service role full access students" ON students;
CREATE POLICY "Service role full access students" ON students
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────
-- DEPARTMENTS – anon SELECT only
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Allow anon read departments" ON departments;
CREATE POLICY "Allow anon read departments" ON departments
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role full access departments" ON departments;
CREATE POLICY "Service role full access departments" ON departments
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────
-- CLASSES – anon SELECT only
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Allow anon read classes" ON classes;
CREATE POLICY "Allow anon read classes" ON classes
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role full access classes" ON classes;
CREATE POLICY "Service role full access classes" ON classes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
