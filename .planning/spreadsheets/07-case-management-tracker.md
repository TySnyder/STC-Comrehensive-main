# 07 — 2026 STC Case Management Tracker.xlsx

**Per-day service-contact log.** One sheet per month (Dec 2025 → July) + `Ref Key`
+ `Master`. Each month is a wide grid: date columns across (126 cols), client
blocks down. Per client per date, two stacked entry rows:

- **Clinical row** (blue boxes, black font): Provider Initials / Type of service / Total time in minutes / Clinical Notes
- **Intake/Admin row** (white boxes): Intake Initials / Type of service / Total time / Intake Notes
- Font color = BestNotes note state: **red = note created but NOT signed, green = signed**

Client block also carries insurance type (e.g. "BCBS Turquoise Care").

## Service type codes (Ref Key tab)

| Code | Meaning |
|------|---------|
| CM-F / CM-T / CM-E | Check-in: face-to-face / telephone / email-text (wellness, life skills, scheduling, family comms) |
| CRM | Crisis management |
| POR (90889, commercial only) | Preparation of report — comms with outside informants (referring therapist, MD, PO, disability, attorney, EAP/FMLA) |
| PRE-T / PRE-F | Pre-admissions data (phone / face-to-face) |
| APW-F / APW-T | Admissions paperwork (consents, contacts, financial contract, etc.) |
| QOL-F / QOL-T | Quality of Life check-in — **cadence: at admit, 30 days in, every 30 days during TX; post-DC at 7, 30, 60, 90 days** |
| OTH | Other (staffing reports, TX plan revision w/o client, re-assessments, DC paperwork) |
| CCOT (99492) | Case consultation w/ outside provider (not EAP/probation) |
| INQ | Inquiry / demographics |
| PRE | Pre-admissions data assessment |

Note: ✅ **QOL cadence reconciled 2026-07-02 (user):** QOL interview at admit,
monthly during treatment, and at exit. The 7/30/60/90 are **predefined target
dates since enrollment** (not post-DC), plus one **30-day post-DC** follow-up.
**QOL functionality is not a build priority right now.**

Color reporting key (Ref Key, confirmed via screenshot 2026-07-02): blue lines =
Clinical Team (black font); white lines = Intake/Admin (red font = note created
but NOT signed in BestNotes, green font = signed); **dark mauve cell flood =
reviewed by billing, billable**.

## App mapping

**Missing module.** Natural shape: a per-client service-contact log —
`{date, team: clinical|intake, staffInitials, serviceType, minutes, note, bnNoteSigned}`.
This directly supports BestNotes cross-checking (red/green = entered-but-unsigned vs
signed in BN). CPT-ish codes (90889, 99492) suggest billing relevance.

## Open questions

1. ✅ **RESOLVED 2026-07-02 (user):** used by **anyone providing a case-management service** (billing-relevant) — QOLs, UAs, inquiries, admissions paperwork; mostly intake staff; the office manager logs UAs they perform here too. Also tracks whether notes are signed in BestNotes. **Not needed in v1.**
2. ✅ **RESOLVED:** `Master` is a **template**.
3. **Deferred:** QOL scheduling is not a priority right now (user 2026-07-02). When built, unify with Running Attendance cols P–V.
4. ✅ **RESOLVED 2026-07-02 (user, "I believe"):** minutes are used for **billing**.
