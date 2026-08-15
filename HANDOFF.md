# HANDOFF — director
**Updated:** 2026-07-18
**App:** STC Operations Portal — internal behavioral health clinical-ops portal for admin staff (no consumer surface). React 19 / Vite / TS / Tailwind v4.
**Commands:** `npm run dev` (port 3004; 3000–3003 in use on this machine) · gate: `tsc --noEmit` · tests: vitest (80 passing) · `npm run build`
**Key docs:** `PRODUCT.md`, `DESIGN.md`, `.planning/PROJECT.md`, `.planning/spreadsheets/README.md` (open-questions workflow), `.planning/codebase/`

---

## Current state

- Clean-code refactor **committed** (`8f0d116`): import parsing extracted to
  `src/utils/importParsers/`, SettingsView 1554→982 lines, StaffView 896→634,
  `useLocalStorageState` hook, week math unified on `weekHelpers`. Gate green.
- All planned spreadsheet-mapping build targets DONE (census redesign,
  schedule/UA views, imports, theming, time-off — commit `402456e`).
- No active phase in flight. Details of past slices: `HANDOFF-COMPLETED.md`
  (newest-first archive — search with `rg`, never read wholesale).

## Open items

Small (from spreadsheet-mapping Q&A, see archive / `.planning/spreadsheets/`):
1. Facesheet: derived from census or manually curated beyond Notes/Payment? (doc 01 Q9)
2. UA initials as audit-grade user attribution — low priority (doc 01 Q12)
3. Verify "I believe / pretty sure" answers against live sheets when building
   (doc 01 Q10, doc 07 Q4, doc 08 Q4)

Deferred cleanups (optional): SettingsView import-wizard flag state → discriminated
union; SettingsView tab panels → separate components.

Candidate next efforts: closures/holidays registry feeding `predictDischargeDate`;
audit-grade user attribution (shared sign-in?); real-data import polish; per-module
layout/design recommendations as each data model locks (user welcomes proposals).

Standing `TODO(PHI)`: UA assignments etc. must move off localStorage before live data.

## Next steps

- None committed — pick from Open items with the user, or start a new phase.
  Batch questions before assuming (`.planning/spreadsheets/README.md` workflow).
