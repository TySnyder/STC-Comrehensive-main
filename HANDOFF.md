# HANDOFF — director
**Updated:** 2026-08-16
**App:** STC Operations Portal — internal behavioral health clinical-ops portal for admin staff (no consumer surface). React 19 / Vite / TS / Tailwind v4 + Firestore.
**Commands:** `npm run dev` (port varies — 3000-3004 often taken; check console output) · gate: `tsc --noEmit` · tests: `npm run test` (vitest, 80 passing) · `npm run build`
**Key docs:** `PRODUCT.md`, `DESIGN.md`, `.planning/PROJECT.md`, `.planning/spreadsheets/README.md` (open-questions workflow), `.planning/codebase/`

---

## Current state

Working tree clean, `origin/master` and Vercel production both current as of `038a9eb`. Full detail
of this session (Vercel deploy, real-PHI stopgap, Firebase provisioning, 4-agent sprint, Virtual
Requests, browser test pass, Census persistence bug, DIOP/DOP naming, modal backdrop-close,
**the Firestore migration**) is in `HANDOFF-COMPLETED.md` — search with `rg`, don't read wholesale.

**The app's shared data is now backed by real-time Firestore, not localStorage/in-memory state** —
`clients`, `staff`, `risks`, `clinicalNotes`, `indSessions`, `censusEntries`, `billingNotes`,
`scheduleSlots`, `uaAssignments`, `timeOffRequests`, `callLog`, `virtualRequests`. Verified via the
actual Firebase console that real documents exist with correct shapes. Still demo/fake data — same
policy as before, just no longer lost on refresh. Firestore rules are **open** (`allow read, write:
if true`) since there's no real Firebase Auth wired in yet — see `firestore.rules`.

**No real PHI policy still stands:** demo data only until real Firebase Auth + a signed BAA exist.
Do not wire any view to `stc-backend`'s real client-contact endpoints (`dailyReminderRecipients`,
`tomorrowsAppointments`) in a way reachable from a public deployment, and do not put real client data
into Firestore while rules are open.

**BUG — Google Calendar OAuth `origin_mismatch`, still unfixed:** clicking "Connect Calendar" (IND
roster) or "Look up from Google Calendar" (Virtual Requests) hangs forever on "Connecting…", no
error shown. Root cause confirmed by direct reproduction (not guessed): OAuth client
`600351493590-...apps.googleusercontent.com` (GCP project `stc-main-dashboard`) doesn't have the
current origin registered. Fix: **console.cloud.google.com/auth/audience?project=stc-main-dashboard
→ Authorized JavaScript origins → add `https://stc-comprehensive.vercel.app` and
`http://localhost:3000`–`3004`.** Separate smaller bug: the UI has no error/timeout state for a
failed token request — worth hardening `googleCalendar.ts` regardless.

## stc-backend (Apps Script Web App) — status

Unchanged. Walking skeleton + Daily Reminders send proven end-to-end against real data in dev — see
archive. Still deployed anonymous; auth model still undecided. Live Vercel site doesn't point at it
(see PHI policy above); local dev (`.env`'s `VITE_UA_API_URL`) still does.

## Exact next action

1. **Fix the OAuth origin_mismatch bug** (see above) — this is the last known broken feature.
2. **Known-broken, not yet fixed:** `CensusView.tsx`'s "Totals" and "Roster" sub-tabs edit a
   disconnected local copy (`tempClients`) that never writes back to Firestore — those edits vanish
   almost immediately. "Roster" tab is also unreachable (no button in `SUB_TABS`). Needs its own
   scoping pass — probably rewire `AttendanceTotals`/`WeeklyCensusGrid` to call real setters
   (`onSaveCensusEntry` equivalent) instead of `handleUpdateTempClient`.
3. **Firestore rules must be locked down before any real client data goes in** — currently wide open
   on purpose (demo phase), tracked via `TODO(PHI)` comments in `firebaseClient.ts`/
   `firestore.rules`. Needs real Firebase Auth wired first (deliberately deferred this session).
4. Decide the open questions in `HANDOFF-COMPLETED.md`'s "Open questions surfaced by agents" section
   (role-permission matrix, at-residence-vs-virtual semantics, call-log follow-up-status meanings) —
   none were guessed, all need a human answer.

## Open items (older, still unresolved)

Small (from spreadsheet-mapping Q&A, see archive / `.planning/spreadsheets/`):

1. Facesheet: derived from census or manually curated beyond Notes/Payment? (doc 01 Q9)
2. UA initials as audit-grade user attribution — low priority (doc 01 Q12)
3. Verify "I believe / pretty sure" answers against live sheets when building (doc 01 Q10, doc 07 Q4, doc 08 Q4) — **on hold**, no real PHI is being touched right now.

**Deferred, not started:** bringing the `stc_dashboard_v4` Attendance Audit (5-phase,
Census/Running Attendance reconciliation, immutable snapshots) into this app's Weekly Census page.
User said "nothing for now" when offered three approaches — revisit by asking again, don't assume
which approach.
