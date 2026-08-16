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

## stc-backend (Apps Script Web App) — status

Walking skeleton (UA assignments doGet/doPost) is **done, fully proven end-to-end**
— see `HANDOFF-COMPLETED.md` for the full story (includes a real root-cause fix:
the linked GCP project's OAuth audience was Internal, blocking anonymous callers).
Deployment: `AKfycbwEiBKCQOriMR9zYQKbfIgX8TwfUW760AStNuRWVaiktdrwfubgb20lYm0paXMFzCGX`,
still "Anyone, even anonymous" — auth model still undecided, see below.

## Next steps — Daily Reminders wiring (IN PROGRESS)

`TaskTrackView.tsx`'s "Daily Reminders" tab already existed (client list + call-result
tracking) but "Send Daily Reminders" was a TODO stub. Real meaning, per the user:
staff call a client today about their IND appointment tomorrow.

**Real resources now wired (see `stc-backend/Code.js`, pushed + redeployed @3):**

- **Settings tab** in the `stc-backend` bound Sheet (Sheet1 / UaAssignments / Settings)
  — user-maintained, label rows followed by data rows: `Therapists` (name + `<email>`,
  email = that therapist's Calendar ID), `Intake`, `Daily Reminders` (row below the
  label = comma-separated `Name <email>` recipient list). Read via `readSettingsBlock_()`.
- **Therapist calendars**, read via `CalendarApp.getCalendarById(therapistEmail)` —
  works because the script executes as the developer, who has view access.
- **Client contact sheet** (separate spreadsheet, id `1cfu4IwQVt4t09sNyhy7h9uzGIR-85x051u7gbXzdnoo`,
  real PHI — do not paste its contents into chat or docs) — multiple tabs by
  program, grouped by "Level of Care" section headers, columns: Name, Admit Date,
  Cell Phone #, Home Phone #, Email, Emergency Contact. `findClientPhone_()` scans
  all tabs, matches client name (handles suffixes like "(2)").
- New endpoints: `doGet?action=dailyReminderRecipients`, `doGet?action=tomorrowsAppointments`
  (both confirmed returning real data), `doPost {action: 'sendDailyReminders'}`
  (builds the summary + calls `GmailApp.sendEmail` — **not yet triggered/tested**,
  deliberately left for the user to fire since it emails 8 real staff addresses).
- React: `src/utils/dailyRemindersApi.ts` (`sendDailyReminders()`), wired into the
  "Send Daily Reminders" button in `TaskTrackView.tsx` with sending/sent/error status.
  `tsc --noEmit` clean.

**Open / not done:**

- [ ] **User to test the actual send** — click "Send Daily Reminders" in the app
  (`localhost:3004`, Task Track tab) and confirm the email lands correctly.
- [ ] **Security gap, same as the skeleton's:** `sendDailyReminders` runs on the
  same anonymous, unauthenticated deployment — anyone with the URL can trigger a
  real email send right now. Auth model decision is no longer hypothetical.
- [ ] The visible "Daily Reminders" table in `TaskTrackView.tsx` still shows mock
  `indSessions` data filtered by a hardcoded `TODAY` (not real Calendar data) —
  the send button now uses real data server-side, but the on-screen list doesn't
  yet. Reconciling those (or replacing the table with `tomorrowsAppointments`) is
  unstarted.
- [x] `emailDeliveryMode` now passed through to the backend (`mode` in the POST
  body); `Code.js` only calls `GmailApp.sendEmail` when `mode === 'send'`, else
  `GmailApp.createDraft` — matches the default-safe behavior of the client-side
  `dispatchEmail` choke point, just enforced server-side since this path doesn't
  go through it. Pushed + redeployed (@4). Default app state is `draft`, so the
  button is safe to click as-is.

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
