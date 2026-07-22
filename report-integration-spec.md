# Report Page Frontend-Backend Integration Spec

## Overview

**Goal**: Wire the public report page to fetch real data from the Supabase `school_reports` table instead of always using the hardcoded mock data in `src/lib/report-data.ts`. This ensures the public page displays what the admin edits in the operations report editor.

---

## Current Architecture

### DB Tables
| Table | Purpose | Key Columns |
|---|---|---|
| `school_reports` | Single operations report per academic year | `id`, `academic_year` (unique), `content` (JSONB), `is_published`, `created_at`, `updated_at` |
| `report_files` | Library of downloadable report PDFs/forms | `id`, `title_km`, `title_en`, `file_url`, `category`, `sort_order`, `is_active` |

### Admin Editor (Works — real DB)
- **Page**: `src/app/[locale]/(admin)/admin/reports/operations/page.tsx`
- **Action**: `getOperationsReport()` (admin-auth required) → returns `SchoolReport` from `types/index.ts`
- **Type used**: `SchoolReport` from `@/types` — has `{ id, academic_year, content: OperationsReportContent, is_published }`
- **Content type**: `OperationsReportContent` — flat snake_case JSON fields (e.g. `principal_km`, `total_staff`, `items` array)

### Public Report Page (Broken — mock data)
- **Page**: `src/app/[locale]/(public)/report/page.tsx`
- **Data source**: `const report = schoolReport; // Use mock data` (line 17)
- **Type used**: `SchoolReport` from `@/lib/report-data` — has camelCase fields with `LocalizedText` objects like `{ km: "...", en: "..." }`
- **The two `SchoolReport` types are COMPLETELY DIFFERENT** and incompatible.

### Type System Gap
| Aspect | `@/types` (DB Shape) | `@/lib/report-data` (UI Shape) |
|---|---|---|
| Field naming | `snake_case` | `camelCase` |
| Localized fields | Flat: `principal_km`, `principal_en` | Object: `principal: { km: "...", en: "..." }` |
| Nested structures | Arrays of flat objects (e.g. `{ label_km, label_en, value }`) | Arrays with `LocalizedText` (e.g. `{ label: { km, en }, value }`) |
| Extra sections | Missing `dailySchedule`, `selfAssessment`, `awards`, `timetables`, `feederSchools`, `academicResults`, `textbookStatus` | Present in UI shape |
| `staffStatus` color | Not present in DB | `color: string` field in UI shape |

### Report Sections (Frontend UI)
The frontend `ReportSections.tsx` renders 16 sections from `reportSections` array:
1. `general` → `GeneralInfoSection`
2. `teachingHours` → `TeachingHoursSection`
3. `regularTesting` → `RegularTestingSection`
4. `planning` → `PlanningSection`
5. `agreements` → `AgreementsSection`
6. `selfAssessment` → `SelfAssessmentSection`
7. `awards` → `AwardsSection`
8. `timetables` → `TimetablesSection`
9. `studentStats` → `StudentStatsSection`
10. `feederSchools` → `FeederSchoolsSection`
11. `academicResults` → `AcademicResultsSection`
12. `staffStatus` → `StaffStatusSection`
13. `textbookStatus` (rendered via `FacilitiesSection`)
14. `budget` → `BudgetSection`
15. `challenges` → `ChallengesSection`
16. `futureDirection` → `FutureDirectionSection`

### Admin Editor Sections
The admin editor (operations/page.tsx) groups fields into 5 tabs:
1. `general` — General, Teaching Hours, Regular Testing
2. `planning` — Planning, Agreements, Self-Assessment, Awards
3. `students` — Student Stats, Feeder Schools, Academic Results, Staff Status
4. `resources` — Facilities/Textbook, Budget
5. `outlook` — Challenges, Future Direction

---

## User Decisions (from Interview)

| Decision | Choice |
|---|---|
| **Data source** | Full DB integration — public page fetches from Supabase |
| **Fetch method** | Direct DB query from the page server component using `createServerClient()` |
| **Mapper location** | Add a `dbToUiSchoolReport()` function inside `src/lib/report-data.ts` |
| **No-published-report state** | Show empty/not-available state on public page |
| **Section structure** | Keep admin editor (`OperationsReportContent`) and public view (`SchoolReport` with `LocalizedText`) independent — the mapper transforms between them |
| **Published filter** | Public action returns only `is_published = true` reports |
| **URL pattern** | Always show the latest published report at `/report` |
| **Missing sections** | Default to empty arrays/objects rather than crashing |

---

## Implementation Plan

### Files to Create/Modify

#### 1. `src/lib/report-data.ts` — Add mapper function
- Add `dbToUiSchoolReport(dbReport: DbSchoolReport): SchoolReport | null`
- Transform each section from snake_case flat fields to camelCase LocalizedText objects
- For `staffStatus`: append a default `color` based on index (e.g. `bg-blue-100 text-blue-700`, `bg-violet-100 text-violet-700`, `bg-emerald-100 text-emerald-700`)
- For sections not stored in DB (`selfAssessment`, `awards`, `timetables`, `feederSchools`, `academicResults`): return empty/default objects
- For `dailySchedule` in `teachingHours`: return empty array
- For `textbookStatus` in `facilities`: return empty array
- Keep the existing mock `schoolReport` object as fallback reference

#### 2. `src/app/[locale]/(public)/report/page.tsx` — Wire to real DB
- Remove the `import { schoolReport } from "@/lib/report-data"` mock import
- Import `createServerClient` from `@/lib/supabase`
- Import `dbToUiSchoolReport` and `SchoolReport` from `@/lib/report-data`
- In the server component:
  ```ts
  const supabase = createServerClient();
  const { data } = await supabase
    .from("school_reports")
    .select("*")
    .eq("is_published", true)
    .order("academic_year", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  const report = data ? dbToUiSchoolReport(data as DbSchoolReport) : null;
  ```
- Pass `report` (which can be `SchoolReport | null`) to `ReportClient`
- If `report` is null, show a "Report not available yet" placeholder

#### 3. `src/components/public/report/ReportClient.tsx` — Handle null report
- Change prop type from `report: SchoolReport` to `report: SchoolReport | null`
- When `report` is null, render a friendly "No published report available yet" message
- When `report` exists, render the existing sections

#### 4. `src/types/index.ts` — Add DbSchoolReport interface (optional)
- Ensure `SchoolReport` from `@/types` is easily importable
- The DB shape is already defined as `SchoolReport` interface in `@/types`

### Mapping Details (DB → UI)

#### General
```
DB: principal_km, principal_en, total_staff, total_students, total_classes,
    land_area_sqm, established_year, summary_km, summary_en
UI: academicYear: { km, en }, principal: { km, en }, totalStaff, totalStudents,
    totalClasses, landAreaSqm, establishedYear, summary: { km, en }
```

#### Teaching Hours
```
DB: weekly_hours, notes_km, notes_en
UI: weeklyHours, dailySchedule: { period: { km, en }, time: string }[], notes: { km, en }
```
Note: `dailySchedule` is not stored in DB → default to `[]`.

#### Regular Testing
```
DB: monthly_tests_km, monthly_tests_en, semester_tests_km, semester_tests_en, notes_km, notes_en
UI: monthlyTests: { km, en }, semesterTests: { km, en }, notes: { km, en }
```

#### Planning
```
DB: school_improvement_plan_km/en, teacher_development_plan_km/en, student_support_plan_km/en
UI: schoolImprovementPlan: { km, en }, teacherDevelopmentPlan: { km, en }, studentSupportPlan: { km, en }
```

#### Agreements
```
DB: teacher_contracts_km/en, community_partnerships_km/en
UI: teacherContracts: { km, en }, communityPartnerships: { km, en }
```

#### Self-Assessment
```
DB: model_school_standard_km/en, score, max_score, last_assessment_date_km/en
UI: modelSchoolStandard: { km, en }, score, maxScore, lastAssessmentDate: { km, en }
```

#### Awards
```
DB: awards[].title_km, title_en, year
UI: awards[].title: { km, en }, year
```

#### Timetables
```
DB: grade7_km/en, grade8_km/en, grade9_km/en, grade10_km/en, grade11_km/en, grade12_km/en
UI: grade7: { km, en }, grade8: { km, en }, ...grade12: { km, en }
```

#### Student Stats
```
DB: items[].label_km, label_en, value, suffix; notes_km, notes_en
UI: items[].label: { km, en }, value, suffix; notes: { km, en }
```

#### Feeder Schools
```
DB: schools[].name_km, name_en, student_count
UI: schools[].name: { km, en }, studentCount
```

#### Academic Results
```
DB: grade9_pass_rate, grade12_pass_rate, top_students[].name, score
UI: grade9PassRate, grade12PassRate, topStudents[].{ name, score }
```

#### Staff Status
```
DB: [].label_km, label_en, count
UI: [].label: { km, en }, count, color (derived by index)
```

#### Facilities & Textbook
```
DB items: [].label_km, label_en, detail_km, detail_en
DB textbook: [].subject_km, subject_en, student_ratio
UI items: [].label: { km, en }, detail: { km, en }
UI textbook: [].subject: { km, en }, studentRatio
```

#### Budget
```
DB: total_budget, community_support, remaining_balance, currency,
    expenditure[].label_km, label_en, amount, notes_km, notes_en
UI: totalBudget, communitySupport, remainingBalance, currency,
    expenditure[].label: { km, en }, amount, notes: { km, en }
```
Note: current DB seed uses `items` key but UI expects `expenditure` — handle both.

#### Challenges
```
DB: [].title_km, title_en, detail_km, detail_en
UI: [].title: { km, en }, detail: { km, en }
```

#### Future Direction
```
DB: [].km, en
UI: [].{ km, en } (already same shape)
```

### Edge Cases

1. **No published report**: Show placeholder, return null from mapper
2. **Partially filled content**: Each field should gracefully handle undefined/missing values by defaulting to empty string `""`, zero `0`, or empty array `[]`
3. **Missing sections entirely**: If a top-level key (e.g. `self_assessment`) is absent from the JSONB, the mapper should return the default empty object for that section
4. **Extra fields in DB that don't exist in UI**: Ignored (just not mapped)
5. **Different academic year format**: Validate YYYY-YYYY format, pass through as-is

### Database Query Details

```sql
-- In the server component:
SELECT * FROM school_reports
WHERE is_published = true
ORDER BY academic_year DESC
LIMIT 1;
```

The public `supabase` anon client respects RLS, which already allows `anon` users to `SELECT` from `school_reports` where `is_published = true`. However, since we're in a Server Component, we can use `createServerClient()` (service role) for reliability.

### No-Data State UI
When `report` is null:
- Keep the page layout structure (header, container)
- Replace the `<div className="bg-white rounded-2xl ...">` content with:
  - A centered card with an icon (e.g. `FileBarChart`)
  - Title: "School Operations Report" (from translations)
  - Message: "The school operations report is not yet available. Please check back later."
  - Both in KM and EN based on locale

---

## Testing Plan

1. **Verify mapper function**: Unit test the `dbToUiSchoolReport()` with:
   - Complete seed data (matching `019_seed_school_reports.sql`)
   - Empty content `{}`
   - Partially filled content
2. **Verify public page renders real data**: After seeding, confirm the public page shows:
   - Principal name, staff count, student count
   - All 16 sections render
   - Khmer and English locales work
3. **Verify admin editor still works**: Edit and save via admin, refresh public page to see changes
4. **Verify empty state**: Remove published flag from DB, confirm public page shows placeholder
5. **Type-check**: Run `tsc --noEmit` to verify type compatibility

---

## Risk / Open Issues

1. **`dailySchedule` not editable in admin**: The admin editor doesn't have fields for the daily class schedule. This data is not stored in the DB. The frontend will show empty array → no table rendered. If needed, add schedule fields to the admin editor later.
2. **`staffStatus` colors**: DB doesn't store `color` field. The mapper assigns colors by index — this is cosmetic and matches what the mock data does.
3. **`textbookStatus` vs facilities**: In the DB seed, both are under `facilities.textbook_status`. The frontend `FacilitiesSection` expects both `items` and `textbookStatus` — this mapping works.
4. **Budget `expenditure`**: DB seed uses `budget.items` but frontend expects `budget.expenditure`. The mapper should check for both keys, preferring `expenditure`.
