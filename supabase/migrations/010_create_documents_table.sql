-- ============================================================
-- Documents Table
-- Stores uploaded/shared documents that appear on the public
-- Documents page (e.g. reports, exam results, forms, policies).
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- ENUM for document categories
-- ─────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE document_category AS ENUM ('report', 'result', 'form', 'policy', 'other');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────
-- DOCUMENTS TABLE
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_km        TEXT NOT NULL,
  title_en        TEXT NOT NULL,
  description_km  TEXT,
  description_en  TEXT,
  file_url        TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  file_size       INTEGER,
  file_type       TEXT,
  category        document_category NOT NULL DEFAULT 'other',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  uploaded_by     UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_documents_active ON documents (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents (category);
CREATE INDEX IF NOT EXISTS idx_documents_sort ON documents (sort_order ASC, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: auto-update updated_at
-- ─────────────────────────────────────────────────────────────

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Public can read active documents
CREATE POLICY "Public can read active documents"
  ON documents FOR SELECT
  USING (is_active = true);

-- Service role full access (for server-side operations)
CREATE POLICY "Service role full access documents"
  ON documents
  USING (auth.role() = 'service_role');
