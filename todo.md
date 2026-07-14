# Todo — Code Review Fixes

> Generated from full project code review.

---

## 🔴 Critical

- [ ] **CRIT-1: Add auth guards to all server actions**
  - Every action in `src/actions/*.ts` uses service-role Supabase client with zero caller verification.
  - **Branch:** `fix/auth-server-actions`

- [ ] **CRIT-2: Verify Firebase ID token in session API**
  - `src/app/api/auth/session/route.ts` stores token without Firebase Admin verification. Middleware only checks cookie existence.
  - **Branch:** `fix/verify-session-cookie`

- [ ] **CRIT-3: Remove or protect diagnostic route**
  - `src/app/api/diagtmp/route.ts` lets anyone create admin users via `?email=` — permanent privilege escalation.
  - **Branch:** `fix/remove-diag-route`

## 🔴 High

- [ ] **HIGH-1: Clear old `is_current` in `setCurrentStatistics`**
  - `src/actions/statistics.ts:46-58` only sets `true` on one row, never resets others.
  - **Branch:** `fix/statistics-is-current-clear`

- [ ] **HIGH-2: Complete user creation flow**
  - `src/actions/users.ts:20-27` discards password, inserts fake `firebase_uid`, user can never log in.
  - **Branch:** `fix/user-creation-flow`

## 🟡 Medium

- [ ] **MED-1: Deduplicate login pages**
  - Two routes: `[locale]/(auth)/login` and `[locale]/auth/login`. Remove one.
  - **Branch:** `fix/deduplicate-login-pages`

- [ ] **MED-2: Fix hardcoded Khmer text on English About page**
  - `src/app/[locale]/(public)/about/page.tsx:120` shows Khmer string for both locales.
  - **Branch:** `fix/about-page-english-text`

- [ ] **MED-3: Fix slug generation stripping non-ASCII**
  - `src/lib/utils.ts:57-64` strips Khmer characters, producing empty slugs.
  - **Branch:** `fix/slug-non-ascii-support`

- [ ] **MED-4: Clear `is_current` in create/update statistics**
  - `createStatistics` and `updateStatistics` don't unset `is_current` on other rows.
  - **Branch:** `fix/statistics-create-update-is-current`

- [ ] **MED-5: Replace hardcoded school name in sidebar**
  - `src/components/admin/AdminSidebar.tsx:85` hardcodes "Kamrieng High School".
  - **Branch:** `fix/sidebar-school-name-config`

- [ ] **MED-6: Fix invalid Tailwind classes `w-4.5`/`h-4.5`**
  - `src/components/admin/AdminSidebar.tsx:46-54` uses sizes not in Tailwind v3 defaults.
  - **Branch:** `fix/invalid-tailwind-sizes`

- [ ] **MED-7: Fix dashboard stat card grid layout**
  - `src/app/[locale]/(admin)/admin/page.tsx:93` — `lg:grid-cols-4` but only 2 cards.
  - **Branch:** `fix/dashboard-grid-cols`

## 🔵 Low

- [ ] **LOW-1: Handle unhandled promise rejection in AuthContext**
  - `src/providers/AuthContext.tsx:78-80` — no try-catch on `setSessionCookie(null)` fetch.
  - **Branch:** `fix/auth-context-unhandled-rejection`

- [ ] **LOW-2: Fix phone regex allowing empty string**
  - `src/schemas/validations.ts:17-20` — `*` quantifier matches empty string; should be `+`.
  - **Branch:** `fix/phone-regex-empty-match`

---

## Priority Order

1. **CRIT-1, CRIT-2, CRIT-3** — security vulnerabilities
2. **HIGH-1, HIGH-2** — data integrity & broken user flow
3. **MED-1 through MED-7** — UX, correctness, polish
4. **LOW-1, LOW-2** — edge cases
