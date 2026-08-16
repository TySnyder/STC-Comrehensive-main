# HANDOFF — director
**Updated:** 2026-08-16
**App:** STC Operations Portal — internal behavioral health clinical-ops portal for admin staff (no consumer surface). React 19 / Vite / TS / Tailwind v4.
**Commands:** `npm run dev` (port varies — 3000-3004 often taken; check console output) · gate: `tsc --noEmit` · tests: `npm run test` (vitest, 80 passing) · `npm run build`
**Key docs:** `PRODUCT.md`, `DESIGN.md`, `.planning/PROJECT.md`, `.planning/spreadsheets/README.md` (open-questions workflow), `.planning/codebase/`

---

## Current state

Working tree clean, `origin/master` and Vercel production are both current as of `443d100` — pushed
and deployed successfully this session (the permission-classifier blocks from earlier were transient;
retries worked). Full detail (Vercel deploy, real-PHI stopgap, Firebase provisioning, 4-agent sprint
merge, Virtual Requests feature, the test-count bug, this session's browser test pass) is in
`HANDOFF-COMPLETED.md` — search with `rg`, don't read wholesale.

**Browser-tested live on production via ego-browser this session — login, Attendance (two-block
roster, at-residence toggle confirmed interactive), Call Tracking, Virtual Requests, Settings
(Email Delivery Mode master switch survived its merge correctly), and Clients' TX-day/graduation-track
display (`4/30` and `6/85` both confirmed rendering) all work.** One real bug found — see below.

**BUG — Google Calendar OAuth `origin_mismatch`, blocks 2 features:** clicking "Connect Calendar" (IND
roster) or "Look up from Google Calendar" (Virtual Requests) hangs forever on "Connecting…" with no
error shown. Root cause confirmed via direct reproduction: OAuth client
`600351493590-...apps.googleusercontent.com` (GCP project `stc-main-dashboard`) doesn't have the
current origin registered — reproduced on both `http://localhost:3001` and (untested but same client)
`https://stc-comprehensive.vercel.app`. Fix: **Google Cloud Console → this project →
console.cloud.google.com/auth/audience → Authorized JavaScript origins → add
`https://stc-comprehensive.vercel.app` and `http://localhost:3000` through `3004`** (dev port varies).
Separate, smaller app-bug on top: the UI has no error/timeout state for a failed token request — even
after the origin is fixed, a future failure will still hang silently. Worth adding an error branch to
whatever hook wraps `google.accounts.oauth2.initTokenClient` in `googleCalendar.ts`.

**No real PHI policy:** confirmed with the user — this app runs entirely on demo/mock data until a
real auth + Firestore/BAA path exists. Do not wire any view to `stc-backend`'s real client-contact
endpoints (`dailyReminderRecipients`, `tomorrowsAppointments`) in a way that's reachable from a public
deployment.

## stc-backend (Apps Script Web App) — status

Unchanged this session. Walking skeleton (UA assignments) + Daily Reminders send are proven
end-to-end against real data in dev — see `HANDOFF-COMPLETED.md` for the full story. Still deployed
anonymous ("Anyone, even anonymous"); auth model still undecided. The live Vercel site no longer
points at it (see above), but local dev (`.env`'s `VITE_UA_API_URL`) still does.

## Firebase — provisioned, not wired

Project `stc-operations-portal` exists with Firestore (`nam5`, closed rules) and a registered web
app. SDK config is in local `.env` as `VITE_FIREBASE_*`. **No app code references it yet** — this is
infrastructure only. `.env.example` doesn't document these vars yet either (nothing consumes them, so
nothing to document until real wiring starts).

## Exact next action

1. **Fix the OAuth origin_mismatch bug** (see above) — add the missing Authorized JavaScript origins
   in Google Cloud Console, then re-test "Connect Calendar" / "Look up from Google Calendar" for real.
2. Decide the open questions listed in `HANDOFF-COMPLETED.md`'s "Open questions surfaced by agents"
   section (role-permission matrix, at-residence-vs-virtual semantics, where staff sets a client's
   30/85-day track, call-log follow-up-status meanings) — none were guessed, all need a human answer
   before the affected features are considered finished rather than scaffolded.

## Open items (older, still unresolved)

Small (from spreadsheet-mapping Q&A, see archive / `.planning/spreadsheets/`):

1. Facesheet: derived from census or manually curated beyond Notes/Payment? (doc 01 Q9)
2. UA initials as audit-grade user attribution — low priority (doc 01 Q12)
3. Verify "I believe / pretty sure" answers against live sheets when building (doc 01 Q10, doc 07 Q4, doc 08 Q4) — **on hold**, no real PHI is being touched right now per the policy above.

**Deferred, not started:** bringing the `stc_dashboard_v4` Attendance Audit (5-phase,
Census/Running Attendance reconciliation, immutable snapshots) into this app's Weekly Census page.
User said "nothing for now" when offered three approaches — revisit by asking again, don't assume
which approach.

Standing `TODO(PHI)`: reinforced this session, not just a UA-assignments note anymore — see "No real
PHI policy" above.
