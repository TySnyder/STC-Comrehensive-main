# HANDOFF — director
**Updated:** 2026-08-16
**App:** STC Operations Portal — internal behavioral health clinical-ops portal for admin staff (no consumer surface). React 19 / Vite / TS / Tailwind v4 + Firestore.
**Commands:** `npm run dev` (port varies — 3000-3004 often taken; check console output) · gate: `tsc --noEmit` · tests: `npm run test` (vitest, 80 passing) · `npm run build`
**Key docs:** `PRODUCT.md`, `DESIGN.md`, `.planning/PROJECT.md`, `.planning/spreadsheets/README.md` (open-questions workflow), `.planning/codebase/`

---

## Active phase — READ THIS FIRST

**Real Google Sign-In + 5-role access is DEPLOYED and confirmed working via active use** (user has
been driving the live app — header badge, sidebar, Client Forms modal all observed working). Commit
`2a8894c` + follow-ups through `fb105f4`. Firestore rules require auth, code live via `vercel deploy
--prod`. Full detail in `HANDOFF-COMPLETED.md` (search `2a8894c`).

**BLOCKED — client-forms auto-fill (Discharge/Exit Interview/Virtual Attendance Request) doc-merge
backend.** Backend code is complete and committed (separate repo: `/Users/ts/github-sites/stc-backend`,
`Code.js` + `appsscript.json`, functions `fillDischargeForm`/`fillExitInterview`/
`fillVirtualAttendanceRequest`, routed via `doPost`), deployed to the existing Web App URL (also a
fresh spare deployment `AKfycbyiz4ZVveB21HP28shQqwpEkgAV3vtwIM1735Wmkz9Es7UVVP3zQlT1Q05q0tQ6JGca`).
**Every call fails with `DriveApp.getFileById` permission denied**, regardless of: editor "Run"
(both automated and by the user directly), revoking+re-granting access at
myaccount.google.com/permissions, `clasp login` + fresh `clasp push`/`clasp deploy`, explicit
`oauthScopes` in the manifest, or a brand-new deployment ID. The consent dialog never appears through
any of these paths. **Leading theory: `treatmentconsultants.net` is a Google Workspace domain, and
an org-level API Controls / App access control restriction (admin.google.com → Security → API
Controls) may be silently blocking Drive/Docs OAuth grants for this unverified Apps Script project.**
User doesn't have Workspace super-admin access themselves and isn't sure who does. **Next step:**
whoever has Workspace admin access needs to check that setting for this script's OAuth client; once
unblocked, redeploy (`cd stc-backend && clasp deploy --deploymentId
AKfycbwEiBKCQOriMR9zYQKbfIgX8TwfUW760AStNuRWVaiktdrwfubgb20lYm0paXMFzCGX`) and re-test with
`clientName: 'ZZZ_TEST_DELETE_ME'` before building the frontend. A temporary debug route
(`action === 'debugFillExitInterview'` in `doGet`) was added to `stc-backend/Code.js` for this
diagnosis — remove it once resolved. **Frontend UI for these 3 forms is not started** — don't build
it until the backend actually returns real doc URLs.

**Other pending items:**

1. Confirm/correct the **provisional nav-visibility-per-role** (`ROLE_NAV_IDS` in `Sidebar.tsx`) —
   still not confirmed with the user. Nav is now grouped into Daily Ops/Clients/Programs/Admin
   sections (per user-provided screenshot), but which roles see which items is still a first-pass guess.
2. **Theme Week banner (separate small pending request, not started):** user asked for a compact
   "THEME WEEK 6 OF 17 · CURRENT — Boundaries" banner (progress-dot strip + Details/Set theme
   buttons) at the top of `ScheduleView.tsx` (Program Schedule Builder page). The underlying state
   already exists there (`displayedTheme`, `displayedThemeWeek`, `THEME_CYCLE_LENGTH`,
   `themeDetailOpen` — used by the existing Theme Detail modal). Check whether a banner like this
   already exists elsewhere in the app (e.g. Dashboard) before building fresh.

## Current state (everything before the active phase)

`origin/master` and Vercel production are current as of `2a8894c`. Full detail of prior sessions
(Vercel deploy, real-PHI stopgap, Firebase provisioning, 4-agent sprint, Virtual Requests, browser
test pass, Census persistence + crash fixes, DIOP/DOP naming, modal backdrop-close, the Firestore
migration, the Attendance Totals override fix, the Calendar OAuth origin fix) is in
`HANDOFF-COMPLETED.md` — search with `rg`, don't read wholesale.

**The app's shared data is backed by real-time Firestore** — `clients`, `staff`, `risks`,
`clinicalNotes`, `indSessions`, `censusEntries`, `billingNotes`, `scheduleSlots`, `uaAssignments`,
`timeOffRequests`, `callLog`, `virtualRequests`, `attendanceOverrides`. Still demo/fake data.
Firestore rules now require `request.auth != null` + `@treatmentconsultants.net` email match.

**No real PHI policy still stands:** demo data only until a signed BAA exists (real Auth is now in
place). Do not wire any view to `stc-backend`'s real client-contact endpoints in a way reachable from
a public deployment, and do not put real client data into Firestore yet.

## stc-backend (Apps Script Web App) — status

Unchanged. Walking skeleton + Daily Reminders send proven end-to-end against real data in dev — see
archive. Still deployed anonymous; auth model still undecided. Live Vercel site doesn't point at it
(see PHI policy above); local dev (`.env`'s `VITE_UA_API_URL`) still does.

## Open items (older, still unresolved)

Small (from spreadsheet-mapping Q&A, see archive / `.planning/spreadsheets/`):

1. Facesheet: derived from census or manually curated beyond Notes/Payment? (doc 01 Q9)
2. UA initials as audit-grade user attribution — low priority (doc 01 Q12)
3. Verify "I believe / pretty sure" answers against live sheets when building (doc 01 Q10, doc 07 Q4, doc 08 Q4) — **on hold**, no real PHI is being touched right now.

Other unresolved items from prior sessions (role-permission matrix beyond nav visibility,
at-residence-vs-virtual semantics, call-log follow-up-status meanings, the deferred
`stc_dashboard_v4` Attendance Audit port) are listed in `HANDOFF-COMPLETED.md` — none were guessed,
all still need a human answer.
