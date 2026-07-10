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
├── contexts/AuthContext.tsx  # Firebase + Supabase auth bridge
├── i18n/                    # next-intl config
├── lib/                     # Supabase, Firebase, utils, validations
└── types/                   # TypeScript interfaces
messages/
├── km.json                  # Khmer translations
└── en.json                  # English translations
supabase/migrations/
├── 001_initial_schema.sql   # Full DB schema with RLS
├── 002_seed_data.sql        # Seed categories + leadership
└── 003_storage.sql          # Storage buckets + policies
```

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

