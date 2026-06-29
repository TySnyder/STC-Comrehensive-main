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
