-- ============================================================
-- Migration 022: Lock down student PII
--
-- 019_add_student_rls_policies.sql added `USING (true)` anon SELECT
-- on `students`. The anon key is the public NEXT_PUBLIC_SUPABASE_ANON_KEY
-- shipped in every page's JS bundle, so that policy let anyone query the
-- Supabase REST API directly and read the full students table — names,
-- date of birth, phone, email, home address, GPA, and qr_token (the
-- secret the /verify/[token] page relies on to prove a physical card
-- scan). All admin reads/writes now go through server actions
-- (src/actions/students.ts) using the service-role client, which
-- bypasses RLS and is gated by requireAdmin(). The public /verify and
-- /student pages already use the service-role client too. So anon no
-- longer needs any access to this table at all.
-- ============================================================

DROP POLICY IF EXISTS "Allow anon read students" ON students;

-- departments / classes anon SELECT policies are left as-is — they only
-- expose non-sensitive directory data (names, codes, capacity).
