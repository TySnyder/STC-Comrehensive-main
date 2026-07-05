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
