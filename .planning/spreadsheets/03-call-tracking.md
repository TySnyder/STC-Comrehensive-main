# 03 — 2026 Solutions Call Tracking Pending Admits.xlsx

**The front door.** Intake calls, the pending-admit pipeline, client call-outs, and
outreach/marketing. None of this exists in the app yet — and it's the first stage of
the client lifecycle (Inquiry → Pending Admit → Active).

---

## Sheet type A: Monthly call log (one sheet per month)

| Field | Notes |
|-------|-------|
| Date / Time | of call |
| Intake Specialist | staff taking the call |
| Caller | name |
| Relationship | caller's relationship to prospective client |
| Caller Phone / Email | |
| Client Name / Phone / Email | prospective client |
| Location | SF / ABQ |
| Referral Source | (marketing-relevant) |
| Therapist / Prescriber | referring provider |
| Insurance | |
| Issues / Notes | |
| Clinician Notes | |

Color-coding conventions mark follow-up state by program/location — in the app this
should become an explicit **follow-up status field**, not color.

## Sheet type B: "Pending Admit FCs"

The onboarding pipeline — each row a client working toward first day.

| Field | Notes |
|-------|-------|
| Intake | intake specialist |
| City | SF/ABQ |
| Client | name |
| BPS Scheduled | biopsychosocial assessment date |
| Insurance | verification state |
| Est First Day | |
| APW Date | ⚠️ confirm meaning (Admission PaperWork?) |
| Therapist Assignment | |
| UA Needs | carries into Running Attendance col O |
| Notes | |
| FC in Folder | financial contract filed? |
| Financial Contract | status |

This is a **checklist per pending client** — ideal app shape: pending-admit record
with completable steps (BPS, APW, insurance verified, FC signed, therapist assigned),
converting to Active on first day.

## Sheet type C: "SFABQ CALL OUTS"

Clients calling out of group — feeds excused/unexcused census marks.

| Field |
|-------|
| Client · Time · Date · Group · Reason · Virtual location · Intake Specialist · Excused/Unexcused |

⚠️ Workflow link: a call-out recorded here must end up as E/U (or R/N virtual) on the
census. In the app, logging a call-out could **auto-suggest the census entry** — big
double-entry win.

## Sheet type D: "OutreachMarketing"

Referral-source outreach tracking. Lower priority; confirm scope.

## App status
**Entire workbook unmapped.** No call log, pending-admit pipeline, call-out log, or
outreach module exists in app or PROJECT.md.

## Open questions
1. What does **APW** stand for, and what are the required steps before first day (the definitive onboarding checklist)?
2. What are the color-coding rules on the call log (each color's meaning)?
3. Should a call-out entry auto-create/suggest the census E/U mark, or stay a separate log?
4. When does a caller become a "pending admit" — is there a conversion moment (BPS scheduled?), and who decides?
5. Do intake calls contain PHI that shouldn't live in this app pre-BAA? (Prospective clients are still PHI once health info is attached.)
6. Is OutreachMarketing in scope for the app at all?
7. Retention: how long are call logs kept, and are old monthly sheets ever purged?
