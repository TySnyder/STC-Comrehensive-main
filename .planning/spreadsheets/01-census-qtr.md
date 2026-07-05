# 01 — 2026 STC 2nd QTR Census.xlsx

**One workbook per quarter.** Three sheet types repeat: weekly census grids, a monthly
Facesheet, and a monthly UAs log.

---

## Sheet type A: Weekly census grid (e.g. "June 28 - Jul 4")

The origin of the app's Census view. Sunday–Saturday grid, clients grouped by
program + location sections (e.g. "DIOP - IOP/IND" → "ABQ"), numbered client rows.

### Layout
- Rows 2–5: code legend (below)
- Rows 7–8: day headers `Sun 28 | Mon 29 | … | Sat 4`
- Column V: "Level of Care" (LOC per client)
- Column AT: "Notes / Excused / Unexcused" — also "Invoiced" flag appears here
- Column AV: "INS Billing Notes"
- Day columns are merged pairs (two sub-columns per day — presumed AM/PM block split)

### Full code legend (from sheet, complete)
| Code | Meaning | App mapping (`CensusEntry`) |
|------|---------|------------------------------|
| 1 | Attended Program/Service | `status: 'Present'` |
| 0 | No Program/Service | ⚠️ unmapped — is this different from blank? |
| L | Last Day of Program Attended | `specialCode: 'L'` |
| T | Attended Telehealth | `virtualMode` (which value?) |
| E | Excused Absence | `status: 'Absent', excused: true` |
| P | Client In Person (IND Only) | ⚠️ unmapped |
| U | Unexcused Absence | `status: 'Absent', excused: false` |
| D | Discharge Date | `specialCode: 'D'` |
| H | Holiday | `specialCode: 'H'` (import-only, per prior decision) |
| C | Closed (Weather, Etc) | `specialCode: 'C'` |
| R | Client at their residence | `virtualMode: 'residence'` |
| N | Client not at their residence | `virtualMode: 'away'`? ⚠️ confirm |

Note: **Tardy is not in the census legend** — it comes from the Running Attendance
workbook. App tracks it per census card (locked decision) — confirm that's additive, not replacing anything.

### App status
- Census grid: **built** (`CensusGrid.tsx`, `CensusCell.tsx`)
- INS Billing Notes: **built** (`InsuranceBillingModal`, `InsuranceBillingNote`)
- Weekly totals/analytics: built (Totals/Runway/Analytics tabs)

### Open questions
1. ✅ **Code `0` — RESOLVED 2026-07-02** (2025 Running Attendance instruction tab): `0` = "No program offered that day to that client". It is an affirmative mark, counted nowhere. App needs a per-client "no program offered" day state distinct from blank/unentered. (Also from same tab: `C` = office closed, `H` = holiday, `anything/L` = last day of services.)
2. ✅ **Codes `P`/`T`/`R`/`N` capture — RESOLVED 2026-07-02 (user):** each census card gets a cycling **location toggle**: in person (default, person icon) → virtual from home (home icon) → virtual not at residence (car icon). Spreadsheet mapping: in person ↔ `P`/plain `1`; virtual at residence ↔ `T`+`R`; virtual not at residence ↔ `T`+`N`. Current app cycles via the video button; change the cycle/icons to person → home → car.
3. ✅ **Code `N` — RESOLVED:** third state of the location toggle (virtual, not at client's residence). See Q2.
4. ✅ **Two sub-columns per day — RESOLVED 2026-07-02 (user):** they are **not** program blocks. Sub-column 1 = attendance code; sub-column 2 = modifier: if absent → Excused/Unexcused; if present → in person vs virtual, and at-residence vs not.
5. ✅ **Sun/Sat columns — RESOLVED:** never used.
6. ✅ **Quarter rollover — RESOLVED (mostly):** audits are weekly; an issue can escalate to a quarter-wide audit. Amy (owner) reviews. Simplifying this to prevent errors is a core project goal.
7. ✅ **Audit sign-off — RESOLVED:** yes, build an "audited through [date] by [user]" sign-off feature.
8. ✅ **"Invoiced" flag — RESOLVED:** green cell fill = invoiced; Billing + the financial coordinator mark cells green once billed. Not related to the notes column. App: per-item "billed" flag (matches locked decision).

---

## Sheet type B: Monthly Facesheet (e.g. "June Facesheet")

Monthly roster snapshot per client — the admin-side summary card.

### Columns (row 6 headers)
| Column | Field |
|--------|-------|
| B | Program (DIOP–OP etc.), grouped w/ location sub-headers (ABQ/SF) |
| C | Client name |
| G | IOP Admit Date |
| I | Projected DC Date |
| K | Actual IOP DC Date |
| M | IOP # of Days |
| O | IND Level of Care (Yes/No) |
| Q | IND # of Days |
| S | Client Payment Type(s) (insurance + fee notes, e.g. UA pricing) |
| U | Notes |
| W | Primary Therapist |

### App status
Partial — Client profile has program, admissionDate, expectedDischargeDate, insurance,
primaryTherapist. **Missing:** actual DC date, IOP # of days (derivable), IND
LOC flag + IND day count, payment/fee notes as a distinct field.

### Open questions
9. Is the monthly Facesheet a *report generated from* census data, or separately
   maintained? (In the app it should be derived — confirm nothing on it is manually curated other than Notes/Payment.)
10. ✅ **"IOP # of Days" — RESOLVED 2026-07-02 (user, "I believe"):** days **per week** the client is enrolled for (enrollment intensity), not attended/calendar days. Verify against a live sheet when building the Facesheet.

---

## Sheet type C: Monthly UAs (e.g. "June UAs")

Per-client urinalysis/breathalyzer log for the month. **Not in the app or PROJECT.md
requirements at all.**

### Structure
- Test codes: `B` Breathalyzer · `U` Urinalysis · `UA` Urinalysis w/ Alcohol Metabolites · `MJ` Marijuana Levels (prefix "MJ" before date when applicable)
- Per client: 17 repeating "Date & Initials" column pairs (one per test administered)
- Totals: Total B / Total U / Total UA / MJ Levels / Total ALL tests
- "Invoiced" flag
- Grouped "All Levels of Care"

### App status
**Missing module.** Running Attendance sheet also has a "UA Needs" column per client
(e.g. weekly/monthly cadence) — these two belong together: UA requirements + UA log.

### Open questions
11. ✅ **UA module — RESOLVED 2026-07-02 (user): yes, build it.** Spec from user:
    - Each client's portfolio page gets a **predefined UA requirement selector** (frequencies observed: 2×/week, 1×/week, ~monthly for non-substance-abuse clients, or external — some go to their PCP and don't test in house).
    - Today the Director of Client Services (intake) picks a **random day each week** per client. App priority = **assigning UAs and tracking completion dates**, not full documentation (results stay in BestNotes/spreadsheets/email).
    - **Rollover rule:** if a client is absent on their assigned day, the assignment rolls to the next day.
    - Who enters: intake staff / office manager; whoever performs the UA logs it (user logs their own in the CM tracker, doc 07).

    **Build decisions locked 2026-07-02 PM (user Q&A round 3):**
    - Generation: **"Generate this week" button** randomizes days per client honoring frequency, with per-client re-roll and manual override (not fully automatic, not manual-only).
    - Completion capture: **date + who completed it** (no test-type field in v1). Per-item **billed** flag kept (green-cell convention, Q13).
    - Rollover: **automatic from census data** — Absent on assigned day rolls the assignment to the next program day, labeled "rolled from [day]"; staff can still change it.
    - Frequency selector options: **2×/week · 1×/week · Monthly · External (PCP) · None**, plus a **free-text note** for unusual arrangements.
    - UI: new **UA Tracking** sidebar tab (weekly hub) + requirement selector on the client profile.
12. "Initials" = staff attestation. Does that need to be a real user attribution in the app (audit-grade)? *(Lower priority now — user says in-app documentation matters less than assignment/completion tracking.)*
13. ✅ **UA invoicing — RESOLVED 2026-07-02:** same green-cell convention as census — Billing/financial coordinator marks a cell green once billed. App: per-item "billed" flag, no billing module.
