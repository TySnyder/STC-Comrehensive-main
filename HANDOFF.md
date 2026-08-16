# HANDOFF — director
**Updated:** 2026-08-16
**App:** STC Operations Portal — internal behavioral health clinical-ops portal for admin staff (no consumer surface). React 19 / Vite / TS / Tailwind v4 + Firestore.
**Commands:** `npm run dev` (port varies — 3000-3004 often taken; check console output) · gate: `tsc --noEmit` · tests: `npm run test` (vitest, 80 passing) · `npm run build`
**Key docs:** `PRODUCT.md`, `DESIGN.md`, `.planning/PROJECT.md`, `.planning/spreadsheets/README.md` (open-questions workflow), `.planning/codebase/`

---

## Active phase — READ THIS FIRST

**Real Google Sign-In + 5-role access is DEPLOYED (commit `2a8894c`), but NOT yet verified by a
human.** Firestore rules now require auth (`firebase deploy --only firestore:rules` already ran),
code is pushed to `origin/master` and live via `vercel deploy --prod`. Full implementation detail is
in `HANDOFF-COMPLETED.md` (search `2a8894c` or "Real Google Sign-In"). **Next steps, in order:**

1. **Ask the user to click through the actual Google OAuth popup** at
   `https://stc-comprehensive.vercel.app` with a `@treatmentconsultants.net` account — an agent
   cannot test this. First real login defaults to role `'intern'`; the signing-in user must then
   manually set their own `Staff.appRole` to `'master'` in the Firebase console (Firestore → `staff`
   collection) to unlock full access. Call this out explicitly so they don't think they're locked out.
2. Confirm/correct the **provisional nav-visibility-per-role** first pass (`ROLE_NAV_IDS` in
   `Sidebar.tsx`) — not yet confirmed with the user, likely to need adjustment.
3. **Theme Week banner (separate small pending request, not started):** user asked for a compact
   "THEME WEEK 6 OF 17 · CURRENT — Boundaries" banner (progress-dot strip + Details/Set theme
   buttons) at the top of `ScheduleView.tsx` (Program Schedule Builder page). The underlying state
   already exists there (`displayedTheme`, `displayedThemeWeek`, `THEME_CYCLE_LENGTH`,
   `themeDetailOpen` — used by the existing Theme Detail modal). Check whether a banner like this
   already exists elsewhere in the app (e.g. Dashboard) before building fresh — the screenshot's
   styling suggested it might just need relocating.

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
