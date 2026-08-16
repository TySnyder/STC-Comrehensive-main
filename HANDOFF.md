# HANDOFF — director
**Updated:** 2026-08-15
**App:** STC Operations Portal — internal behavioral health clinical-ops portal for admin staff (no consumer surface). React 19 / Vite / TS / Tailwind v4.
**Commands:** `npm run dev` (port 3004; 3000–3003 in use on this machine) · gate: `tsc --noEmit` · tests: vitest (80 passing) · `npm run build`
**Key docs:** `PRODUCT.md`, `DESIGN.md`, `.planning/PROJECT.md`, `.planning/spreadsheets/README.md` (open-questions workflow), `.planning/codebase/`

---

## Current state

Working tree clean, all committed through `f8b40cb`, gate green. Not pushed to `origin`.
Full detail of everything through today's session (Task Track, Google Calendar OAuth,
Client Forms picker, live timeline data, email delivery mode + master-switch safety
fix) is in `HANDOFF-COMPLETED.md` — search with `rg`, don't read wholesale.

## Next steps — Google Sheets + Apps Script "walking skeleton" (IN PROGRESS)

Scoped with the user, now starting. Goal: prove the whole path — new Sheet, new
Apps Script Web App, real HTTP call from this React app, round-trip data — with the
**smallest possible slice** before expanding to the full migration.

**Decisions already made (don't re-litigate):**

- New Apps Script Web App = new project, NOT extending `stc_dashboard_v4`.
- Backs onto a **brand-new Google Sheet**, not any live clinic operational sheet.
- First slice = **UA assignments** (the one already flagged `TODO(PHI)` in this app's code).
- Eventually full migration (clients, staff, census, attendance, everything) — but not this pass.
- `clasp` is installed and logged in on this machine, ready to use.

**Defaults I'm proceeding with (flag if wrong, not blocking on confirmation):**

- New project lives at `/Users/ts/github-sites/stc-backend`, sibling to this repo and `stc_dashboard_v4`.
- `clasp create --type sheets` to get a bound Sheet + Script together in one step.
- Web App deployed with "Anyone, even anonymous" access for this skeleton pass only —
  **not safe once real client data flows through it.** Auth model is a real decision
  to make before this graduates past skeleton/placeholder data.
- Skeleton scope: `doGet` returns UA assignments as JSON, `doPost` upserts one. React
  side gets a small proof-of-life call (not a full replacement of `useLocalStorageState`
  yet — that's the next increment after the skeleton proves out).

**Progress this pass:** (update as steps complete)

- [ ] `stc-backend` project scaffolded via clasp
- [ ] Sheet schema for UA assignments
- [ ] `doGet`/`doPost` deployed as Web App
- [ ] React util (`fetch` calls) + one proof-of-life wiring point
- [ ] Confirmed working end-to-end from the actual browser (not just curl)

## Open items (older, still unresolved)

Small (from spreadsheet-mapping Q&A, see archive / `.planning/spreadsheets/`):

1. Facesheet: derived from census or manually curated beyond Notes/Payment? (doc 01 Q9)
2. UA initials as audit-grade user attribution — low priority (doc 01 Q12)
3. Verify "I believe / pretty sure" answers against live sheets when building (doc 01 Q10, doc 07 Q4, doc 08 Q4)

Deferred cleanups (optional): SettingsView import-wizard flag state → discriminated union; SettingsView tab panels → separate components.

**Deferred, not started:** bringing the `stc_dashboard_v4` Attendance Audit (5-phase,
Census/Running Attendance reconciliation, immutable snapshots) into this app's Weekly
Census page. User said "nothing for now" when offered three approaches (thin API on
the existing dashboard / rebuild against this app's own attendance data / just
document it) — revisit by asking again, don't assume which approach.

Standing `TODO(PHI)`: UA assignments etc. must move off localStorage before live data — this is exactly what the walking skeleton above is starting to address.
