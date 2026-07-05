# 04 — 2026 Staff Schedule.xlsx

**Staff shift schedule + time-off requests.** The app already has both modules
(Schedule builder with `stc-schedule-slots` localStorage, Time-off view) — this doc is a
parity check.

---

## Sheet type A: Weekly schedule (one sheet per week) + "Master Staff Schedule 62426" template

- Time columns spanning **7:00a–1:00a** (18-hour coverage window)
- Staff rows, including special rows **"Back Up"** and **"On Call"**
- New weeks appear to be copied from the Master template sheet

### App status
Schedule builder built (grid slots). ⚠️ Verify:
- App's time range covers 7:00a–1:00a (past-midnight shifts)
- Back Up / On Call roles exist as assignable rows/roles
- A "master template → new week" flow exists (or is unneeded)

## Sheet type B: "2026 Time Off Request"

| Field | App (`TimeOffRequest`) |
|-------|------------------------|
| Date Submitted | ✅ |
| Staff Name | ✅ |
| Dates Requesting Off | ✅ |
| Staff Covering Shift | ⚠️ verify field exists |
| Approved / Denied | ✅ status |
| Added to Schedule ("X") | ⚠️ verify — flag that approved time off was reflected in the weekly schedule |

## Open questions
1. Who approves time off, and should approval require a distinct role/permission in the app?
2. "Added to Schedule X" — should the app auto-reflect approved time off in the schedule grid (removing the manual step) instead of tracking a checkbox?
3. Are Back Up / On Call actual staff assignments per shift? How are they chosen?
4. Do both locations share one schedule, or is scheduling per-location?
5. Are there shift types/roles (front desk, tech, clinician) that the grid should encode?
