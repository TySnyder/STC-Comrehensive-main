# 08 — Admin Discharges Tracking 2026.xlsx

**The discharge workflow checklist** — exactly the missing piece behind doc 02's
"what happens at discharge" question. One sheet per year (2026, 2025, 2024, 2023),
one row per discharged client.

## Columns (2025/2026 format)

| Field | Notes / App mapping |
|-------|---------------------|
| Name | client link |
| Admit Date | already on Client |
| IOP DC Date | date client left IOP level of care |
| STC DC Date | date fully discharged from STC (can be months later — step-down) |
| DC Status | enum observed: `Approved`, `ASA` (against staff advice), `Admin DC`, and combos (`ASA/Admin DC`, `Approved/Admin`) |
| Grad (Yes/No) | graduated program |
| Grad Cert Sent (in BN) | date or N/A |
| Exit Interview Sent / Return Date | dates or N/A, "Unreceived MM/DD/YY" |
| DC Form Sent / DC Returned Date (in BN) | dates; "Unreceived …" = chased but not back |
| Primary Therapist | |
| Notes | follow-up call log ("LVM", "emailed", etc.) |

2023 format adds: DC Note, DC Summary, Aftercare Plan date columns.

## Key model insights

- **Two discharge dates** (IOP DC vs STC DC) confirms level-of-care step-down:
  a client can leave IOP but remain at STC (OP/IND) before final discharge. The
  lifecycle `Active → Discharged` needs a per-level-of-care dimension, not just
  one status flip.
- **DC Status enum** partially answers doc 02 Q3: at minimum
  `Approved | ASA | Admin DC` (+ combinations — model as multi-select or primary+secondary).
- The Sent/Returned pairs are a **checklist with chase-up states**
  (`sent → returned | unreceived-as-of-date`) — the app's discharge workflow should
  generate these tasks and track outstanding paperwork.

## App mapping

Extends the Client lifecycle (doc 02). Discharge event: `{iopDcDate, stcDcDate,
dcStatus[], graduated, gradCertSentAt, exitInterviewSentAt/returnedAt,
dcFormSentAt/returnedAt, notes}` + reminder list for unreceived items.

## Open questions

1. ✅ **DC status definitions — RESOLVED 2026-07-02 (user):**
   - **Approved / With Staff Approval** — planned or clinically appropriate discharge approved by treatment staff.
   - **ASA (Against Staff Advice)** — client chose to leave/stop treatment despite staff recommendation to continue.
   - **Admin DC (Administrative Discharge)** — program-initiated: attendance, policy, compliance, safety, authorization, or other administrative reason.
   - **More than one status can apply** → model as multi-select (confirms combo values observed).
2. ✅ **RESOLVED 2026-07-02 (user):** the office manager + assistant chase exit interviews / DC forms; give up **one month after discharge**.
3. ✅ **RESOLVED 2026-07-02 (user):** on discharge reversal the row **gets deleted** from this tracker. App: reversal should void/remove the discharge event (consider soft-delete for audit trail — app design choice, not a spreadsheet behavior to copy).
4. ✅ **RESOLVED 2026-07-02 (user, "pretty sure"):** DC Note / DC Summary / Aftercare Plan are handled **in BestNotes** by intake staff and therapists.
