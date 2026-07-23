-- ============================================================
-- Donate Page: real bank logo images for bank accounts.
-- When logo_url is set it replaces the colored fallback tile
-- on the public Donate page and in the admin list.
-- ============================================================

ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS logo_url TEXT;
