# Spreadsheet → App Traceability Map

One doc per live workbook in `live data/`. Each doc records what the spreadsheet does,
its field inventory, how it maps to app modules, and **open questions** that must be
answered before the corresponding module is considered spec-complete.

**Rule: no PHI in these docs.** Field names, codes, formulas, and workflow only.

| # | Workbook | Doc | App module(s) | Status |
|---|----------|-----|---------------|--------|
| 1 | 2026 STC 2nd QTR Census.xlsx | [01-census-qtr.md](01-census-qtr.md) | Census grid, Facesheet, **UA tracking (missing)** | Grid built · Facesheet partial · UAs not planned |
| 2 | 2026 STC Current Client List _ Running Attendance, CM and QOL.xlsx | [02-running-attendance.md](02-running-attendance.md) | Running Attendance, **QOL follow-ups (missing)**, **CM/UA needs (missing)** | Decisions locked, not built |
| 3 | 2026 Solutions Call Tracking Pending Admits.xlsx | [03-call-tracking.md](03-call-tracking.md) | Call tracking, **call-outs**, **pending admits**, **outreach (missing)** | Not built |
| 4 | 2026 Staff Schedule.xlsx | [04-staff-schedule.md](04-staff-schedule.md) | Schedule builder, Time-off | Built (verify parity) |
| 5 | _STC Client Contact Sheet 2026.xlsx | [05-contact-sheet.md](05-contact-sheet.md) | Client profile contact fields, **emergency contacts (missing)** | Partial |
| 6 | MASTER DIOP/DOP + _MASTER EIOP/EOP Attendance.xlsx | [06-master-attendance-templates.md](06-master-attendance-templates.md) | None (email templates; manual entry is locked decision) | N/A |
| 7 | 2026 STC Case Management Tracker.xlsx | [07-case-management-tracker.md](07-case-management-tracker.md) | **Service-contact log (missing)**, QOL scheduler, BestNotes sign-off cross-check | Parsed 2026-07-02 |
| 8 | Admin Discharges Tracking 2026.xlsx | [08-admin-discharges.md](08-admin-discharges.md) | Discharge workflow checklist + DC status enum | Parsed 2026-07-02 |
| 9 | Group Schedule (Word, weekly) | [09-group-schedule.md](09-group-schedule.md) | Schedule/curriculum (17-week themes) — **v1: none** | Parsed 2026-07-02 |
| — | 2025 STC Current Client List … .xlsx | (evidence for doc 02) | Resolved TOTAL POSSIBLE + full code list via its instruction tab | Reference |
| — | damien_sundby_census.csv | (none) | Already app-format: matches `CensusEntry` import shape | Test fixture |

## Decisions locked 2026-07-02 (user, incoming office manager)

- **Lifecycle confirmed:** `Inquiry → Pending Admit → Active → Discharged` — one record, status field, rows never move. **Discharge must be reversible** (real case: vacation + insurance gap handled as excused absences instead of DC).
- **Readmission = new episode.** A fully discharged client returning is a new episode; BestNotes convention appends " 2", " 3" to the name. App: one Client, many Episodes.
- **TOTAL POSSIBLE resolved** — see doc 02 (days offered; derive from calendar).
- **v1 scope = admin section first.** UR tracking (intake dept) → v2. Incident logs/HR reminders → later. Billing stays in CollabMD/BestNotes; app only needs per-item "billed" flags (green-cell convention).
- Program structure: 85 weekdays = 17 weeks; 17 weekly curriculum themes.
- P&P manual (250 pp, user-built versioning via Apps Script) — not reading unless needed.

## Decisions locked 2026-07-02 PM (user Q&A round 2)

- **Half days:** no longer allowed (billing), codes kept for emergencies. Each track = two blocks/day (DIOP 11:45–1:30 + DOP 1:45–3:00; EIOP 3:45–5:30 + EOP 5:45–7:00); `.5` = attended one block. → doc 02
- **Census location capture:** cycling toggle per card — in person (default) → virtual from home → virtual not at residence (person/home/car icons). → doc 01
- **Census day sub-columns:** code + modifier (E/U if absent; location if present) — *not* program blocks. → doc 01
- **Audit sign-off feature: yes** ("audited through [date] by [user]"); audits are weekly, owner (Amy) reviews. → doc 01
- **UA module: yes** — per-client requirement selector, weekly random-day assignment, completion tracking, absent-day rollover; documentation stays external. → doc 01 Q11
- **Est. DC date:** predicted (default 85 treatment days, min 30) + optional note; no free-text TBD. → doc 02
- **DC statuses defined** (Approved / ASA / Admin DC, multi-select); reversal deletes tracker row; user+assistant chase paperwork, give up 1 month post-DC. → doc 08
- **QOL: deprioritized** (cadence fully understood; not building now). → docs 02/07
- **Schedule builder: yes** — extend existing Program Schedule Builder with facility-wide 17-theme week tracking. → doc 09
- **CM tracker (doc 07): not in v1.**

## How to use this map

1. Before building/finishing a module, open its doc and resolve every open question with the Office Manager (never assume — feedback memory).
2. When a question is answered, record the answer inline and mark it ✅.
3. A module is migration-ready when every spreadsheet column in its doc is either mapped to an app field or explicitly marked "dropped — reason".

## Context: BestNotes

BestNotes is the clinical EHR of record. This portal is the **administrative/operations
layer** — it must not become the clinical record, but it can support BestNotes workflows
(e.g., cross-checking census vs. EHR, prompting what needs to be entered there).
