# 09 — Group Schedule (Word doc, e.g. "Group Schedule Week of Updated 6_29-7_3_26.docx")

**The weekly program schedule**, made by the owner in Word — currently weekly
(therapist shortage), normally monthly. Per program track (DIOP shown), a
Time × Weekday grid; each cell = group name, modality tags (CBT/Psychoeducation/
Process), facilitator + location (e.g. "Sarah (SF)", "Robert (ABQ)").

Observed structure (DIOP): 11:45–12:00 sign-in → 12:00–12:10 opening
meditation/grounding → 12:10–1:30 main group (theme varies by day: check-in,
experiential, emotional process, shame reduction, relapse prevention) → (further
blocks not yet parsed).

## Program structure (from user, 2026-07-02)

- Full program = **85 weekdays = 17 weeks**
- **17 weekly themes**, one explored per week — the curriculum is a 17-week cycle

## App mapping

**Confirmed direction (2026-07-02, user):** extend the existing **Program Schedule
Builder** (already supports drag-and-drop of therapists into time slots and warns
when a therapist is assigned on a requested day off). Make it more comprehensive:
track the **17 themes** and show **which theme week is current**. Theme week is
**facility-wide** (single calendar position in the 17-week cycle — clients admit
rolling and join wherever the cycle is), so it derives from the calendar, not
per-client attendance.

## Theme tracker decisions (locked 2026-07-03, user)

- **Cycle order (canonical, weeks 1–17):** Personal Goals · Identity · Family of
  Origin · Inner Child · Self Destruction & Escape · Health & Wellness ·
  Relationships · Boundaries · Communication Skills · Shadow Self · Work &
  Finance · Grief & Loss · Life Changes & Transitions · Mind/Body Connection ·
  Forgiveness & Amends · Transformation & Acceptance · Meaning & Purpose.
  Note: differs from the docx ordering — user's order puts Self Destruction &
  Escape *before* Health & Wellness. (User's first list omitted Identity;
  confirmed it slots at week 2.)
- **Anchoring:** set current theme in-app (dropdown in Schedule view); anchor
  `{ mondayIso, themeWeek }` persisted to localStorage (`stc-theme-anchor`);
  all other weeks derived by mod-17 arithmetic. Re-settable anytime.
- **Content:** theme names + full descriptions + clinical-techniques text
  embedded in `src/themes.ts` (curriculum copy, no PHI).

**Built 2026-07-03:** `src/themes.ts`, `src/utils/themeHelpers.ts` (+tests),
ScheduleView theme banner (week N of 17, cycle strip, set-theme control,
detail modal).

## Open questions

1. ✅ **RESOLVED 2026-07-02 (user):** themes are documented in
   `live data/Master The Solutions Method® Theme Descriptions 02_12_26.docx`
   (never committed — parse when building the theme tracker). Current theme week
   is **facility-wide**; a client admits and starts wherever the current theme is.
2. ✅ **RESOLVED:** MIOP = morning IOP, a discontinued third daily program. The
   Word schedule doc contains schedules for **both DIOP and EIOP**.
3. ✅ **RESOLVED:** yes — user wants the in-app schedule builder, extended with
   theme tracking (see App mapping above).
