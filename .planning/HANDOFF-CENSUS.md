# Handoff: Census Page — STC Operations Portal

**Date written:** 2026-06-29  
**Status:** Pre-implementation — outstanding questions must be resolved before any code is written.

---

## Project Context

**App:** STC Operations Portal — internal admin dashboard for the Office Manager at Solutions Treatment Center (STC), a behavioral health facility with two locations: Santa Fe (SF) and Albuquerque (ABQ).

**Stack:** React 19 + Vite + TypeScript + Tailwind v4 + lucide-react. Dev port: **3004**.

**Backend:** Supabase free tier (dev phase). No real PHI yet. Will migrate to Firebase/Firestore + Google Cloud BAA when real clients go live.

**Existing components** (all in `/Users/ts/github-sites/STC-Comrehensive-main/src/components/`):
- `DashboardView.tsx`, `ClientsView.tsx`, `AttendanceView.tsx`, `DischargeView.tsx`
- `ReportsView.tsx`, `StaffView.tsx`, `SettingsView.tsx`
- `Sidebar.tsx`, `Header.tsx`, `NoteModal.tsx`

**Visual style:** slate-50 background, white cards, slate-200 borders, slate-800 text. Clinical/administrative aesthetic. WCAG AA required — never use color as the only indicator.

**Critical rule from the Office Manager: Never make assumptions. Always ask for clarification before implementing any design, field, or behavior not explicitly specified.**

**Project docs:**
- `/Users/ts/github-sites/STC-Comrehensive-main/.planning/PROJECT.md` — full requirements, constraints, decisions log

---

## What the Census Page Is

A **weekly attendance grid** that replaces the current Google Sheets census spreadsheet. It shows all clients across both locations (SF + ABQ), with one or more rows per client and one column per day of the week (Sun–Sat). Each cell holds a short status code.

The goal is a **simplified** version of the spreadsheet — cleaner and more automated, not a pixel-perfect replica.

---

## Program Structure

| Program | Time | Days | Notes |
|---------|------|------|-------|
| DIOP (Day IOP) | 11:45 AM – 1:30 PM | Mon–Fri | |
| DOP (Day OP) | 1:45 PM – 3:00 PM | Mon–Fri | DIOP clients also attend this block |
| EIOP (Evening IOP) | 3:45 PM – 5:30 PM | Mon–Fri | |
| EOP (Evening OP) | 5:45 PM – 7:00 PM | Mon–Fri | EIOP clients also attend this block |
| IND | Varies | Once/week | Individual therapy |

**Two-block rule:** DIOP clients attend BOTH the 11:45 (DIOP) and 1:45 (DOP) blocks — two independent attendance records per day. EIOP clients attend BOTH the 3:45 (EIOP) and 5:45 (EOP) blocks.

---

## Current Spreadsheet Structure (What We're Replacing)

### Status Code Legend

| Code | Meaning |
|------|---------|
| `1` | Attended Program/Service |
| `0` | No Program/Service |
| `L` | Last Day of Program Attended |
| `E` | Excused Absence |
| `U` | Unexcused Absence |
| `T` | Attended Telehealth |
| `P` | Client In Person (IND Only) |
| `D` | Discharge Date |
| `H` | Holiday |
| `C` | Closed (Weather, Etc.) |
| `R` | Client at their residence |
| `N` | Client NOT at their residence |
| `0.5-0` | Half day (attended one block, absent the other) |

### Grid Layout (Spreadsheet)

- **Columns:** Sun, Mon, Tue, Wed, Thu, Fri, Sat (weekday dates shown in red in the spreadsheet)
- **Far right:** "Level of Care" column — program type for that row
- **Right side:** "Notes / Excused / Unexcused" — free-text column
- **Far right:** "INS Bill" column — insurance billing status (unclear if this belongs in the React app — see questions)
- **Top right:** "Week" label + date (yellow cell) + "Invoiced" status (green cell)

### Rows Per Client (Spreadsheet Has 4 Rows Per Client)

1. **Program row** (e.g., DIOP) — daily attendance status code (1, 0, L, E, U, etc.)
2. **LOC row** — location modifier per day (T, R, T/R, T/R-U, P, N, etc.)
3. **IND row** — weekly individual therapy attendance (with a client initials code like "VeGeKl: 1")
4. **LOC row** — location modifier for the IND session

**Client name row styling in spreadsheet:** Bold client name with "M-F" suffix, purple/blue background highlight.

### Section Headers

- **"SANTA FE"** — dark red/maroon header
- **"Albuquerque"** — green header

There is also a small **blue square column** after the Level of Care column whose purpose is unknown (see questions).

---

## Design Goals for the React Version

1. **Simplified:** Cleaner than the spreadsheet. No merged cells, no color-coded everything.
2. **Automated:** Running attendance totals update automatically when census is updated.
3. **WCAG AA:** Every status indicator uses both color AND a symbol/text label.
4. **Consistent with app:** Use existing slate-based palette, white cards, clinical aesthetic.
5. **Week navigation:** Users need to move forward/backward by week.

---

## Outstanding Questions — MUST ASK BEFORE IMPLEMENTING

These must be resolved with the user before writing any code. Do not assume answers.

### 1. LOC (Location) Row Display
The spreadsheet shows a separate LOC sub-row for each client per program (e.g., "T", "R", "T/R"). Should the React census:
- **Option A:** Keep a separate sub-row per client for location modifiers (mirrors spreadsheet)?
- **Option B:** Collapse location into the main attendance cell as a small badge or secondary symbol?
- **Option C:** Something else?

### 2. Blue Square Column
There is a small blue square column immediately after the "Level of Care" column in the spreadsheet. What does this column track?

### 3. INS Bill Column
There is an "INS Bill" column on the far right of the spreadsheet (insurance billing status). Should this:
- Appear in the census view?
- Live in a separate billing/reporting view?
- Not be in the React app at all (handled outside the portal)?

### 4. Half-Day Code (0.5-0)
The `0.5-0` code appears to represent attending one of two blocks but not the other (relevant to DIOP/DOP and EIOP/EOP two-block clients). How should this display in the React UI? Options:
- A split cell (top half filled, bottom half empty)?
- A single symbol like `½`?
- Two separate cells, one per block?
- Something else?

### 5. Single Row vs. Multi-Row Per Client
The spreadsheet uses 4 rows per client. For the React census, should each client have:
- **Multiple sub-rows** (program row + LOC row, mirroring the spreadsheet)?
- **A single row** with LOC info embedded differently (badge, tooltip, popover)?
- **Expandable rows** (collapsed by default, expand to show LOC detail)?

### 6. Inline Editing vs. Read-Only
Should clicking a census cell:
- **Open an edit popover/modal** to change the status code directly in the census?
- **Be read-only** in this view, with data entered only via the Attendance view?
- **Link to the Attendance view** for that client + day when clicked?

### 7. IND Row — What Does the Number Mean?
The IND row in the spreadsheet shows client initials + a number (e.g., "VeGeKl: 1"). What does the number represent?
- Sessions attended this week?
- Total IND sessions to date?
- Something else?

### 8. Week Boundaries
The grid shows Sun–Sat columns. Does the census week run Sun–Sat, or Mon–Sun, or Mon–Fri (with weekends grayed out)?

### 9. "Invoiced" Status
The spreadsheet has an "Invoiced" green cell per week. Should the React census track whether a week has been invoiced? If so, who marks it invoiced and what does that trigger?

### 10. Empty Weekend Cells
Clients generally attend Mon–Fri only. Should Sat/Sun cells be:
- Grayed out / disabled?
- Still enterable (for any weekend programming)?
- Hidden entirely?

---

## What Has Already Been Done

- The app shell, navigation (Sidebar), and all other views are complete.
- Mock data exists in `src/data.ts` with realistic client/attendance seed data.
- The census is listed as an "Active" requirement in `PROJECT.md`.
- A Stitch design prompt was drafted in a prior session but was not finalized — it should be revised once the outstanding questions above are answered.

---

## Suggested First Steps for the New Session

1. **Read this document** (done).
2. **Read** `/Users/ts/github-sites/STC-Comrehensive-main/.planning/PROJECT.md` for full project constraints.
3. **Ask all outstanding questions** (section above) in a single message to the user. Do not implement anything until you have answers.
4. Once answers are in, draft the component structure and data model for review before writing code.
5. If using Stitch for initial UI design, write the updated Stitch prompt based on the answers and show it to the user for approval before running it.

---

## Files to Read Before Starting

| Path | Why |
|------|-----|
| `/Users/ts/github-sites/STC-Comrehensive-main/.planning/PROJECT.md` | Full requirements, constraints, decisions |
| `/Users/ts/github-sites/STC-Comrehensive-main/src/data.ts` | Mock data model — client/attendance structure |
| `/Users/ts/github-sites/STC-Comrehensive-main/src/components/AttendanceView.tsx` | Closest existing component — reuse patterns |
| `/Users/ts/github-sites/STC-Comrehensive-main/src/components/ClientsView.tsx` | Client list patterns |
| `/Users/ts/github-sites/STC-Comrehensive-main/src/components/Sidebar.tsx` | How census route should be registered |

---

*Written: 2026-06-29*
