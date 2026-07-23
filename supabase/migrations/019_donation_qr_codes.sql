-- ============================================================
-- Donate Page: multiple mobile-payment QR codes (replaces the
-- single `donate_qr_url` settings key). Only active QR codes
-- are shown to the public.
-- ============================================================

CREATE TABLE IF NOT EXISTS donation_qr_codes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label_km   TEXT,
  label_en   TEXT,
  image_url  TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donation_qr_codes_active ON donation_qr_codes (is_active) WHERE is_active = true;

DROP TRIGGER IF EXISTS trg_donation_qr_codes_updated_at ON donation_qr_codes;
CREATE TRIGGER trg_donation_qr_codes_updated_at BEFORE UPDATE ON donation_qr_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE donation_qr_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active donation qr codes" ON donation_qr_codes;
CREATE POLICY "Public can read active donation qr codes" ON donation_qr_codes
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access donation_qr_codes" ON donation_qr_codes;
CREATE POLICY "Service role full access donation_qr_codes" ON donation_qr_codes
  USING (auth.role() = 'service_role');

-- Carry over the QR code previously stored as a settings key, then
-- remove the now-unused key. `settings.value` is JSONB, so extract
-- the raw string with #>> '{}' (a bare `value <> ''` fails to parse).
INSERT INTO donation_qr_codes (label_en, image_url, sort_order)
SELECT 'KHQR', value #>> '{}', 1
FROM settings
WHERE key = 'donate_qr_url'
  AND COALESCE(value #>> '{}', '') <> '';

DELETE FROM settings WHERE key = 'donate_qr_url';
