-- ============================================================
-- Donate Page: manageable bank accounts (previously hardcoded
-- in the public donate page). Only active accounts are shown
-- to the public.
-- ============================================================

CREATE TABLE IF NOT EXISTS bank_accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_name_km    TEXT NOT NULL,
  bank_name_en    TEXT NOT NULL,
  account_name_km TEXT NOT NULL,
  account_name_en TEXT NOT NULL,
  account_number  TEXT NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD / KHR',
  logo_color      TEXT NOT NULL DEFAULT '#00376f',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts (is_active) WHERE is_active = true;

DROP TRIGGER IF EXISTS trg_bank_accounts_updated_at ON bank_accounts;
CREATE TRIGGER trg_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active bank accounts" ON bank_accounts;
CREATE POLICY "Public can read active bank accounts" ON bank_accounts
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access bank_accounts" ON bank_accounts;
CREATE POLICY "Service role full access bank_accounts" ON bank_accounts
  USING (auth.role() = 'service_role');

-- Seed with the accounts currently hardcoded on the public donate page
INSERT INTO bank_accounts (bank_name_km, bank_name_en, account_name_km, account_name_en, account_number, currency, logo_color, sort_order) VALUES
  ('ធនាគារ ABA', 'ABA Bank', 'វិទ្យាល័យកំរៀង', 'Kamrieng High School', '000 123 456', 'USD / KHR', '#0066cc', 1),
  ('ធនាគារ ACLEDA', 'ACLEDA Bank', 'វិទ្យាល័យកំរៀង', 'Kamrieng High School', '001 987 654', 'USD / KHR', '#e62020', 2)
ON CONFLICT DO NOTHING;
