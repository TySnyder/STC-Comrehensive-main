# HANDOFF — director
**Updated:** 2026-08-16
**App:** STC Operations Portal — internal behavioral health clinical-ops portal for admin staff (no consumer surface). React 19 / Vite / TS / Tailwind v4 + Firestore.
**Commands:** `npm run dev` (port varies — 3000-3004 often taken; check console output) · gate: `tsc --noEmit` · tests: `npm run test` (vitest, 80 passing) · `npm run build`
**Key docs:** `PRODUCT.md`, `DESIGN.md`, `.planning/PROJECT.md`, `.planning/spreadsheets/README.md` (open-questions workflow), `.planning/codebase/`

---

## Active phase — READ THIS FIRST

**`HANDOFF-1.md` — Real Auth + Role-Based Access, IN PROGRESS, mid-implementation.** Only
`src/types.ts` is changed and uncommitted; this alone currently fails `tsc --noEmit` (2 known,
expected errors in files about to be replaced). Last commit `1609b54` is green and is what's live
on `origin/master`/Vercel. Do not assume the working tree is green — check `git status` and `tsc`
before touching anything. `HANDOFF-1.md` has the full decided scope, exact remaining steps in order,
and a pending small side-request (Theme Week banner on Program Schedule Builder) that must not get
lost. Read it fully before continuing this work.

## Current state (everything before the active phase)

`origin/master` and Vercel production are current as of `1609b54`. Full detail of this session
(Vercel deploy, real-PHI stopgap, Firebase provisioning, 4-agent sprint, Virtual Requests, browser
test pass, Census persistence + crash fixes, DIOP/DOP naming, modal backdrop-close, the Firestore
migration, the Attendance Totals override fix, the Calendar OAuth origin fix) is in
`HANDOFF-COMPLETED.md` — search with `rg`, don't read wholesale.

**The app's shared data is backed by real-time Firestore** — `clients`, `staff`, `risks`,
`clinicalNotes`, `indSessions`, `censusEntries`, `billingNotes`, `scheduleSlots`, `uaAssignments`,
`timeOffRequests`, `callLog`, `virtualRequests`, `attendanceOverrides`. Still demo/fake data.
Firestore rules are **open** (`allow read, write: if true`) — locking them down is literally what
the active phase (`HANDOFF-1.md`) is doing.

**No real PHI policy still stands:** demo data only until real Firebase Auth (in progress) + a
signed BAA exist. Do not wire any view to `stc-backend`'s real client-contact endpoints in a way
reachable from a public deployment, and do not put real client data into Firestore while this phase
is incomplete.

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
