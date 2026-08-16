# HANDOFF-COMPLETED — newest-first archive

> Completed handoffs, moved verbatim from the director. Never read wholesale — search with `rg`.

---
<!-- archived from HANDOFF.md on 2026-08-16 (Firestore migration, census bug, block naming, modals) -->

**Firestore migration (038a9eb) — the app's shared data is now real, persisted, real-time.**
User asked to "tie in a database now"; Firebase project/Firestore database already existed from
earlier this session but nothing referenced it. Confirmed scope via 3 quick questions: migrate
everything at once (not just Census), keep today's demo-only auth with open Firestore rules (no
real Firebase Auth yet), data stays demo/fake (BAA still not signed).

- `npm install firebase`. `src/utils/firebaseClient.ts` — `initializeApp`/`getFirestore` from
  `VITE_FIREBASE_*` env vars.
- `src/utils/useFirestoreState.ts` — a generic hook with the *exact same* `[value, setValue]`
  shape as `useLocalStorageState`/`useState`, so it's a pure drop-in at each declaration site in
  `App.tsx` — zero handler logic touched anywhere else in the app. Subscribes via `onSnapshot`
  (real-time across tabs/devices); on empty collection, seeds from the existing demo data via a
  keyed `writeBatch` (idempotent — safe even if two clients race to seed at once, since every
  write is a `.set()` on a deterministic doc ID, never `.add()`). The setter diffs the
  before/after array and writes only what actually changed (added/updated/removed), same
  semantics as the old array-replacing `setState` calls callers already use.
- Migrated (collection name in Firestore): `clients`, `staff`, `risks`, `clinicalNotes`,
  `indSessions`, `censusEntries`, `billingNotes` (composite doc ID `clientId_weekStart`, no
  natural `.id` field), `scheduleSlots`, `uaAssignments`, `timeOffRequests`, `callLog`,
  `virtualRequests`.
- Deliberately kept on `useLocalStorageState`, NOT migrated: `emailDeliveryMode`,
  `emailSendMaster`, `emailSignature`. These are per-browser safety/UX toggles, not shared EHR
  data — making the "armed send" master switch a shared Firestore doc would change its risk
  semantics (one browser arming it would arm it for every browser simultaneously). Flagged to the
  user rather than silently migrated.
- `firestore.rules` (open — `allow read, write: if true`, matches the no-real-Auth decision) +
  `firebase.json` + `.firebaserc` (default project `stc-operations-portal`) added; rules deployed
  via `firebase deploy --only firestore:rules --project stc-operations-portal`.
- `.env.example` finally documents the `VITE_FIREBASE_*` vars (previously flagged as missing).
  Same 6 vars added to Vercel production env via `vercel env add ... production`.
- Verified end-to-end via ego-browser: loaded production, confirmed via the actual Firebase
  console (Cloud Firestore → Database → Data) that all collections exist with correctly-shaped,
  correctly-keyed documents (e.g. `billingNotes/client-1_2026-06-23` with real `clientId`/
  `notes`/`weekStart` fields) — not just "no errors," actually inspected real written data.
- Gate: `tsc --noEmit` clean, 80/80 tests, `vite build` succeeds (bundle grew ~1.1MB → ~1.69MB
  from the Firebase SDK, expected).
- **TODO(PHI), reinforced not just noted:** rules are open specifically because there's no real
  Auth yet — this must be locked down (comment left in both `firebaseClient.ts` and
  `firestore.rules`) before any real client data goes in, on top of the still-needed BAA.

**Bug found and fixed: Weekly Census entries not persisted (c2c0df2).** User reported edits not
saving. Traced: `censusEntries` used plain `useState` while every newer piece of state
(`uaAssignments`, `callLog`, `virtualRequests`, etc.) already used `useLocalStorageState` — any
page refresh silently reset Census back to seed data. Fixed (later superseded by the Firestore
migration above, which persists it properly). **Found but NOT fixed, still open:** a worse, separate
bug in `CensusView.tsx` — the "Totals" and "Roster" sub-tabs (`AttendanceTotals`,
`WeeklyCensusGrid`) operate on a local `tempClients` copy rebuilt from scratch by a `useEffect`
whenever `clients`/`censusEntries` change; their edit handlers (`handleUpdateTempClient`,
`handleUpdateTempAttendance`) never write back to real state at all, so edits there vanish almost
immediately, not just on refresh. Also: the "Roster" sub-tab has no button in `SUB_TABS` reaching
it — currently dead/unreachable UI. Needs its own scoping decision, not fixed this session.

**DIOP/DOP/EIOP/EOP block naming (6a43d5a).** User walked through the actual clinical model: each
half-day is one 3-hour group split into two ~1.5hr blocks; DIOP/EIOP = full track (both blocks),
DOP/EOP = step-down track (2nd block only) — matches what the attendance overhaul already built,
but `.planning/PROJECT.md`'s table wording implied DIOP meant "1st block only," which was wrong;
corrected there too (7986913). Virtual Requests' "Block A"/"Block B" picker and list column now
show the client's actual track name (DIOP/DOP/EIOP/EOP), derived from the selected/row client's
`program` field via a small `BLOCK_LABELS` lookup — same convention `AttendanceView`'s section
headers already used, just newly applied here too.

**Close-on-backdrop-click for every modal (571c11e).** 13 modal backdrops across 12 files fixed
(`onClick={onClose}` on the overlay div + `onClick={e => e.stopPropagation()}` on the card),
matching a pattern that already existed twice in the codebase (`InsuranceBillingModal`'s
`handleBackdrop`, `ScheduleView`'s theme-detail modal).

---
<!-- archived from HANDOFF.md on 2026-08-16 (deploy, PHI stopgap, Firebase, 4-agent sprint) -->

**Daily Reminders wiring — committed and merged (8fc2037).** `sendDailyReminders` goes through
`stc-backend`'s Apps Script (recipients, therapist calendars, client contact lookup all resolved
server-side); `mode` (draft/send) passed through so the server enforces the same default-safe
behavior as the client-side `dispatchEmail` choke point. `src/utils/dailyRemindersApi.ts`,
`TaskTrackView.tsx` button wired with sending/sent/error status. Gate green at commit time.

**Vercel deployment.** Linked repo to a new Vercel project `stc-comprehensive`
(org `tyler-snyders-projects`, GitHub-connected) via the `vercel` CLI — had to pass
`--project stc-comprehensive` explicitly since the repo directory name has uppercase letters,
which Vercel's auto-derived name rejects. Live at **https://stc-comprehensive.vercel.app**.
`VITE_GOOGLE_CLIENT_ID` and (at the time) `VITE_UA_API_URL` set as production env vars.

**Real-PHI exposure found and stopped.** `stc-backend`'s `dailyReminderRecipients` /
`tomorrowsAppointments` endpoints return real client contact-sheet data (spreadsheet id
`1cfu4IwQVt4t09sNyhy7h9uzGIR-85x051u7gbXzdnoo`) over an anonymous, unauthenticated URL — this
became reachable from the public internet the moment the Vercel site went live. User decision:
**no real PHI on this app for now, everything runs on demo/mock data** until a real auth +
Firestore/BAA path exists. Stopgap applied: removed `VITE_UA_API_URL` from Vercel production env
(`vercel env rm ... production`) and redeployed — live site no longer calls the real backend;
`listUaAssignments`/`sendDailyReminders` now fail harmlessly in production (console error / "Failed
— retry" button state). Local `.env` and dev backend wiring untouched — only the live prod deploy
was disconnected.

**Firebase project provisioned** (per `.planning/PROJECT.md`'s original Phase-0 plan, which the user
confirmed still stands over the Supabase-then-abandoned path): project `stc-operations-portal`
(number `932616570891`, org `treatmentconsultants.net`). `firebase-tools` CLI installed globally
(`npm install -g firebase-tools`); `firebase login --no-localhost` required interactive browser
auth done by the user directly (non-interactive session can't complete OAuth). GCP project creation
via CLI succeeded but attaching Firebase resources hit a 403 org-IAM permission error — user resolved
it directly via the Firebase/GCP console (exact grant unknown to this session). Firestore database
created (`(default)`, region `nam5`, default closed rules — nothing reads/writes it yet; had to
enable the Firestore API first via the console link since `gcloud` wasn't authenticated as the right
account). Web app registered (App ID `1:932616570891:web:a2c08e0dba50e8a4e1df0e`); SDK config
(apiKey, authDomain, etc.) saved to local `.env` as `VITE_FIREBASE_*` — **not yet added to
`.env.example`, no app code references it yet.** This is infrastructure-only; no data-layer wiring
exists.

**4-agent parallel sprint** ("chief of staff, run as many sub-agents as you can"). Launched 4
`frontend-developer` agents in isolated `git worktree`s, each demo-data-only, `tsc --noEmit` gated,
instructed to port logic from the sibling reference repo `stc_dashboard_v4` where it exists rather
than inventing new design, and to flag (not guess) genuinely undefined business rules:

1. **Attendance model overhaul** — two-block roster (DIOP+DOP / EIOP+EOP, independent records per
   block), extended fields (`atResidence`, `excused`, `note`, `attendanceNotes`, `program`
   snapshot), running TX-day totals (`src/utils/attendanceHelpers.ts`), per-block daily counts,
   IND section reusing the existing Google Calendar integration, ported title-parsing regexes from
   `stc_dashboard_v4/CalendarParser.js` into `src/utils/calendarParser.ts`. Mid-flight correction:
   graduation target is a **per-client 30-day or 85-day track**, not a fixed 85 — relayed to the
   agent via `SendMessage` after it had already finished once with a hardcoded 85; it went back and
   added `Client.graduationTrack: 30 | 85` (types.ts), `graduationTarget()` reads it, `ClientsView`
   displays `attended/target` per client, `data.ts` seeded with both tracks.
2. **Auth scaffold** — `AuthContext`/`useAuth()`, `LoginView.tsx`, `src/utils/auth.ts` (demo/local,
   4 hardcoded accounts one per role, shared password `demo`, swappable for real Firebase Auth
   later), `App.tsx` gates the whole app behind `if (!user) return <LoginView/>`.
3. **Call tracking module** — `CallTrackingView.tsx` + `AddCallLogModal.tsx`, `CallLogEntry` type,
   fields sourced from `.planning/spreadsheets/03-call-tracking.md`'s real spreadsheet mapping
   (nothing to port from v4 — genuinely new).
4. **Settings cleanup** — `SettingsView.tsx` 982→175 lines; import-wizard's 13 loose `useState`s
   collapsed into one `ImportFileState` discriminated union; tab panels split into
   `src/components/settings/{FacilityProfileTab,ClinicalWorkflowsTab,SystemConnectionsTab,DataImportTab}.tsx`.

**Merge order and conflicts** (settings → attendance → auth → call-tracking, safest-to-riskiest):
- Settings vs. master: conflict in `SettingsView.tsx` — the agent's branch predated master's Email
  Delivery Mode master-switch + signature editor (added in `f8b40cb`/`317f9cb`); moved that UI into
  the new `ClinicalWorkflowsTab.tsx` by hand.
- Attendance vs. master: conflicts in `.env.example`, `App.tsx`, `types.ts` — all additive, combined
  both sides (VITE_GOOGLE_CLIENT_ID comment covering both Task Track and Attendance calendar
  buttons; type re-exports).
- Auth vs. master: only `Sidebar.tsx`'s icon import list conflicted (`ListChecks`+`LogOut`); `App.tsx`
  and `types.ts` auto-merged cleanly.
- Call tracking vs. master: branch was based on a stale commit (`8f0d116`, predating Task
  Track/email-mode/auth) — manual reconciliation in `App.tsx` (imports, email-mode state block, new
  `callLog` state) and `Sidebar.tsx` (icon imports); nav item and route wiring auto-merged fine.
- Final merge commit: `afb9073`. Gate: `tsc --noEmit` clean, `vite build` succeeds. **Correction:**
  initially reported 400/400 vitest tests passing — false. vitest has no default exclude for
  `.claude/worktrees`, and at the time all 4 agent worktrees were still present, so every one of the
  6 real test files got scanned 5x over (main + 4 worktrees) = 30 files / 400 test-cases reported.
  True count was always 80 (6 files). Worktrees removed (`git worktree remove`) after merge;
  `worktree-agent-*` branches left in place, unpushed. Fixed permanently by adding a `test.exclude`
  for `.claude/**` in `vite.config.ts` — see the Virtual Requests entry below, where this was caught.
- Smoke-tested only via `npm run dev` + `curl` (200 OK, no crash on load) — **no browser
  click-through** (no browser automation tool available this session). Login flow and all 4 new
  features are UNVERIFIED by an actual click-through.

**Open questions surfaced by agents (not guessed, need a human answer):**
- Auth: no per-role permission gating on tabs — `AppRole`/`user.role` exist but nothing reads them
  yet; PROJECT.md never specified which roles see which views.
- Attendance: `atResidence` implemented as an independent toggle (literal PROJECT.md wording) but
  `.planning/spreadsheets/01-census-qtr.md` (2026-07-02, confirmed in v4's `CensusAudit.js`) models
  residence as only meaningful when `virtual === true` — these two specs conflict, unresolved.
- Attendance: no UI exists yet for staff to actually set `Client.graduationTrack` (30 vs 85) —
  field + display logic exist, the picker doesn't.
- Attendance: `enrollmentDays` (free-form, drives est.-discharge-date projection) and
  `graduationTrack` (binary TX-day target) are separate fields that can drift out of sync for a
  given client — nothing keeps them aligned; worth deciding whether to unify.
- Call tracking: follow-up-status is color-coded in the real spreadsheet with no documented meaning
  — a 5-value placeholder enum (`New`/`Follow-Up Needed`/`Scheduled`/`No Action Needed`/`Closed`)
  was invented and needs confirming against real usage.
- Call tracking: no defined hook/action for promoting a call-log entry into the (separately
  out-of-scope) pending-admit pipeline.

**Pushed + redeployed (443d100).** `git push origin master` and `vercel deploy --prod --yes` both got
blocked once by the local permission classifier, then succeeded on retry after the user re-approved.
Production (https://stc-comprehensive.vercel.app) now matches local master.

**Browser test pass via ego-browser (mcp skill) against production.** First real click-through of
this session's work (everything before this was tsc/vitest/build-only). Logged in as each concept
proven with the `admin@stc.demo` demo account (password `demo`, picked from the login dropdown).
Confirmed working: Dashboard, sidebar shows all new nav items; Attendance's two-block roster with
per-block PRESENT/ABSENT/TARDY/VIRTUAL/EXCUSED counts, at-residence toggle (clicked, visually
confirmed the house icon activates); Call Tracking table + filters + "Log Call" modal; Virtual
Requests table (one entry with a working `Join` link, one correctly showing "NO LINK FOUND"), "Log
Virtual Request" modal with client picker; Settings' Clinical Workflows tab — confirmed the Email
Delivery Mode master switch (Draft/Send toggle) survived the earlier merge-conflict reconciliation
into `ClinicalWorkflowsTab.tsx` correctly; Clients' TX-day/graduation-track line, confirmed both
`4/30` (Derek Pham, Rachel Kim) and multiple `/85` clients render correctly from the per-client field
built earlier in the sprint (not hardcoded).

**Bug found: OAuth `origin_mismatch` blocks both "Connect Calendar" (Attendance IND roster) and "Look
up from Google Calendar" (Virtual Requests).** Clicking either hangs forever on "Connecting…", no
error surfaced. Root-caused by direct reproduction, not guessed: used CDP `Target.getTargets` to
confirm zero popup ever opened when tested against production (synthetic `.click()` in `js()` doesn't
count as a trusted gesture, so Chrome's popup blocker silently ate it there); switched to ego-browser's
real `click()` helper for a second, worktree-clean localhost repro, which DID open a popup — landing on
`accounts.google.com/signin/oauth/error?authError=...origin_mismatch...`, decoded payload confirming
`origin: http://localhost:3001` is not a registered origin on OAuth client
`600351493590-let1h8hhv7o586r6ermetsgk4drmlv0q.apps.googleusercontent.com` (GCP project
`stc-main-dashboard`). User independently navigated to that exact client's Authorized-origins page
(`console.cloud.google.com/auth/audience?project=stc-main-dashboard`) in their own browser during this
session and later pasted the literal `origin_mismatch` error, confirming the same finding from the
production side too. Not yet fixed — needs the origin added in Cloud Console (see director). Also
flagged: the app itself has no timeout/error UI for a failed token request — worth hardening
`googleCalendar.ts` regardless of the origin fix, since this exact failure mode (silent infinite
"Connecting…") will recur for any future auth error there.

**Virtual Requests feature — merged (6a01e6d).** New, separate sidebar entry (not a Call Tracking
tab, per user's explicit choice) for existing clients calling out and requesting to attend their
program block virtually. Scope nailed down via clarifying questions: existing clients / daily
attendance (not IND-specific, not staff calling out); separate nav item; and — after a user
correction mid-build — **copy an already-existing Meet link off the block's calendar event, never
create a new one.** The agent's first draft had started building `events.insert` + a broadened
write OAuth scope before the correction landed; that was fully backed out, no scope change needed.

- `VirtualRequestEntry` type (types.ts): clientId/name, date, block, reason, loggedBy, loggedAt,
  meetLink?. Deliberately does NOT touch `AttendanceEntry`/`virtual` — user chose "just log + link"
  over "also flip attendance," so attendance is untouched by this feature.
- `VirtualRequestsView.tsx` + `AddVirtualRequestModal.tsx`, same list/add-modal pattern as
  `CallTrackingView.tsx`.
- `googleCalendar.ts`: `GCalEvent` gained `hangoutLink` (from the existing read-only
  `fetchTodaysCalendarEvents` call's `event.hangoutLink` field) — no scope change, no write path.
- Lookup flow: no existing convention anywhere encodes block letter (A/B) into a calendar event
  title (only program-level detection exists), so the modal filters today's events by the client's
  *program* and lets staff pick the right one — mirrors `AttendanceView.tsx`'s manual IND-add
  pattern. A manual paste-link fallback is always available. Flagged, not silently assumed.
- Bug caught during this merge: `.claude/worktrees/agent-aa4ada5c8dab22742` was left behind after
  merging (forgot the `git worktree remove` step done for the other 4) — vitest's default excludes
  don't cover `.claude/**`, so it silently duplicated the 6 real test files into "12 files / 160
  tests," on top of the already-wrong 400 figure from the earlier merge round. Root cause fixed
  properly: `vite.config.ts` now has `test.exclude` including `**/.claude/**`, not just a one-off
  `git worktree remove`. True count confirmed stable at 80 tests / 6 files after the fix.
- Gate at merge: `tsc --noEmit` clean, 80/80 vitest passing, `vite build` succeeds.

---
<!-- archived from HANDOFF.md on 2026-08-15 (walking skeleton) -->

**Google Sheets + Apps Script "walking skeleton" — fully proven end-to-end.**
New Google Sheet + new Apps Script Web App (`/Users/ts/github-sites/stc-backend`,
own git repo, not a fork of `stc_dashboard_v4`): Sheet
`STC Operations Portal Backend` (id `12vh7kgqbymaxIGMzFnipKnsD2Y-IRJ6MuDRqZgFZyvs`),
Apps Script (id `1R1O2PEBUCrTLlJZU0C0d0-zleEgONNmoHofay9SEZo_-ShsAxoCIb9lp`),
deployed Web App (`AKfycbwEiBKCQOriMR9zYQKbfIgX8TwfUW760AStNuRWVaiktdrwfubgb20lYm0paXMFzCGX`).
`Code.js`: UA-assignments schema mirroring `UaAssignment` (types.ts), `doGet`/`doPost`.
React side: `src/utils/uaAssignmentsApi.ts` (`listUaAssignments`/`upsertUaAssignment`),
reading `VITE_UA_API_URL`; dev-only proof-of-life `useEffect` in `App.tsx` confirmed
in a real browser (no CORS error). **Root cause of a flaky 200/403 CORS saga:** the
Apps Script's linked GCP project ("STC Main Dashboard", `672367186661` — not Apps
Script's auto-created default project) had OAuth audience **User type: Internal**
(Workspace-org-only), blocking anonymous/external callers regardless of the Web
App's own "Anyone, even anonymous" setting. Fixed via Cloud Console → Auth Platform
→ Audience → "Make external" (now External + In production). Confirmed brand-new
project, not shared with other production work, so isolation risk is low today —
but it's one GCP project per Apps Script deployment, not fully isolated, worth
remembering if more lands there.
**Not yet done:** wire `uaAssignments` state in `App.tsx` off `useLocalStorageState`
onto the real API; decide the auth model before real client data flows through
(still anonymous — now more urgent, see current HANDOFF.md's Daily Reminders
section, which already sends real email off this same anonymous deployment);
delete the `test-1` test row from the `UaAssignments` sheet; remove/gate the
dev-only proof-of-life effect.

---
<!-- archived from HANDOFF.md on 2026-08-15 -->

- Clean-code refactor + all spreadsheet-mapping build targets: **committed** (`8f0d116`, `402456e`). Handoff system migrated to root director/archive format (`d85612c`).
- **Task Track view built and committed** (`285985d`): new nav page — ticker bar, tabbed Daily Reminders/UA panel (real `IndSession`/`UaAssignment` data, functional call-result dropdown), Groups Today, Ongoing/Completed↔Upcoming tasks, right-rail Timeline↔Google Calendar toggle. `src/components/TaskTrackView.tsx`.
- **Committed** (`317f9cb`):
  - Nav order: Dashboard first, Task Track second (`Sidebar.tsx`).
  - Google Calendar OAuth live and confirmed working (real user sign-in tested end to end). Read-only, Google Identity Services token client, no backend. `src/utils/googleCalendar.ts`, Client ID in `.env` (gitignored) as `VITE_GOOGLE_CLIENT_ID`. Authorized JS origin `http://localhost:3004` registered on the OAuth client in Google Cloud Console (client name "STC Dashboard", id `600351493590-...`). A `google.env` file with the OAuth client's real Client Secret exists locally at repo root — gitignored, not needed by this flow.
  - Global Email Delivery Mode (draft/send) first version — later superseded by the master-switch redesign, see current HANDOFF.md.
  - Email signature — `DEFAULT_EMAIL_SIGNATURE` in `data.ts`, persisted via `stc-email-signature`, editable + live preview in Settings → Clinical Workflows.
  - Header: Fingerprint clock-in icon added next to the bell; `header-controls` gap halved (`gap-6`→`gap-3`).

---
<!-- archived from .planning/HANDOFF-CLEAN-CODE-REFACTOR.md on 2026-07-18 -->

# HANDOFF — Clean Code refactor (2026-07-05)

## State
All six /clean-code findings resolved. Gate green: `tsc --noEmit` clean, 80/80 vitest
tests pass, `npm run build` succeeds. Nothing committed yet.

## What changed
- **`src/utils/importParsers/`** (new) — all spreadsheet parsing extracted from
  SettingsView into pure modules: `censusCsv.ts`, `censusXlsx.ts`, `contactSheet.ts`,
  `dxXlsx.ts`, `matchClient.ts`, `types.ts`, `index.ts` + `importParsers.test.ts`
  (13 tests). **This is the intended one-time client-data-migration module.**
  Magic XLSX column indexes are now named constants.
- **Behavior fix:** `matchClientByName` now returns `''` (→ "— skip —") when no name
  matches, instead of silently mapping to `clients[0]`.
- **SettingsView.tsx** 1554 → 982 lines. Contact-sheet step extracted to
  `src/components/settings/ContactImportStep.tsx`. `handleImport` split into
  `toCensusEntry` / `buildImportEntries` / `animateProgressThen` (progress bar is
  documented as cosmetic). Dead code removed (`STATUS_LABELS`, `selectedXlsxName`,
  unused `X` icon); `navItems as const` kills the `as any` casts.
- **StaffView.tsx** 896 → 634 lines. Onboarding form extracted to
  `src/components/staff/OnboardStaffForm.tsx` (single `values` object instead of
  8 useStates; edit flow passes `initialValues` prefill via `editPrefill` state).
- **clientAdapter.ts** now uses tested `weekHelpers` (`getMonday`/`weekDaysFrom`)
  instead of its own untested UTC-hazard week math. (TimeOffModal's `(getDay()+6)%7`
  is month-grid padding, not week math — left alone.)
- **`src/utils/useLocalStorageState.ts`** (new hook) replaces 3 duplicated
  load/persist pairs in App.tsx. Carries a `TODO(PHI)`: UA assignments etc. must move
  off localStorage before live data.
- **NoteModal.tsx** — `as any` replaced with `ClinicalNote['noteType']`.

## Next steps
- Commit these changes (user hasn't asked yet).
- Optional deeper cleanups deferred: SettingsView import-wizard flag state →
  discriminated union; SettingsView tab panels → separate components.


---
<!-- archived from .planning/HANDOFF-SPREADSHEET-MAPPING.md on 2026-07-18 -->

# HANDOFF — Spreadsheet Mapping + First Builds (2026-07-03 — all three remaining targets built)

**Start here in a new chat.** All spreadsheet structures parsed (docs 01–09); open
questions nearly all resolved. All build targets from the locked decisions are done:
census toggle, UA module, lifecycle enum, discharge workflow, theme tracker,
est. DC date prediction, audit sign-off, readmission flow.

## State

- `.planning/spreadsheets/README.md` — traceability table + two "Decisions locked 2026-07-02" sections — read both first
- Answers recorded inline (✅) in docs 01, 02, 07, 08, 09
- **Col Y RESOLVED:** QOL follow-up status, NOT lifecycle — remapped in doc 02 Q3; lifecycle enum stands (Inquiry → Pending Admit → Active → Discharged)
- Gate clean: `tsc --noEmit` passes; `npm test` 34 passing (weekHelpers 20 + uaHelpers 14)

## Built this session (2026-07-02 night)

1. **Census location toggle** — `CensusCell.tsx` / `CellCard.tsx` now cycle
   in person (person icon, green, default) → virtual home (home) → virtual away (car),
   per doc 01 Q2. Data model unchanged (`virtualMode`); importer already mapped P/T/R/N.
2. **UA module (v1)** — per doc 01 Q11 + round-3 answers (recorded in doc 01):
   - `src/utils/uaHelpers.ts` (+tests): random week generation honoring frequency,
     re-roll, automatic absent-day rollover derived from census entries
   - `src/components/UaTrackingView.tsx`: new "UA Tracking" sidebar tab — week nav,
     "Generate this week" button (dice), per-row day select + re-roll, rolled-from badge,
     mark-complete (date + who), green billed toggle, external-PCP footnote
   - `Client.uaFrequency` (`twice-weekly|weekly|monthly|external|none`) + `uaNote`;
     selector + note on client profile (ClientsView identity card); `handleUpdateClient` in App
   - `UaAssignment` persisted to localStorage (`stc-ua-assignments`) — clientId refs only, no PHI

## Built 2026-07-02 (late session): lifecycle enum rework

- `Client.status` is now `ClientStatus = Inquiry | Pending Admit | Active | Discharged`
  (was Upcoming/Needs Packet/Completed/Graduated). New types in `src/types.ts`:
  `DcStatus = Approved | ASA | Admin DC` (multi-select) and `Episode`
  (`episodeNumber, admitDate, iopDcDate?, stcDcDate?, dcStatus?, graduated?, note?` — two
  DC dates per doc 08 step-down insight).
- `Client.episodes?: Episode[]` is **optional**: absent/empty = one implicit episode from
  `admissionDate` (design choice — avoids touching every constructor; discharge workflow
  will materialize episodes). AddClientModal creates episode 1 explicitly.
- Old-status mapping applied in mock data + all consumers (AddClientModal, DashboardView,
  DischargeView tabs, ClientsView badge, SettingsView contact import → 'Active'):
  Upcoming→Pending Admit, Needs Packet→Active, Completed/Graduated→Discharged.
- Reversal mechanics (voiding an episode's discharge fields) deliberately deferred to the
  discharge-workflow build; the model supports it. Clients are not in localStorage, so no
  migration needed.
- Gate clean after rework: tsc + 34 tests.

## Built 2026-07-03: discharge workflow (doc 08)

- `Episode` gained paperwork fields: `gradCertSentAt, exitInterviewSentAt/ReturnedAt,
  dcFormSentAt/ReturnedAt` (all optional ISO dates).
- `src/utils/episodeHelpers.ts` (+12 tests, 46 total): `getEpisodes` (materializes the
  implicit episode), `applyDischarge` (IOP-only date = step-down, stays Active;
  `stcDcDate` = full DC → status Discharged), `reverseDischarge` (voids DC + paperwork
  fields, keeps note, back to Active — mirrors "row gets deleted"), `getPaperworkItems`
  with chase states `not-sent → chasing → returned | closed` (closed = 1 month past
  `stcDcDate`, the give-up rule), `chaseDeadline`, `countOutstanding`.
- `DischargeClientModal.tsx`: dates (IOP/STC), DC-status multi-select with definitions
  (full DC requires ≥1), graduated toggle, note. Opened from Discharge view Active tab.
- `DischargeView.tsx`: Discharged tab is now the paperwork tracker (mirrors Admin
  Discharges workbook): admit/IOP DC/STC DC dates, DC-status badges, click-to-stamp
  paperwork cells (stamps today), outstanding badge with chase deadline, Reverse DC.
  Active tab shows an "IOP DC" badge for stepped-down clients.
- App.tsx: `handleDischargeClient / handleReverseDischarge / handleUpdateEpisode` via a
  shared `applyClientTransform`. Mock data: 3 discharged clients seeded with episodes
  covering chasing / complete-graduated / chase-closed-unreceived states.
- Gate clean: tsc + 46 tests.

## Built 2026-07-03 (later session): 17-theme tracker (doc 09)

- Decisions locked in doc 09 ("Theme tracker decisions"): canonical week 1–17
  order (user's order, NOT docx order — Self Destruction & Escape before Health
  & Wellness; Identity confirmed at week 2); anchor set in-app; names + full
  descriptions embedded (curriculum copy, no PHI).
- `src/themes.ts` — 17 `ThemeInfo` entries (name, description, techniques),
  parsed from the live-data theme descriptions docx.
- `src/utils/themeHelpers.ts` (+7 tests, 53 total): `ThemeAnchor
  { mondayIso, themeWeek }`, `themeWeekFor` (mod-17, handles past/future/wrap).
- `ScheduleView.tsx`: theme banner above the grid — "Theme Week N of 17 —
  Name" for the displayed week ("· Current" on today's week), 17-segment cycle
  strip, Details modal (description + clinical techniques), "Set theme"
  dropdown anchoring the cycle to the displayed week. Anchor persisted to
  localStorage (`stc-theme-anchor`); unset state prompts to pick this week's
  theme.
- Gate clean: tsc + 53 tests.

## Built 2026-07-03 (this session): est. DC date + audit sign-off + readmission

1. **Est. DC date prediction (doc 02 Q7)** — predicted, never free-text:
   - `expectedDischargeDate` REMOVED from `Client` entirely (data.ts, tests, all
     consumers swapped). Est. DC is now **derived, never stored**.
   - New `Client` fields: `enrollmentDays?` (default 85, min 30),
     `scheduleDaysPerWeek?` (1–5, default 5), `dcDateNote?` (optional context).
   - `src/utils/dcDateHelpers.ts` (+11 tests): `predictDischargeDate` walks the
     calendar from the current episode's admit date counting weekdays only;
     clients enrolled <5 days/wk credited the first N weekdays of each Mon–Sun
     week. Closures/holidays deferred (no registry yet — noted in helper).
   - UI: ClientsView table + identity card (editable enrollment days / days-per-week /
     note), AddClientModal (inputs + live predicted-date preview), DischargeView
     Active tab, StaffView, DashboardView, clientAdapter all use `estDischargeDate()`.
2. **Audit sign-off (doc 01 Q7)** — `src/components/census/AuditSignoff.tsx`,
   rendered left of the week nav in CensusView (grid tab). Green badge
   "Audited through {date} by {name}"; Sign off popover (date defaults to the
   displayed week's Friday, name input, last-5 history). Full audit log persisted
   to localStorage `stc-census-audits` (dates + staff names only, no PHI).
3. **Readmission flow** — `readmitClient(client, admitDate)` in episodeHelpers
   (+3 tests): appends episode N+1, back to Active; no-op unless current episode
   has `stcDcDate` (step-down/active clients can't readmit). DischargeView
   Discharged tab: "Ep {n}" badge for repeat episodes + "Readmit" button →
   confirm modal (date input, explains it starts episode N+1). Wired through
   App.tsx `handleReadmitClient` / `onReadmit`.

Gate clean: tsc + 67 tests (5 files).

## Round-3 UA decisions (locked, in doc 01)

Button+re-roll generation (not auto) · completion = date + who (no test type v1) ·
rollover automatic from census · frequencies 2×/wk, 1×/wk, monthly, external (PCP), none + free-text note.

## Still open (small)

1. Facesheet: derived from census or manually curated beyond Notes/Payment? (doc 01 Q9)
2. UA initials as audit-grade user attribution — low priority (doc 01 Q12)
3. Verify "I believe / pretty sure" answers against live sheets when building (doc 01 Q10, doc 07 Q4, doc 08 Q4)

## Next steps (proposed)

1. All planned build targets DONE. Candidates: resolve the three "Still open" items
   above; closures/holidays registry feeding `predictDischargeDate`; audit-grade user
   attribution (shared sign-in?); real-data import polish.
2. Per-module layout/design recommendations as each data model locks — **user is very open
   to recommendations** (memory rule saved)

## Constraints (unchanged)

No PHI in docs/code/localStorage; `live data/` never committed; never assume — ask;
stack locked (React 19/Vite/TS/Tailwind v4); tsc --noEmit is the gate.
Workflow: end each phase with a handoff doc; start new chats from it (avoid compaction).


---
<!-- archived from .planning/HANDOFF-CENSUS.md on 2026-07-18 -->

# Handoff: Census Page — STC Operations Portal

**Last updated:** 2026-06-29  
**Status:** Active development — census grid is functional. See "Current State" below.

---

## Project Context

**App:** STC Operations Portal — internal admin dashboard for the Office Manager at Solutions Treatment Center (STC), a behavioral health facility with two locations: Santa Fe (SF) and Albuquerque (ABQ).

**Stack:** React 19 + Vite + TypeScript + Tailwind v4 + lucide-react. Dev port: **3004**.

**Backend:** Supabase free tier (dev phase). No real PHI yet. Will migrate to Firebase/Firestore + Google Cloud BAA when real clients go live.

---

## Architecture: Source of Truth

**`src/types.ts` and `src/data.ts` — NEVER MODIFY THESE.**  
All new data lives in `CensusEntry[]` and `InsuranceBillingNote[]`, managed in `App.tsx` state.

### Adapter Pattern
`src/utils/clientAdapter.ts` maps `Client` → `TempClient` (view-model):
- `adaptClient(client)` — uses `client.attendanceHistory` only
- `adaptClientWithEntries(client, allCensusEntries)` — merges live census records on top of history so Totals/Analytics reflect what's been entered in the grid this week

`TempClient` is the shape consumed by all analytics sub-views. It is never stored — always derived.

### CensusEntry shape (from `src/types.ts`)
```ts
interface CensusEntry {
  id: string;
  clientId: string;
  date: string;          // ISO YYYY-MM-DD
  block: ProgramBlock;   // 'DIOP' | 'DOP' | 'EIOP' | 'EOP' | 'IND'
  status: 'Present' | 'Absent' | null;
  excused: boolean;
  tardy: boolean;
  virtualMode: 'none' | 'residence' | 'away';
  specialCode?: 'L' | 'D';   // additive modifier — Last Day, Discharged
  autoFilled: boolean;
}
```

### Auto-fill rule
When DIOP or EIOP is recorded, the paired block (DOP or EOP respectively) is automatically mirrored — **unless** the pair was manually set (autoFilled: false).

---

## Current State (as of 2026-06-29)

### Census sub-tabs
`CensusView.tsx` has 4 sub-tabs: **Census Grid | Totals | Runway | Analytics**  
(Roster tab exists in code but is hidden from the nav.)

### Census Grid tab
- **`src/components/census/CensusGrid.tsx`** — weekly grid grouped by program (DIOP/EIOP/EOP/DOP/IND), location + program filters, legend, avatar initials
- **`src/components/census/CensusCell.tsx`** — fully inline interactive card (NO popup). Contains:
  - `*` / `L` / `D` modifier in top-left (cycles: undefined → L → D → undefined)
  - Status toggle (null → Present → Absent → null)
  - Present mode: Clock (tardy), Video/Home/Car (virtualMode cycle)
  - Absent mode: Unexcused / Excused pill toggle
  - Future days: grey + "upcoming", non-interactive
  - IND cells only: `×` button top-right to remove the entry
- Week nav: pill control with month label above, `‹ 22nd | Today | 27th ›`; date range subtitle only shown when not on current week

### Totals tab
`src/components/census/AttendanceTotals.tsx` — uses `adaptClientWithEntries` so it reflects live census edits.

### Runway tab
`src/components/census/TemporalRunway.tsx` — repurposed as visual attendance distribution per client:
- Bar = 85 program days wide (100% = 85 days)
- X = (fullDaysAtt + excused) / 85 — shown as "X% of 85-day program"
- 6 colored segments sorted largest → smallest:
  - Emerald = In-Person present (fullDaysAtt − virtualCount)
  - Slate = Absent total (excused + unexcused)
  - Amber = Excused
  - Red = Unexcused
  - Orange = Tardy
  - Sky = Virtual
- Sorted by most total recorded days at the top

### Analytics tab
`src/components/census/BentoDashboard.tsx`

---

## Key Files

| File | Role |
|------|------|
| `src/App.tsx` | State: `clients`, `censusEntries`, `billingNotes`. Handlers: `onSaveCensusEntry`, `onRemoveCensusEntry`, `onUpdateBillingNote` |
| `src/components/CensusView.tsx` | Sub-tab nav, week navigation, wires everything together |
| `src/components/census/CensusGrid.tsx` | Weekly grid shell — filters, program groups, avatar, billing cog |
| `src/components/census/CensusCell.tsx` | Inline interactive attendance card |
| `src/components/census/CellCard.tsx` | Standalone card (used in Roster/WeeklyCensusGrid — NOT used in the main census grid) |
| `src/components/census/QuickAdmitModal.tsx` | Exports `QuickAdmitCard` — used in Roster tab |
| `src/utils/clientAdapter.ts` | `TempClient` type + `adaptClient` + `adaptClientWithEntries` |
| `src/components/census/blockStyles.ts` | `clientBlocks(program)` → which ProgramBlocks to show per client |

---

## Prop Chain: Cell Update

```
App.tsx
  onSaveCensusEntry / onRemoveCensusEntry
    → CensusView.tsx
        handleGridCellUpdate (builds/merges CensusEntry, saves, auto-fills pair block)
        onRemoveCensusEntry (passed straight through)
          → CensusGrid.tsx
              onCellUpdate / onRemoveInd
                → CensusCell.tsx
                    onUpdate(Partial<CensusEntry>) / onRemove()
```

---

## Design Rules

- **No popover/modal for cell editing** — all interactions are inline on the card itself
- **D and L are additive modifiers** — they don't replace Present/Absent status, stored as `specialCode` only
- **Half-day fields** (`halfDaysAtt`, `halfExc`, `halfUnexc`) exist in TempClient but are excluded from the Runway visualization
- **Future days** (date > today ISO string) are always disabled/grey
- **85 days** is the program target — used as the denominator in Runway bar
- Tailwind custom tokens: `text-primary`, `bg-primary`, `font-display`, `text-secondary`

---

## What's Not Done / Possible Next Steps

- Roster tab is hidden (code exists in `WeeklyCensusGrid.tsx`, `QuickAdmitModal.tsx`) — could be unhidden if needed
- No persistence yet (all state in memory — Supabase integration is future work)
- `InsuranceBillingModal` exists but billing notes aren't surfaced in reports yet
- `BentoDashboard` (Analytics tab) was ported from stc-temp and may need data wiring review

---

*Last updated: 2026-06-29*


---
<!-- archived from .planning/HANDOFF-IMPORT-TIMEOFF.md on 2026-07-18 -->

# Handoff: Time Off Calendar + CSV Import

**Date:** 2026-06-29  
**Branch:** master

---

## What Was Built

### 1. Time Off Calendar — `src/components/staff/TimeOffModal.tsx` (new)

Full-featured approved leave management modal.

**Opens from:** "Approved Schedule Requests" button in the Staff Directory Register header (right of "Add New Staff Member").

**Features:**
- Month calendar (Mon–Sun grid, navigable by month/year)
- Form: staff picker with live avatar preview, First Day Out / Last Day Out date inputs, optional note, "Approve Request" button
- Calendar visualization per request:
  - **Start day:** staff photo/initials + first name chip above a left-rounded colored bar
  - **Middle days:** full-width colored bar (same color)
  - **Return day** (endDate + 1): "↩ [FirstName] returns" label
- 6 rotating colors keyed by staff index position
- Bottom list of all approved requests with trash-delete
- Persisted to `localStorage` key `stc-time-off`

**Props:**
```ts
{ staffList, requests, onAdd, onRemove, onClose }
```

---

### 2. StaffView wiring — `src/components/StaffView.tsx`

- Added `timeOffRequests: TimeOffRequest[]` and `setTimeOffRequests` to props interface
- Added `showTimeOff` state + "Approved Schedule Requests" button in directory header
- TimeOffModal rendered in Fragment alongside directory div

---

### 3. ScheduleView on-leave warnings — `src/components/ScheduleView.tsx`

- `timeOffRequests` prop added
- `isOnLeave(staffId, isoDate)` helper
- Column objects carry `iso` date field
- When assigned staff has approved leave for a cell's date:
  - Cell background becomes amber-tinted
  - Slot card gets amber border
  - "⚠ On Approved Leave" badge appears below credentials
- Assignment modal:
  - On-leave staff shown as `disabled` option with ⚠ prefix
  - Warning paragraph shown when on-leave staff is selected
  - Save Assignment button `disabled` when on-leave staff is selected

---

### 4. AutoAssign button — `src/components/ScheduleView.tsx`

- "Auto Assign" button with Shuffle icon, left of "Drag & Drop Active" indicator
- Fills every session × day with a randomly picked active staff member
- Respects 1-week vs 4-week mode (`activeWeekIndices`)
- Skips on-leave staff for each day (falls back to all active staff if everyone is on leave)

---

### 5. CSV Census Import — `src/components/SettingsView.tsx`

**Location:** Settings → "Data Import" tab (new 4th nav item).

**Flow:**
1. **Upload** — drag-drop or file picker (`.csv`). Shows column format guide.
2. **Assign** — after parse: file summary badge, skipped-row warnings, client dropdown with initials avatar.
3. **Review** — preview table (up to 50 rows): Date, Block, Status, Excused, Tardy, Virtual, Code.
4. **Importing** — animated progress bar with:
   - Date range anchored to oldest existing record for the client (falls back to earliest import date)
   - Current date being processed shown in center (indigo)
   - Row counter + % on bar
   - ~2 second animation regardless of dataset size
5. **Done** — success screen with record count + "Import another file" reset.

**Flexible CSV column names:**

| Field | Accepted column names |
|---|---|
| date | `date` `day` `session_date` `session_day` |
| block | `block` `program` `program_type` `type` `service` |
| status | `status` `attendance` `attendance_status` `present` |
| excused | `excused` `excuse` `exc` |
| tardy | `tardy` `late` `tardiness` |
| virtual | `virtual` `virtual_mode` `virtualmode` `mode` |
| special_code | `special_code` `specialcode` `code` `special` |

**Block values:** `DIOP DOP EIOP EOP IND` (case-insensitive)  
**Status values:** `Present Absent Special P A Y N 1 0` etc.  
**Date formats:** `YYYY-MM-DD` or `MM/DD/YYYY`

**Entry ID format:** `import-{clientId}-{date}-{block}` — deterministic, so re-importing the same file for the same client overwrites rather than duplicates.

**App.tsx changes:**
- `handleImportCensus(entries: CensusEntry[])` bulk merge function added
- SettingsView now receives `clients`, `censusEntries`, `onImportCensus`

---

## localStorage Keys

| Key | Data |
|---|---|
| `stc-schedule-slots` | `GridSlot[]` — program schedule assignments |
| `stc-time-off` | `TimeOffRequest[]` — approved leave records |

> **Note:** A prior session collision between these two keys (both briefly used `stc-time-off`) caused one data wipe. The keys are now distinct and stable.

---

## Type Reference

```ts
// types.ts
interface TimeOffRequest {
  id: string;
  staffId: string;
  startDate: string;  // ISO — first day absent
  endDate: string;    // ISO — last day absent (return = endDate + 1)
  note?: string;
}

interface CensusEntry {
  id: string;
  clientId: string;
  date: string;
  block: ProgramBlock;       // 'DIOP' | 'DOP' | 'EIOP' | 'EOP' | 'IND'
  status: 'Present' | 'Absent' | 'Special' | null;
  excused: boolean;
  tardy: boolean;
  virtualMode: VirtualMode;  // 'none' | 'residence' | 'away'
  specialCode?: SpecialCode; // 'L' | 'D' | 'H' | 'C'
  autoFilled: boolean;
}
```

---

## Known Gaps / Potential Next Steps

- AttendanceView uses `client.attendanceHistory` (a separate array), not `censusEntries`. The CSV import currently only feeds `censusEntries` → Census tab. A future enhancement could cross-populate `attendanceHistory` for the Attendance tab.
- Time off requests are not surfaced in the Staff profile's calendar or the dashboard — only in ScheduleView warnings and the modal.
- No bulk-clear / undo for imports. If user imports wrong file for wrong client, they must manually delete entries from Census.


---
<!-- archived from .planning/HANDOFF-SESSION-2026-06-29.md on 2026-07-18 -->

# Session Handoff — 2026-06-29

**Project:** STC Operations Portal  
**Status:** Active development  
**Dev port:** 3004  

---

## What Was Done This Session

### 1. Running Attendance — All Questions Locked
All 12 planning questions in `HANDOFF-RUNNING-ATTENDANCE.md` are now answered and the doc is marked **"All decisions locked — ready to implement."**

**Key decisions:**
- One row per client, all-time totals carry forward across program transitions
- Virtual days = full TX day toward 85-day graduation target
- Half days tracked separately, do NOT count toward 85
- Excused absences count toward Total Possible Treatment Days
- Unexcused absences do NOT count toward Total Possible
- Delta badges show change since yesterday (calendar day)
- 3 separate half-day columns (same as spreadsheet)
- Location: filter tabs (Santa Fe / Albuquerque) at top
- Est. Discharge Date: auto-calculated, weekdays only, holidays excluded via Settings
- Tardy: tracked as an icon on each Census card, summed as a count column in Running Attendance
- "Complete through" date: auto-computed from last census data entry
- Notes cog per client row — turns violet-600 when notes have content

**Still needed before Running Attendance can be built:**
- Census page data model must be finalized first (shared dependency)
- Settings page holiday calendar feature must be scoped

---

### 2. Branding — STC Logo Applied
- Copied `stc-logo-horizontal-v2.webp` to `public/`
- Replaced the "ST" placeholder block in `Sidebar.tsx` with `<img src="/stc-logo-horizontal-v2.webp" h-[60px] />`
- Removed the "Operations Portal" subtext below the logo
- `stc-logo.svg` also in `public/` but not used (webp is active)

---

### 3. Global Search Wired Up
`Header.tsx` now accepts `clients`, `staff`, `onSelectClient`, `onNavigateToStaff` props.

**Behavior:**
- Typing in the search bar opens a results dropdown grouped by Clients / Staff
- Searches client name, ID, program, insurance; staff name, role, credentials
- Clicking a client navigates directly to their profile (Clients view)
- Clicking a staff member navigates to Staff view
- Escape or click-outside clears/closes
- Results capped at 5 clients + 4 staff

**Files changed:** `src/components/Header.tsx`, `src/App.tsx`

---

### 4. Add Client Modal
New component: `src/components/AddClientModal.tsx`

- "Add Client" button added to the Client Directory filter bar (top-right, indigo, right-aligned)
- Modal collects: name, program, location, age, gender, admission date, status, insurance, primary therapist (dropdown from staff list), diagnoses (tag input, Enter to add), follow-up needed checkbox
- Validates required fields before saving
- New client prepended to top of client list
- `expectedDischargeDate` intentionally left empty (auto-calc not yet built)
- `riskFlag` not collected at intake (set later)

**Files changed:** `src/components/AddClientModal.tsx` (new), `src/components/ClientsView.tsx`, `src/App.tsx`

---

### 5. Holiday Handling in Census Grid
`H` (Holiday) is a `SpecialCode` that comes **only from imports** — never settable via the manual UI.

**Implementation in `CensusGrid.tsx`:**
- `holidayDates` derived via `useMemo` from `censusEntries.filter(e => e.specialCode === 'H')`
- Holiday day column header gets amber background + "Holiday" label below date
- Holiday day cells: instead of per-block CensusCell cards, renders a single amber "Holiday" pill
- No block groups shown on holiday days
- `CensusCell.tsx` unchanged — its `cycleSpecial` button only cycles L↔D, H is invisible to UI

**When Settings holiday calendar is built:**  
Feed holiday dates as synthetic `H` census entries on week load → grid handles them automatically.

---

## Files Modified This Session

| File | Change |
|------|--------|
| `.planning/HANDOFF-RUNNING-ATTENDANCE.md` | All questions answered, decisions locked |
| `public/stc-logo-horizontal-v2.webp` | Added (new) |
| `public/stc-logo.svg` | Added (new, not active) |
| `src/components/Sidebar.tsx` | Logo replaced, subtext removed |
| `src/components/Header.tsx` | Global search dropdown wired up |
| `src/components/AddClientModal.tsx` | New component |
| `src/components/ClientsView.tsx` | Add Client button + modal integrated |
| `src/components/census/CensusGrid.tsx` | Holiday day handling |
| `src/App.tsx` | Search props, onAddClient handler |
| `.gitignore` | Added `live data/`, `*.xlsx`, `*.xls`, `*.csv` (PHI protection) |

---

## What's Next

### Immediate priorities
1. **Census data model** — finalize before Running Attendance can be built. Read `HANDOFF-CENSUS.md` — it still has 10 open questions.
2. **Running Attendance view** — build `RunningAttendanceView.tsx` once Census model is settled. All design decisions are in `HANDOFF-RUNNING-ATTENDANCE.md`.
3. **Settings — Holiday Calendar** — add a holiday management section so the office manager can pre-program holidays. These will feed into Est. Discharge Date calculation and Census holiday display.

### Also queued
- Stitch design prompt for Census view was written this session (in conversation context, not saved to a file) — run it through Stitch before building Census
- `expectedDischargeDate` calculation logic (pace-based, weekday + holiday-aware)
- `AddClientModal` doesn't collect all fields (riskFlag, diagnoses are optional at intake — this is correct)

---

## Important Constraints to Remember
- No real PHI yet — Supabase free tier dev only. Will migrate to Firebase + Google Cloud BAA before live clients.
- Never commit `live data/` folder — it contains real spreadsheets with client names. Already gitignored.
- WCAG AA required throughout — color + symbol always together.
- Never assume answers to design/data questions — always ask the user first (feedback memory).

---

## See Also
- `.planning/HANDOFF-CENSUS.md` — Census page (next to build, has open questions)
- `.planning/HANDOFF-RUNNING-ATTENDANCE.md` — Running Attendance (decisions locked, pending Census)
- `.planning/PROJECT.md` — full project requirements and constraints


---
<!-- archived from .planning/HANDOFF-RUNNING-ATTENDANCE.md on 2026-07-18 -->

# Handoff: Running Attendance / Client Facesheet Page

**Status:** All decisions locked — ready to implement  
**Last updated:** 2026-06-29  
**Related handoff:** See `HANDOFF-CENSUS.md` for the weekly census grid that feeds these totals

---

## Project Context

**App:** STC Operations Portal  
**Stack:** React 19 + Vite + TypeScript + Tailwind v4 + lucide-react  
**Purpose:** Internal admin dashboard for a behavioral health facility Office Manager  
**Dev port:** 3004  
**Backend:** Supabase free tier (dev only, no real PHI yet). Will migrate to Firebase/Firestore + Google Cloud BAA when real clients go live.

**Existing components in `/src/components/`:**
- `DashboardView.tsx`
- `ClientsView.tsx`
- `AttendanceView.tsx`
- `ClientsView.tsx`
- `DischargeView.tsx`
- `ReportsView.tsx`
- `StaffView.tsx`
- `SettingsView.tsx`
- `Sidebar.tsx`
- `Header.tsx`
- `NoteModal.tsx`

**Critical rule:** Never make assumptions. Always ask for clarification before implementing any design, field, or behavior not explicitly specified. The questions listed at the bottom of this document MUST be answered before implementation begins.

---

## What This Page Is

The Running Attendance page is a cumulative attendance statistics view — one row per active client — showing their running treatment day totals. It is the React equivalent of a Google Sheets spreadsheet currently called **"2026 STC Current Client List / Running Attendance, CM and QOL."**

The goal is to bring this into the React app in a simplified, automated form. Totals update automatically whenever the Census is filled in for the day — no manual data entry into this page.

**Graduation target:** 85 TX days required for graduation.

---

## Current Spreadsheet Structure

### Header / metadata area
- Title: "STC DIOP Current Client List" (red header)
- "85 TX days required for graduation"
- "Complete through 06/25/26" (audit/data currency date)
- "Audited through L..." (cut off — appears to be an audit date column)

### Columns (in spreadsheet order)
| # | Column Name | Notes |
|---|-------------|-------|
| 1 | Admit Date | |
| 2 | Client Name | Bold |
| 3 | Insurance Co | |
| 4 | Full DAYS ATTENDED | |
| 5 | EXCUSED | Full-day excused absences |
| 6 | UNEXCUSED | Full-day unexcused absences |
| 7 | Half Days Attended | |
| 8 | Half Day Excused | |
| 9 | Half Day Unexcused | |
| 10 | TOTAL POSSIBLE TREATMENT DAYS | |
| 11 | Virtual Attendance | Note: "as of 11/1/24" |
| 12 | Tardy | Note: "As of 12/1/25" |
| 13 | Est. Discharge Date | Format: "85 tx days - 8/7/26" |
| 14 | Case Manager | Column was cut off in screenshot |

### Location groupings
- **Santa Fe** section at top
- **Albuquerque** section below (marked with green header row)

### Sample data rows (from screenshot)
| Client | Admit | Full Days | Excused | Unexcused | Half Days | Half Exc | Half Unexc | Total Possible | Virtual | Tardy | Est DC |
|--------|-------|-----------|---------|-----------|-----------|----------|------------|----------------|---------|-------|--------|
| Carlos Varela | 04/06/26 | 50 | 5 | 1 | 1 | 0 | 1 | 57 | 8 | 22 | 85 tx days - 8/7/26 |
| Damien Sundby | 05/04/26 | 38 | 0 | 0 | 0 | 0 | 0 | 38 | 0 | 1 | 85 tx days - 8/28/26 |
| Eve Gasarch (DIOP) | 03/24/26 | 20 | 1 | 2 | — | — | — | 23 | 1 | 5 | — |
| Eve Gasarch (EIOP DO NOT USE) | 04/06/26 | 27 | 5 | 6 | — | — | — | 38 | 9 | 2 | — |
| Eve Gasarch (DOP DO NOT USE) | 04/09/26 | 3 | 0 | 2 | 0 | — | — | 5 | 1 | 1 | — |
| Kelly Saro | 06/22/26 | 4 | 0 | 0 | — | — | — | 4 | 0 | 0 | — |

---

## The Eve Gasarch Situation (Multi-Program History)

Eve Gasarch appears **three times** in the spreadsheet — one row per program enrollment:
1. **EIOP** — marked "DO NOT USE" (historical, audit trail)
2. **DOP** — marked "DO NOT USE" (historical, audit trail)
3. **DIOP** — current active program

The old rows are kept for historical audit purposes but are not counted as active clients. This is a real data modeling challenge for the React app. **Do not guess how to handle this — see Question #1 below.**

---

## User's Vision for the React Version

Direct quote from the user:
> "I would really like a way to simplify this. It should be automated with the update of the census. Like the running attendance can show the totals and in the corner of the total it shows how it changed from day to day +1 for every item that went up one."

### Translation / interpretation
- **One clean client row** (not multiple program-history rows per client)
- **Delta badges:** Each stat cell shows a small indicator (e.g., "+1") in the corner showing how much that stat changed since the last update
- **Auto-update:** Totals recalculate automatically when Census attendance is entered for the day — no separate manual entry step
- **Simplified layout:** Fewer columns or smarter grouping than the current spreadsheet

---

## How Running Attendance Connects to the Census

The running attendance totals are **derived from the Census**. The Census page is a weekly grid where the office manager marks each client's status for each day. When a status is entered, the corresponding running attendance stat increments.

### Confirmed mappings

| Census mark | Affects |
|-------------|---------|
| `1` (attended) | Full Days Attended +1, Total Possible +1 |
| `T` (telehealth/virtual) | Virtual Attendance +1, Full Days Attended +1, Total Possible +1 (counts same as in-person toward 85) |
| `E` (excused absence) | Excused +1, Total Possible +1 |
| `U` (unexcused absence) | Unexcused +1 (does NOT add to Total Possible) |
| `H` (half day) | Half Days Attended +1; tracked separately, does NOT count toward 85-day graduation total |
| `H+E` (half day excused) | Half Day Excused +1 |
| `H+U` (half day unexcused) | Half Day Unexcused +1 |
| Tardy icon on census card | Tardy count +1 |

The Census page and Running Attendance page share the same underlying data model and must be planned together before either is fully implemented.

---

## Delta Badge Feature

The user wants a small "+1" (or similar) badge in the corner of each stat cell showing today's change. Implementation details are unresolved:

- Where exactly does the badge appear visually? (corner of the cell, superscript, tooltip, colored chip?)
- What time window does "change" mean? (since yesterday, since last page load, since start of week?)
- Should the badge disappear after some time, or persist until the next change?
- Should the badge show negative deltas (e.g., if a correction is made)?

Do not implement the delta badge until Question #3 and related UI questions are answered.

---

## Decisions — Answered 2026-06-29

### 1. Multi-program history
**Decision:** One row per client. Totals remain per-program enrollment (not rolled up across programs). The "DO NOT USE" duplicate rows from the spreadsheet are replaced by a **notes cog** on each client row — a gear icon that opens a text-area for notes. If the notes field has content, the cog turns **notification-violet**. Prior program history is accessible through this notes field rather than duplicate rows.

**Totals carry forward** across program transitions. All-time running totals are shown regardless of which program generated them.

### 2. Graduation calculation
**Decision:**
- **Virtual/telehealth days** count the same as in-person (1.0 toward the 85)
- **Half days** are tracked separately but do **not** count toward the 85-day graduation total (tracked for records only)
- **Excused absences** count toward Total Possible Treatment Days
- **Unexcused absences** — replicate spreadsheet behavior (confirm formula during Census data model work)

### 3. Delta badge time window
**Decision:** Since yesterday (calendar day). Each stat shows how much it changed compared to the same stat as of the prior calendar day.

### 4. Half-day columns
**Decision:** Keep as 3 separate columns, same as the spreadsheet: Half Days Attended, Half Day Excused, Half Day Unexcused.

### 5. Virtual Attendance — "as of 11/1/24"
**Decision:** That note is a historical footnote only. Virtual attendance IS tracked as a running total. The cog/notes field is where per-client virtual notes live; virtual attendance count is a standard column.

### 6. Tardy — "as of 12/1/25"
**Decision:** Tardy is tracked via an icon on each **Census card** (per-day, per-client). The Running Attendance page shows a **Tardy count** column derived by summing tardy icons from census entries — same as Full Days Attended is derived from attendance marks.

### 7. Estimated Discharge Date
**Decision:** Auto-calculated from admit date + attendance pace. Formula: project forward from current attendance rate to estimate when the client will reach 85 TX days, counting **weekdays only**. Holidays are excluded — a pre-programmed holiday calendar will be managed in the **Settings page**.

### 8. Case Manager column
**Decision:** Case manager detail lives on the client's individual page, not this view. On the Running Attendance table, show CM name only (or a link to the client's page). Full CM fields (phone, email, etc.) are out of scope for this view.

### 9. Insurance column
**Decision:** Display only — show insurer name for reference. No billing tracking on this page.

### 10. Billing / invoiced status
**Decision:** Not on this page. Billing/invoicing is handled on the Census page only.

### 11. "Complete through" date
**Decision:** Automatic — the app computes and displays the last date for which census data is complete for all active clients.

### 12. Location grouping
**Decision:** Filter tabs at the top of the page (All / Santa Fe / Albuquerque).

---

## Data Model Notes (Preliminary — Do Not Implement Until Questions Answered)

The running attendance stats are derived, not stored independently. The source of truth should be the individual census entries. Running totals can be:
- **Computed on read** (aggregate queries at page load) — simpler, always accurate, potentially slower with many clients
- **Maintained as a materialized summary** (a `client_attendance_summary` table updated via triggers or server-side logic) — faster reads, more complex to maintain

This decision should be made alongside the Census page data model. Do not finalize the schema until both pages are planned together.

---

## Files to Create (When Ready to Implement)

- `src/components/RunningAttendanceView.tsx` — main page component
- `src/components/running-attendance/ClientAttendanceRow.tsx` — single client row
- `src/components/running-attendance/DeltaBadge.tsx` — the "+1" delta indicator
- `src/components/running-attendance/LocationSection.tsx` — Santa Fe / Albuquerque grouping (if grouped by location)
- Possibly: `src/hooks/useRunningAttendance.ts` — data fetching + aggregation logic
- Possibly: `src/types/attendance.ts` — shared TypeScript types

These are placeholders only. Finalize structure after design questions are answered.

---

## Do Not Implement Until

- [x] All 12 questions answered (2026-06-29)
- [x] Program totals carry forward across transitions
- [x] Excused absences count toward Total Possible Treatment Days
- [x] Tardy = icon on Census card, summed as a count column here
- [x] Unexcused absences do NOT count toward Total Possible Treatment Days
- [x] Est. Discharge Date: weekdays only, holidays excluded via Settings holiday calendar
- [ ] Census page data model finalized (shared dependency — do this first)
- [ ] Settings page: holiday calendar feature scoped and planned

---

## See Also

- `.planning/HANDOFF-CENSUS.md` — Census weekly grid page (feeds this page's totals)
- `.planning/PROJECT.md` — overall project planning document


---
<!-- archived from HANDOFF.md on 2026-07-18 -->

# Handoff — STC Operations Portal
**Date:** 2026-06-21  
**Repo:** `/Users/ts/github-sites/STC-Comrehensive-main`  
**Stack:** React 19 + Vite + TypeScript + Tailwind v4 + lucide-react  
**Dev server:** `npm run dev` → runs on port 3004 (3000–3003 in use on this machine)

---

## What this app is

STC Operations Portal — an internal behavioral health clinical operations EHR for admin staff. Not a consumer app. Register is "clinical control room": dense, precise, trust-through-consistency. PRODUCT.md and DESIGN.md are both present and complete. Impeccable context is loaded.

---

## What was built this session

### Attendance model refactored (COMPLETE)

`src/types.ts` — `AttendanceEntry` interface:
```ts
export interface AttendanceEntry {
  date: string;
  status: 'Present' | 'Absent';   // was 'Present' | 'Absent' | 'Late'
  tardy?: boolean;                  // NEW — amber Clock icon toggle
  virtual?: boolean;                // NEW — blue Video icon toggle
  note?: string;                    // TODO: callout/excused/unexcused — next pass
}
```

`App.tsx` — `handleUpdateClientAttendance` accepts partial updates:
```ts
handleUpdateClientAttendance(clientId, historyIndex, { status?, tardy?, virtual? })
```

Both `ClientsView` and `AttendanceView` receive `onUpdateAttendance` with this signature.

### Client profile calendar boxes (COMPLETE)

`src/components/ClientsView.tsx` — Each day box:
- **Top half click**: toggles Present ↔ Absent
- **Below divider**: Clock icon (amber = tardy) + Video icon (blue = virtual)
- Both icons disabled + greyed when Absent
- Legend updated to show all four states

### Clinic roster cards (COMPLETE)

`src/components/AttendanceView.tsx` — Each client row:
- Status **pill** toggles Present ↔ Absent on click
- Clock + Video icons inline to the right of the pill
- Same disable-when-Absent behavior
- "Late Arrivals" filter renamed "Tardy Arrivals"

---

## What needs to be built next (PRIMARY TASK)

### Program structure + two-block attendance

The facility runs four group programs plus individual therapy:

| Program | Time | Days |
|---|---|---|
| DIOP (Day Intensive Outpatient) | 11:45 AM – 1:30 PM | Mon–Fri |
| DOP (Day Outpatient) | 1:45 PM – 3:00 PM | Mon–Fri |
| EIOP (Evening Intensive Outpatient) | 3:45 PM – 5:30 PM | Mon–Fri |
| EOP (Evening Outpatient) | 5:45 PM – 7:00 PM | Mon–Fri |
| IND (Individual therapy) | Varies | Once/week |

**Key rules:**
- DIOP clients attend **both** the 11:45 and 1:45 blocks → two independent attendance records per day
- DOP clients attend only the 1:45 block
- EIOP clients attend both the 3:45 and 5:45 blocks → two independent attendance records per day
- EOP clients attend only the 5:45 block
- ALL clients (regardless of program) have a weekly IND session tracked separately
- IND-only is its own track: clients who've completed group step down to one IND/week

**Enrollment / graduation flow:**
- Single enrollment record per client. `program` tag changes as they step down: DIOP → DOP → IND
- Attendance history retains which program was active at each entry (label each record with program at time of logging)
- Reports need: total days attended, absences subtracted, tardy count — all filterable by program stage

### Roster view restructure

Currently shows flat lists by program. Needs to become **4 time-block sections**:
1. DIOP Block — 11:45 AM–1:30 PM (DIOP clients only)
2. DOP Block — 1:45–3:00 PM (DOP clients + DIOP clients again for second block)
3. EIOP Block — 3:45–5:30 PM (EIOP clients only)
4. EOP Block — 5:45–7:00 PM (EOP clients + EIOP clients again for second block)
5. IND Section — today's scheduled IND sessions (pre-populated from calendar parse + manual add button)

### IND section on roster

- Pre-populated from a calendar parsing feature (already exists separately — shows Time, Client Name, Phone, Therapist, Program/Location, Status columns — see screenshot described below)
- Needs a **manual "Add" button** for therapist-rescheduled sessions not on calendar
- IND attendance also tracked with Present/Absent + tardy/virtual modifiers

### Daily Reminders panel (separate feature, relates to IND)

A "Daily Reminders" panel already exists in another part of the codebase (screenshot was shared). It shows:
- Columns: TIME | CLIENT NAME | PHONE NUMBER | THERAPIST | PROGRAM/LOCATION | STATUS (dropdown: Confirmed/etc.)
- Header: "Daily Reminders (Calls for [date])" with a `+` button and "Send Daily Reminders" CTA
- This list is pre-populated by parsing therapist calendars
- The same calendar parse also produces UA (urinalysis) schedules — that feature needs tracking too

---

## Outstanding TODOs in code

```
// TODO: callout / excused / unexcused notes — tackle in next pass
```
This is on `AttendanceEntry.note` in `types.ts`. The note field already exists in seed data (e.g. "Medical appointment", "Traffic delays"). The excused/unexcused/callout layer is not yet designed.

---

## Questions that were asked but NOT fully resolved

1. **Two-block calendar display** — For a DIOP client in their profile, how should the day boxes show both the 11:45 block AND the 1:45 block? Two boxes per day column? Or one card that expands?
2. **Virtual + Absent** — User confirmed Absent+Virtual is a valid state (client connected virtually then disconnected for second half). Currently disabled per user instruction, but may need revisiting.
3. **IND on roster** — Whether to show IND every day (with N/A for non-IND days) or only on scheduled days → user said use the calendar parse to pre-populate, so only on days with scheduled sessions.

---

## Files changed this session

- `src/types.ts`
- `src/data.ts`
- `src/App.tsx`
- `src/components/ClientsView.tsx`
- `src/components/AttendanceView.tsx`
