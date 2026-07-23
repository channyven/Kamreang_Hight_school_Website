# High School Website Management System

A production-ready, bilingual (Khmer + English) full-stack school website built with Next.js 15, Firebase Auth, and Supabase PostgreSQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Auth | Firebase Authentication |
| Database | Supabase PostgreSQL (with RLS) |
| Storage | Supabase Storage |
| i18n | next-intl (Khmer + English) |
| Animation | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Deployment | Vercel |

## Features

- **Bilingual**: Full Khmer/English support with locale-prefixed routes (`/km/`, `/en/`)
- **Three roles**: Administrator, Director, Editor with RBAC
- **Public site**: Hero, Stats (animated counters), News, Activities, Achievements, Gallery, Downloads, Contact, About
- **Admin dashboard**: Full CRUD for all modules, user management, audit logs, settings
- **SEO**: Dynamic sitemap, robots.txt, Open Graph, JSON-LD structured data

## Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (public)/        # Public website pages
│   │   ├── (admin)/admin/   # Admin dashboard pages
│   │   └── (auth)/          # Login page
│   ├── api/auth/session/    # Session cookie endpoint
│   ├── sitemap.ts
│   └── robots.ts
├── actions/                  # Server Actions (CRUD)
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── public/              # Public site components
│   └── admin/               # Admin components
├── providers/AuthContext.tsx # Firebase + Supabase auth bridge
├── i18n/                    # next-intl config
│   └── locales/             # Khmer + English translations (json)
├── lib/
│   ├── firebase/            # Firebase SDK client
│   ├── supabase/            # Supabase clients + storage helpers
│   ├── queries.ts           # Cached server reads
│   └── ...                  # mock-data, structured-data, upload
├── schemas/                 # Zod validation schemas
├── styles/globals.css       # Tailwind base styles
├── types/                   # TypeScript interfaces
└── utils/                   # Helper functions (cn, dates, formatting)
```

## Database and Storage
Supabase migrations are located in `supabase/migrations/`:
- `001_initial_schema.sql` — Full DB schema with RLS
- `002_seed_data.sql` — Seed categories + leadership
- `003_storage.sql` — Storage buckets + policies

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd school-website
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SITE_URL` — Your production domain
- `NEXT_PUBLIC_FIREBASE_*` — Firebase project config (from Firebase Console)
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project (from Supabase Dashboard → Settings → API)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (kept server-side only)

### 3. Firebase setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → Create project
2. Enable **Authentication** → Sign-in methods: Email/Password + Google
3. Add your domain to **Authorized domains**
4. Copy Web App config to `.env.local`

### 4. Supabase setup

1. Create project at [supabase.com](https://supabase.com)
2. Run migrations in order via **SQL Editor**:
   ```sql
   -- Run each file in order:
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_seed_data.sql
   supabase/migrations/003_storage.sql
   ```
3. Copy URL + anon key + service role key to `.env.local`

### 5. Create first admin user

After running migrations, insert your first admin user manually via Supabase SQL Editor:

```sql
INSERT INTO users (firebase_uid, email, full_name, role, is_active)
VALUES ('YOUR_FIREBASE_UID', 'admin@school.edu.kh', 'Admin Name', 'administrator', true);
```

Get `firebase_uid` from Firebase Console → Authentication → Users.

### 6. Run locally

```bash
npm run dev
```

Visit:
- Public site: `http://localhost:3000/km` (Khmer) or `http://localhost:3000/en` (English)
- Admin: `http://localhost:3000/km/admin`

## Troubleshooting

### Common Issues

- **Database Connection Error**: Ensure Supabase environment variables are correct and the database is accessible.
- **Firebase Auth Error**: Check if your Firebase project is correctly configured and the domain is authorized.
- **Image Loading Issues**: If images from external sources don't load, verify they are proxied via `/api/proxy-image` or their domain is added to `next.config.ts`.
- **Translation Missing**: If a page shows raw translation keys (e.g., `common.title`), ensure the key exists in `src/i18n/locales/km.json` and `en.json`.

### Known Issues

- **Duplicate Login Pages**: There are two sets of login pages (`[locale]/(auth)/login` and `[locale]/auth/login`). Use the localized one for standard auth.
- **Large Images**: Some legacy images in `public/images/about` are in PNG format. New images should be uploaded as WebP.
- **Lint Warnings**: There are some pre-existing lint warnings in older components that are scheduled for refactoring.

## Maintenance & Monitoring

### Maintenance Checklist

| Frequency | Task |
|-----------|------|
| **Weekly** | Run `npm update` for minor dependency patches. |
| **Monthly** | Perform a security audit via `npm audit`. |
| **Monthly** | Verify Supabase storage usage and cleanup unused files. |
| **Quarterly** | Run Lighthouse performance audits and optimize assets. |

### Monitoring & Backups

- **Error Logging**: The system uses a centralized logger in `src/lib/error-logger.ts`. Monitor server logs (Vercel/Console) for "HIGH" severity errors.
- **Uptime**: Configure monitoring (e.g., UptimeRobot) for the production URL.
- **Backups**: Supabase performs automatic daily backups of the database. Manual exports can be done via the Supabase Dashboard.
- **Storage**: Ensure periodic review of uploaded files in Supabase Storage to prevent quota issues.

## API Documentation

See [API_DOCS.md](./API_DOCS.md) for details on internal REST endpoints.

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Deploy — Vercel auto-detects Next.js

## User Roles

| Permission | Administrator | Director | Editor |
|-----------|:---:|:---:|:---:|
| Manage users | ✓ | — | — |
| Manage settings | ✓ | — | — |
| View audit logs | ✓ | — | — |
| Publish content | ✓ | ✓ | — |
| Delete content | ✓ | — | — |
| Manage statistics | ✓ | ✓ | — |
| Create/edit content | ✓ | ✓ | ✓ |

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `school-blue` | `#1e3a8a` | Primary brand, navbar, buttons |
| `school-gold` | `#f59e0b` | Accent, highlights, featured |

--------------------------------------------------------------------

## Changelog — `bug/clean-structure-project` (2026-07-13)

### 1. Folder structure refactor (two passes, zero functional change)

**6 files moved with `git mv` (history preserved):**

| From | To |
|---|---|
| `src/contexts/AuthContext.tsx` | `src/providers/AuthContext.tsx` |
| `src/lib/validations.ts` | `src/schemas/validations.ts` |
| `src/app/globals.css` | `src/styles/globals.css` |
| `src/lib/utils.ts` | `src/utils/index.ts` |
| `src/lib/firebase.ts` | `src/lib/firebase/index.ts` |
| `src/lib/supabase.ts` | `src/lib/supabase/index.ts` |

**Imports updated across ~55 files:**

- `@/contexts/AuthContext` → `@/providers/AuthContext` (8 files)
- `@/lib/validations` → `@/schemas/validations` (13 files)
- `@/lib/utils` → `@/utils` (37 files — all `components/ui/*`, public/admin components, pages)
- `./globals.css` → `../styles/globals.css` (1 file: `src/app/layout.tsx`)
- `@/lib/firebase` and `@/lib/supabase` needed no changes (they resolve to the new `index.ts` automatically)

**`tsconfig.json`:** `@/contexts/*` alias replaced with `@/providers/*`; added `@/schemas/*` and `@/utils/*`.

Deliberately **not** created: `features/`, `store/`, `hooks/`, `permissions/`, `constants/`, `config/`, i18n `locales/` split — all would be empty folders or architectural changes, not file moves.

### 2. Bug fixes

- **`next.config.ts`** — added `*.supabase.co/storage/v1/object/public/**` to `images.remotePatterns`; previously any Supabase-hosted image returned 400 from `/_next/image`.
- **Teacher photos 400** — the live Supabase DB had 14 `teachers.photo_url` rows pointing at deleted files (`teacher-van-srina.png` etc.). Updated all 14 rows in the live DB to the real files (`/images/about/teachers/teacher-01.jpg`…`14.jpg`), recorded in `supabase/migrations/010_fix_teacher_photo_paths.sql`. *This migration is already applied to the live DB — no need to run it again.*
- **`src/lib/mock-data.ts`** — removed 2 leadership `photo_url` entries pointing at deleted `leader-*.png` files.
- **`package.json`** — resolved the merge conflict, restored `firebase-admin`, re-enabled `"lint": "next lint"`.
- **Port 3000** — killed a stale `node.exe` process squatting on it; the dev server binds 3000 again.

### 3. Docs

- **`README.md`** — project-structure diagram updated to the new layout.
- **`todo.md`** — 2 file references updated to the moved paths.

### Verified

`tsc --noEmit` clean · lint at pre-existing baseline (nothing new) · production build succeeds (29 routes) · live smoke test: all public routes 200, `/km/admin` auth-gate 307, About page renders all 14 new teacher images.

### Still open (not touched)

- 14 pre-existing lint errors (incl. a real `useCounter` conditional-hook bug in `AboutPageClient.tsx:193`)
- Unauthenticated `/api/diagtmp` route (CRIT-3 in `todo.md`) — anyone can grant themselves admin via `?email=`
- Duplicate login pages (`[locale]/(auth)/login` vs `[locale]/auth/login`)
- `fix_package.js` at repo root — if ever run, it silently disables linting again
- Migration numbering collision at merge time: this branch has `009_update_school_info_content.sql`, `feat/governance` has `009_governance_items.sql` — renumber one when merging
