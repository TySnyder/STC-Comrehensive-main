# 05 — _STC Client Contact Sheet 2026.xlsx

**Client demographics + contact record, kept for a decade.** 35 sheets organized by
year (2016–2026) / program / location, each split into **Current** and **Discharged**
sections. This is the record-retention archive — second pillar of the client
lifecycle requirement (records must survive discharge, for ~10 years).

---

## Columns (per sheet)

| Field | App mapping |
|-------|-------------|
| Name | `Client.name` ✅ |
| Admit Date | `Client.admissionDate` ✅ |
| Cell Phone | ⚠️ app has single `phone` — sheet has two |
| Home Phone | ⚠️ missing |
| Email | ✅ |
| Emergency Contact Name | ⚠️ **missing** |
| Emergency Contact Phone | ⚠️ **missing** |
| Emergency Contact Relationship | ⚠️ **missing** |
| Emergency Contact Permissions | ⚠️ **missing** — release-of-information consent (compliance-critical) |
| Home Address | ⚠️ missing |
| Teleconf. Consent | ⚠️ **missing** — required before telehealth (R/N census codes) is legitimate |
| IND Therapist | ⚠️ app has one `primaryTherapist`; IND therapist may differ |
| NOTES | ✅ notes |

## Structural implication: the archive

Ten years of sheets, Current + Discharged per program/location/year, means in the app:
- One client record for life; `status` moves Current↔Discharged; **nothing deleted**
- Search must span discharged clients (readmissions are common in treatment — confirm)
- Year/program/location become filters on one table, not separate silos

## Open questions
1. **Readmissions** — when a discharged client returns, is a new row created or the old one reused? App-side: new "episode of care" linked to same person, or one record with multiple admit/DC date pairs?
2. Emergency Contact **Permissions** — what values are recorded (verbal OK / signed ROI / none)? Should the app block showing EC info without permission recorded?
3. Teleconf Consent — is it a dated signed form? Should the app warn when marking R/N census codes for a client with no consent on file?
4. What is the required record-retention period (state/payer rule)? Does anything ever get destroyed?
5. Who maintains this sheet vs BestNotes — is BestNotes already the authoritative source for demographics, making this a convenience copy? If so, should the app hold contact data at all, or lean on BestNotes?
