-- ============================================================
-- Admin (CMS) write access via Firebase JWT
--
-- The Flutter admin app authenticates with Firebase and sends the
-- Firebase ID token. Supabase is configured with the Firebase JWT
-- template, so the Firebase UID is available as auth.uid() (the
-- `sub` claim). admin_users.firebase_uid stores that UID.
--
-- These policies let an ACTIVE admin (matched by firebase_uid) read
-- and write the CMS tables. They complement — and safely replace the
-- need for — shipping the service_role key in the client.
--
-- Apply with DROP POLICY IF EXISTS because the project is shared.
-- ============================================================

-- Helper: is the current Firebase user an active admin?
CREATE OR REPLACE FUNCTION is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE firebase_uid = auth.uid()::text
      AND is_active = true
  );
$$;

-- ─── news ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage news" ON news;
CREATE POLICY "Admins can manage news" ON news
  FOR ALL
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- ─── news_categories ──────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage news_categories" ON news_categories;
CREATE POLICY "Admins can manage news_categories" ON news_categories
  FOR ALL
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- ─── achievements ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage achievements" ON achievements;
CREATE POLICY "Admins can manage achievements" ON achievements
  FOR ALL
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- ─── teachers ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage teachers" ON teachers;
CREATE POLICY "Admins can manage teachers" ON teachers
  FOR ALL
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- ─── leadership ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage leadership" ON leadership;
CREATE POLICY "Admins can manage leadership" ON leadership
  FOR ALL
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- ─── school_info ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage school_info" ON school_info;
CREATE POLICY "Admins can manage school_info" ON school_info
  FOR ALL
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- ─── statistics ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage statistics" ON statistics;
CREATE POLICY "Admins can manage statistics" ON statistics
  FOR ALL
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- ─── messages ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage messages" ON messages;
CREATE POLICY "Admins can manage messages" ON messages
  FOR ALL
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- ─── documents ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage documents" ON documents;
CREATE POLICY "Admins can manage documents" ON documents
  FOR ALL
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- ─── governance_items ─────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage governance_items" ON governance_items;
CREATE POLICY "Admins can manage governance_items" ON governance_items
  FOR ALL
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- ─── milestones ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage milestones" ON milestones;
CREATE POLICY "Admins can manage milestones" ON milestones
  FOR ALL
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- ─── settings ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage settings" ON settings;
CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- ─── admin_users (self/limited) ───────────────────────────────
-- Admins may read the admin list; only service_role may insert/delete.
DROP POLICY IF EXISTS "Admins can read admin_users" ON admin_users;
CREATE POLICY "Admins can read admin_users" ON admin_users
  FOR SELECT
  USING (is_active_admin());
