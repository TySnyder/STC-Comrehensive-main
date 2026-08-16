# HANDOFF — director
**Updated:** 2026-08-16
**App:** STC Operations Portal — internal behavioral health clinical-ops portal for admin staff (no consumer surface). React 19 / Vite / TS / Tailwind v4.
**Commands:** `npm run dev` (port varies — 3000-3004 often taken; check console output) · gate: `tsc --noEmit` · tests: `npm run test` (vitest, 80 passing) · `npm run build`
**Key docs:** `PRODUCT.md`, `DESIGN.md`, `.planning/PROJECT.md`, `.planning/spreadsheets/README.md` (open-questions workflow), `.planning/codebase/`

---

## Current state

Working tree clean, all merged through `6a01e6d` on local `master`. `origin/master` is at `928a0c2`
(1 commit behind — the Virtual Requests merge hasn't been pushed yet). Full detail of this session
(Vercel deploy, real-PHI stopgap, Firebase provisioning, 4-agent sprint merge, Virtual Requests
feature, the test-count bug) is in `HANDOFF-COMPLETED.md` — search with `rg`, don't read wholesale.

**Site is live but STALE:** https://stc-comprehensive.vercel.app was last deployed *before* this
session's 4-agent sprint merged — it does not have login, attendance overhaul, call tracking, virtual
requests, or the settings refactor. It also has no `VITE_UA_API_URL` (deliberately removed — no real
PHI on the live site, everything runs on demo data). Local `master` has all of it.

**Vercel redeploy is BLOCKED, not just pending:** `vercel deploy --prod --yes` was denied twice this
session by the local permission classifier (same for `git push` earlier, which succeeded on a manual
retry). Don't assume a plain retry will work — the user needs to either approve it again or run
`vercel deploy --prod --yes` themselves. `git push origin master` has the same risk; it worked once
via retry but isn't guaranteed to next time.

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

1. **User: manually test the app** — run `npm run dev`, open it in a browser, and click through:
   login (demo accounts + shared password `demo`, from the dropdown), Attendance (two-block roster,
   at-residence toggle, TX-day totals), Call Tracking (new sidebar tab), Virtual Requests (new sidebar
   tab — log a request, verify the calendar-event lookup / manual-link fallback), Settings (all 4
   tabs still work post-refactor, especially the Email Delivery Mode master switch). Only
   curl-smoke-tested this session — no browser click-through happened, no browser tool was available.
2. `git push origin master` (1 commit behind, `6a01e6d`), then `vercel deploy --prod --yes` — both
   got blocked by the permission classifier at least once this session; don't assume either just
   works, confirm each succeeded before treating the site as updated.
3. Decide the open questions listed in `HANDOFF-COMPLETED.md`'s "Open questions surfaced by agents"
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
