-- ============================================================================
-- 018_school_reports.sql
-- School Operations Report + Report File library
--
-- Two complementary pieces (the admin chose "both combined"):
--   1. school_reports  : ONE editable annual Operations Report per academic
--                         year. All section content is stored in a single
--                         JSONB `content` column for flexible editing without
--                         schema churn.
--   2. report_files    : a library of downloadable report files (annual PDFs,
--                         forms, etc.) mirroring the `downloads` table pattern.
--
-- Idempotent / paste-safe: guards every CREATE so re-running the file in the
-- Supabase SQL editor is safe.
-- ============================================================================

-- ─── 1. school_reports ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.school_reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year text NOT NULL,
  content       jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published  boolean NOT NULL DEFAULT false,
  created_by    uuid,
  updated_by    uuid,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- One operations report per academic year.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'school_reports_academic_year_key'
  ) THEN
    ALTER TABLE public.school_reports
      ADD CONSTRAINT school_reports_academic_year_key UNIQUE (academic_year);
  END IF;
END $$;

-- ─── 2. report_files ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.report_files (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_km      text NOT NULL,
  title_en      text NOT NULL,
  description_km text,
  description_en text,
  file_url      text NOT NULL,
  file_name     text NOT NULL,
  category      text NOT NULL DEFAULT 'report'
                CHECK (category IN ('report','result','form','policy','other')),
  academic_year text,
  sort_order    integer NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_by    uuid,
  updated_by    uuid,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_files_category
  ON public.report_files (category);
CREATE INDEX IF NOT EXISTS idx_report_files_active
  ON public.report_files (is_active, sort_order);

-- ─── Audit triggers (updated_at) ──────────────────────────────────────────

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
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_school_reports_updated_at'
  ) THEN
    CREATE TRIGGER trg_school_reports_updated_at
      BEFORE UPDATE ON public.school_reports
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_report_files_updated_at'
  ) THEN
    CREATE TRIGGER trg_report_files_updated_at
      BEFORE UPDATE ON public.report_files
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ─── Row Level Security ───────────────────────────────────────────────────
-- Admins (via Firebase-JWT) get full access; public visitors get read-only on
-- published rows. Reuses is_active_admin() from 017_admin_rls_policies.sql.

ALTER TABLE public.school_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_files   ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'school_reports_admin_all'
  ) THEN
    CREATE POLICY school_reports_admin_all ON public.school_reports
      FOR ALL
      TO authenticated
      USING (public.is_active_admin())
      WITH CHECK (public.is_active_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'school_reports_public_read'
  ) THEN
    CREATE POLICY school_reports_public_read ON public.school_reports
      FOR SELECT
      TO anon, authenticated
      USING (is_published = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'report_files_admin_all'
  ) THEN
    CREATE POLICY report_files_admin_all ON public.report_files
      FOR ALL
      TO authenticated
      USING (public.is_active_admin())
      WITH CHECK (public.is_active_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'report_files_public_read'
  ) THEN
    CREATE POLICY report_files_public_read ON public.report_files
      FOR SELECT
      TO anon, authenticated
      USING (is_active = true);
  END IF;
END $$;

-- ─── Seed default operations report for the current year ──────────────────

INSERT INTO public.school_reports (academic_year, content, is_published)
SELECT '2024-2025', '{}'::jsonb, false
WHERE NOT EXISTS (
  SELECT 1 FROM public.school_reports WHERE academic_year = '2024-2025'
);
