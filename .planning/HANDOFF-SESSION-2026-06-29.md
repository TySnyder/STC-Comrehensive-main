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
