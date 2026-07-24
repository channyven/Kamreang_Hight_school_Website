-- ============================================================================
-- 025_report_custom_sections.sql
-- Dynamic, admin-created School Report sections
--
-- The School Report is otherwise made of 16 fixed Ministry-format sections
-- stored in school_reports.content (see 018_school_reports.sql). This table
-- adds an *additional*, genuinely dynamic layer on top: admins can create
-- their own numbered sections, each made of subsections, each made of
-- content blocks (key-value / table / list / paragraph), stored as JSONB
-- for the same flexible-editing reason school_reports.content is JSONB.
--
-- Idempotent / paste-safe: guards every CREATE so re-running the file in the
-- Supabase SQL editor is safe.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.report_custom_sections (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_number integer NOT NULL DEFAULT 1,
  title_km       text NOT NULL,
  title_en       text NOT NULL,
  is_active      boolean NOT NULL DEFAULT true,
  subsections    jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by     uuid,
  updated_by     uuid,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_custom_sections_active
  ON public.report_custom_sections (is_active, section_number);

-- ─── Audit trigger (updated_at) ────────────────────────────────────────────
-- Defined here too (not just in 018_school_reports.sql) in case that
-- migration wasn't applied on this project — CREATE OR REPLACE is a safe
-- no-op if it already exists with the same definition.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_report_custom_sections_updated_at'
  ) THEN
    CREATE TRIGGER trg_report_custom_sections_updated_at
      BEFORE UPDATE ON public.report_custom_sections
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ─── Row Level Security ───────────────────────────────────────────────────
-- Same pattern as report_files: admins get full access, public visitors get
-- read-only on active rows.
--
-- Defined here too (not just in 017_admin_rls_policies.sql) in case that
-- migration wasn't applied on this project — CREATE OR REPLACE is a safe
-- no-op if it already exists with the same definition. Depends only on
-- admin_users (created in 001_initial_schema.sql) and the built-in auth.uid().

CREATE OR REPLACE FUNCTION public.is_active_admin()
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

ALTER TABLE public.report_custom_sections ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'report_custom_sections_admin_all'
  ) THEN
    CREATE POLICY report_custom_sections_admin_all ON public.report_custom_sections
      FOR ALL
      TO authenticated
      USING (public.is_active_admin())
      WITH CHECK (public.is_active_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'report_custom_sections_public_read'
  ) THEN
    CREATE POLICY report_custom_sections_public_read ON public.report_custom_sections
      FOR SELECT
      TO anon, authenticated
      USING (is_active = true);
  END IF;
END $$;
