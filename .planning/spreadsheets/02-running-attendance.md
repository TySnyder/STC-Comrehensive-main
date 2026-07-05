# 02 — 2026 STC Current Client List / Running Attendance, CM and QOL.xlsx

**The master client tracker.** One sheet per program track for current clients
(DIOP, EIOP) plus discharged mirrors (DIOP DC, EIOP DC), and a "How to Update
Running Attendanc[e]" instruction sheet.

This workbook is the strongest evidence for the **client lifecycle** requirement:
a client's row physically moves from DIOP/EIOP → the DC sheet at discharge. In the
app this should be a **status field on one client record**, never a copy/move.

---

## Sheets

| Sheet | Purpose |
|-------|---------|
| DIOP | Current day-track clients |
| EIOP | Current evening-track clients |
| DIOP DC / EIOP DC | Discharged clients (rows moved here at DC — archive) |
| How to Update Running Attendanc | Code translation instructions (1T, .5T/E, .5T/U) |

## Columns (A–Y, same on all four client sheets)

| Col | Field | App mapping |
|-----|-------|-------------|
| A | Admit Date | `Client.admissionDate` ✅ |
| B | Client List (name) | `Client.name` ✅ |
| C | Insurance Co | `Client.insurance` ✅ |
| D | Full DAYS ATTENDED | derived from census ✅ (planned) |
| E | EXCUSED | derived ✅ |
| F | UNEXCUSED | derived ✅ |
| G | Half Days Attended | derived — ⚠️ app has no half-day concept yet |
| H | Half Day Excused | ⚠️ missing |
| I | Half Day Unexcused | ⚠️ missing |
| J | TOTAL POSSIBLE TREATMENT DAYS `=SUM(D:G)` | ⚠️ **formula conflicts with locked decision** (below) |
| K | Virtual Attendance | derived from `virtualMode` ✅ |
| L | Tardy | census card tardy ✅ |
| M | Est. Discharge Date (free text) | `Client.expectedDischargeDate` — ⚠️ spreadsheet allows free text like "TBD" |
| N | Case Mgt Needs | ⚠️ missing field |
| O | UA Needs | ⚠️ missing field (pairs with UA log, doc 01) |
| P–V | QOL: ADMIT / 30 / 60 / 90 / 120 / DC / 30-post (dates) | ⚠️ **missing module** |
| W | Therapist | `Client.primaryTherapist` ✅ |
| X | CM (case manager) | ⚠️ missing field |
| Y | CURRENT STATUS | QOL follow-up status (see Q3) — QOL module, deferred; NOT lifecycle |

## Attendance code translations (full list from 2025 instruction sheet)

| Code | Meaning | Column it feeds |
|------|---------|-----------------|
| `1T` | 1 full day of treatment | Full DAYS ATTENDED |
| `.5T/E` | Half attended, other half excused | Half Days Attended + Half Day Excused |
| `.5T/U` | Half attended, other half unexcused | Half Days Attended + Half Day Unexcused |
| `U` | Unexcused absence | UNEXCUSED |
| `E` | Excused absence | EXCUSED |
| `0` | No program offered that day to that client | — (not counted anywhere) |
| `anything/L` | Last day of services → row cut-pasted to DC sheet | Full DAYS ATTENDED |
| `C` | Office closed | CLOSURES (not on Running Attendance) |
| `H` | Holiday | CLOSURES (not on Running Attendance) |
| Tardy | Days late (as of 12/1/25) | Tardy column |

## ✅ RESOLVED (2026-07-02): TOTAL POSSIBLE formula

The 2025 workbook's instruction tab defines TOTAL POSSIBLE as **days the program
was offered to that client**: "Add 5 to each client's total possible treatment
days, minus any closures" (SF OP / schedule exceptions use the client's own
schedule). 2025 uses the same `J=SUM(D:G)` formula as 2026 — full attended +
excused + unexcused + half attended is a self-consistent shortcut for "days
offered". **There was no contradiction**: the old locked decision conflated
"days offered" (unexcused DO count) with "days credited toward the 85"
(attendance progress — a separate measure).

**App model:** derive TOTAL POSSIBLE from the calendar (weekday count from admit
date, minus closures/holidays, honoring per-client schedule exceptions) and show
85-day progress (attended days) as a separate number.

## Client lifecycle model (proposed — needs confirmation)

The DC sheets + "CURRENT STATUS" column + Call Tracking's "Pending Admit FCs" sheet
together imply:

```
Inquiry (call) → Pending Admit → Active → Discharged (record retained)
```

App representation: single `Client` record with `status` +
`dischargeDate`; views filter by status instead of moving data. Records never
deleted — discharged clients keep full census/attendance/UA history.

## Open questions

1. **TOTAL POSSIBLE formula vs locked decision** (above) — which wins?
2. ✅ **Half days — RESOLVED 2026-07-02 (user):** Half days are **no longer allowed** (poor billing reimbursement), but codes stay for emergencies. Each track runs as **two blocks per day**: DIOP 11:45a–1:30p (block 1), break, 1:45p–3:00p (block 2 = **DOP** — OP-level clients join for this block only); EIOP 3:45p–5:30p, break, **EOP** 5:45p–7:00p. A `.5` = client attended only one of their track's two blocks. App: model per-day attendance with two blocks per track; half-day is exceptional, not a normal entry path. (Also supports doc 01 Q4: the two sub-columns per day are almost certainly these two blocks — confirm.)
3. ✅ **CURRENT STATUS (col Y) — RESOLVED 2026-07-02 (user):** tracks the status of QOLs / the last QOL follow-up, **not** client lifecycle. Do NOT map col Y to `Client.status`; it belongs to the deprioritized QOL module (Q5). Lifecycle enum stands on its own (Inquiry → Pending Admit → Active → Discharged, per README locked decisions).
4. ✅ **Discharge workflow — RESOLVED via doc 08** (Admin Discharges) + user answers 2026-07-02: DC status definitions, chase-up ownership, and reversal behavior are all recorded there.
5. ✅ **QOL — RESOLVED 2026-07-02 (user), deprioritized:** QOL = quality of life interview; at admit, monthly during treatment, at exit; the 7/30/60/90 are **predefined target dates since enrollment**, plus one 30-day **post-DC** follow-up. **User: building QOL functionality is not a priority right now.**
6. ✅ **RESOLVED 2026-07-02 (user):** Case Mgt Needs = **free text**. UA Needs = **build a selector from the options observed in the sheet**, able to assign UAs and track completion dates (full UA spec in doc 01 Q11).
7. ✅ **Est. Discharge Date — RESOLVED 2026-07-02 (user):** app should **predict** the DC date from the client's enrollment length: default **85 treatment days**, minimum **30**, computed onto the calendar (honoring days/week enrolled) + an **optional note** field. No free-text "TBD".
8. ✅ **RESOLVED 2026-07-02 (user):** IND-only and DOP/EOP-only clients live **in this workbook** too.
