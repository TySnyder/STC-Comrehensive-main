# STC Operations Portal

## What This Is

STC Operations Portal is a React-based internal admin dashboard for the Office Manager and eventually all staff at Solutions Treatment Center, a behavioral health facility. It centralizes daily operational tasks: attendance tracking, census, client facesheets, daily reminders, call tracking, and eventually admissions and authorizations. It runs alongside the existing Google Apps Script v4 dashboard (which handles email parsing, calendar integration, and other helpers) — this app is not replacing v4 but expanding into workflows v4 doesn't cover well.

## Core Value

The Office Manager can complete every daily clinical operations task — attendance, census, client status — in one place, faster than the current spreadsheet/GAS workflow, without switching tools.

## Requirements

### Validated

- ✓ Navigation shell with sidebar and view routing — existing
- ✓ Client list view with program filters (DIOP/DOP/EIOP/EOP/IND) — existing
- ✓ Attendance roster with Present/Absent/Tardy/Virtual toggles per client — existing
- ✓ AttendanceEntry model (date, status, tardy, virtual, note) — existing
- ✓ Mock data layer (src/data.ts) with realistic client/attendance seed data — existing

### Active

- [ ] Supabase backend replaces mock data layer (dev phase, pre-PHI)
- [ ] Auth: single user login to start, role-based scaffold for staff expansion
- [ ] Two-block attendance roster: DIOP/DOP (11:45+1:45) and EIOP/EOP (3:45+5:45) as separate sections
- [ ] Attendance entry extended: At Primary Residence, Excused/Unexcused, clinical Note, Attendance Notes fields
- [ ] Running attendance totals per client toward 85-day graduation target
- [ ] Daily present/absent/tardy/virtual/excused counts per time block
- [ ] IND section on daily roster (manual add, calendar-sourced)
- [ ] Weekly census grid with symbol codes (1/0/L/E/U/T/P/D), multi-location (SF + ABQ)
- [ ] Full client facesheet: admit date, program, insurance, therapist, 85-day progress, discharge
- [ ] Daily Reminders panel: IND confirmation calls, client/therapist/phone/status
- [ ] Call tracking: intake call log shared with intake staff
- [ ] Staff expansion: multi-user auth with role-based access (admin/therapist/intake/supervisor)
- [ ] Firestore migration + Google Cloud BAA signed when real PHI goes live
- [ ] Admissions and authorizations modules (last)
- [ ] **Client lifecycle navigation**: move efficiently across pending admits → current → discharged in one place; one client record for life with a status field (never copy/move rows); discharged records retained and searchable (~10 yrs of history per Contact Sheet)
- [ ] Pending-admit pipeline (from Call Tracking "Pending Admit FCs"): checklist per prospective client — BPS scheduled, insurance verified, APW, financial contract, therapist assigned — converting to Active on first day
- [ ] Discharge workflow: actual DC date, row "moves" via status change, final audit/QOL-DC steps (spec in `.planning/spreadsheets/02-running-attendance.md`)

### Out of Scope

- Auto-parsing therapist email attendance reports — too unstandardized; admin reviews manually
- Replacing the v4 GAS app — it continues to handle email parsing, calendar integration, EOS reports
- Real-time collaborative editing — single user initially, not needed in v1
- Mobile app — web-first, internal staff use only
- Video/telehealth integration — handled outside this portal
- Billing/claims — separate system entirely

## Context

**Facility:** Solutions Treatment Center (STC) — behavioral health, two locations: Santa Fe (SF) + Albuquerque (ABQ).

**BestNotes is the clinical EHR of record.** This portal is the administrative/operations layer — it must not become the clinical record, but it can support BestNotes workflows (cross-checking census vs EHR, prompting what needs entry there). Spreadsheet→app field mapping lives in `.planning/spreadsheets/` (docs 01–06 + README traceability table).

**Programs:**
| Program | Time | Days | Blocks |
|---------|------|------|--------|
| DIOP (Day IOP) | 11:45 AM – 1:30 PM | Mon–Fri | 1st block only |
| DOP (Day OP) | 1:45 PM – 3:00 PM | Mon–Fri | 2nd block (also DIOP clients) |
| EIOP (Evening IOP) | 3:45 PM – 5:30 PM | Mon–Fri | 3rd block only |
| EOP (Evening OP) | 5:45 PM – 7:00 PM | Mon–Fri | 4th block (also EIOP clients) |
| IND | Varies | Once/week | Separate section |

**Two-block rule:** DIOP clients attend BOTH the 11:45 and 1:45 blocks (two independent attendance records per day). EIOP clients attend BOTH the 3:45 and 5:45 blocks. DOP and EOP clients attend only their single block.

**Attendance workflow:** Therapists email attendance reports daily (not standardized). Office Manager reviews each email and manually enters data in the portal. No auto-parsing.

**Graduation target:** 85 TX days required. Running totals tracked per client.

**Attendance fields (from live spreadsheets):**
- Present / Absent (binary)
- Tardy (Y/N)
- Virtual / In-Person
- At Primary Residence (Y/N) — separate from virtual
- Excused / Unexcused (when absent)
- Note (clinical template text)
- Attendance Notes (client-specific notes)
- Program at time of entry (label each record)

**Live data reference:** `/live data/` — contains real spreadsheets: client list (DIOP/EIOP sheets), master attendance templates, census weekly grids, staff schedule, call tracking. Use for field names and data model decisions, not for seeding real PHI into dev.

**v4 GAS app:** Lives at `/Users/ts/github-sites/stc_dashboard_v4`. 26,000 lines. Handles: calendar parsing, daily reminders, progress notes, group schedule, project management, EOS reports, discharge forms, check-in emails. Continues running in parallel. Port business logic from here rather than redesigning.

**HIPAA path:**
- Phase 0 (now): Supabase free tier — realistic fake data, no real PHI
- When ready for real clients: port data layer to Firebase/Firestore, sign Google Cloud BAA (free)
- No PHI in localStorage, sessionStorage, or client-side state
- Audit logging required before real PHI

## Constraints

- **Stack**: React 19 + Vite + TypeScript + Tailwind v4 + lucide-react — locked, do not change
- **HIPAA**: No real PHI until Firestore migration + BAA are complete
- **Minimal new code**: Port v4 logic wherever possible; do not redesign what already works
- **Clarification first**: Never make assumptions on design, field behavior, or workflow — always ask
- **Dev port**: 3004 (3000–3003 in use on this machine)
- **No auto email parsing**: Attendance is manual entry only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase free tier for dev | Fastest DX, free, TypeScript-native, good auth/RLS | — Pending |
| Firebase/Firestore for PHI phase | Already in Google Workspace with BAA relationship; BAA free on Blaze | — Pending |
| Two-block attendance model | DIOP/EIOP clients need independent records per block per day | — Pending |
| Auth roles designed from day 1 | App will expand from 1 user to whole staff; avoid rework later | — Pending |
| GSD discuss-phase before plan-phase | Guided questions per phase to lock decisions before planning | — Pending |
| Never assume — always clarify | Office Manager explicitly requested; decisions have real operational consequences | ✓ |

---
*Last updated: 2026-06-29 after initialization*
