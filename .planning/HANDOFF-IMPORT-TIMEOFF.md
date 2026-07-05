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
