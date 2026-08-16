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

- [x] `stc-backend` project scaffolded via clasp — DONE, real resources now exist:
  - Local dir: `/Users/ts/github-sites/stc-backend` (own git repo, 2 commits, not yet pushed anywhere remote — no GitHub remote configured, purely local).
  - Google Sheet: `STC Operations Portal Backend` — <https://drive.google.com/open?id=12vh7kgqbymaxIGMzFnipKnsD2Y-IRJ6MuDRqZgFZyvs>
  - Apps Script project (bound to that Sheet): <https://script.google.com/d/1R1O2PEBUCrTLlJZU0C0d0-zleEgONNmoHofay9SEZo_-ShsAxoCIb9lp/edit>
  - `.clasp.json` (committed, tracks both IDs above) is the only file besides `appsscript.json` — **no `Code.js` written yet, nothing pushed via `clasp push`, no Web App deployment exists yet.**
- [ ] **NEXT CONCRETE STEP:** write `Code.js` in `/Users/ts/github-sites/stc-backend` with a UA-assignments Sheet schema (mirror the `UaAssignment` type in this repo's `src/types.ts`: id, clientId, weekStart, assignedDate, status, completedDate, completedBy, billed) and `doGet` (list as JSON) / `doPost` (upsert one, matched by id).
- [ ] `clasp push` from `/Users/ts/github-sites/stc-backend`, then deploy as a Web App (`clasp deploy` or via the script editor) — per the defaults above, "Anyone, even anonymous" for this skeleton pass, clearly flagged as not safe once real data is involved.
- [ ] React util (`fetch` calls) + one proof-of-life wiring point — likely `src/utils/uaAssignmentsApi.ts` in **this** repo (`STC-Comrehensive-main`), pointed at the deployed Web App URL via a new `.env` var.
- [ ] Confirmed working end-to-end from the actual browser (not just curl) — same verification bar as Google Calendar/Gmail: Playwright can check the request shape, but real data round-tripping needs a manual check.

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
