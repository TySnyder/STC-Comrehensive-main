# HANDOFF — director
**Updated:** 2026-08-15
**App:** STC Operations Portal — internal behavioral health clinical-ops portal for admin staff (no consumer surface). React 19 / Vite / TS / Tailwind v4.
**Commands:** `npm run dev` (port 3004; 3000–3003 in use on this machine) · gate: `tsc --noEmit` · tests: vitest (80 passing) · `npm run build`
**Key docs:** `PRODUCT.md`, `DESIGN.md`, `.planning/PROJECT.md`, `.planning/spreadsheets/README.md` (open-questions workflow), `.planning/codebase/`

---

## Current state

- Clean-code refactor + all spreadsheet-mapping build targets: **committed** (`8f0d116`, `402456e`). Handoff system migrated to root director/archive format (`d85612c`).
- **Task Track view built and committed** (`285985d`): new nav page — ticker bar, tabbed Daily Reminders/UA panel (real `IndSession`/`UaAssignment` data, functional call-result dropdown), Groups Today, Ongoing/Completed↔Upcoming tasks, right-rail Timeline↔Google Calendar toggle. `src/components/TaskTrackView.tsx`.
- **Uncommitted, working, ready to commit:**
  - Nav order swapped back: Dashboard first, Task Track second (`Sidebar.tsx`).
  - **Google Calendar OAuth is live and confirmed working** (real user sign-in tested end to end). Read-only, Google Identity Services token client, no backend. `src/utils/googleCalendar.ts`, Client ID in `.env` (gitignored) as `VITE_GOOGLE_CLIENT_ID`. Authorized JS origin `http://localhost:3004` registered on the OAuth client in Google Cloud Console (client name "STC Dashboard", id `600351493590-...`).
  - **Global Email Delivery Mode** (`draft` | `send`, default `draft`) — `EmailDeliveryMode` type in `types.ts`, state lifted to `App.tsx` (`useLocalStorageState('stc-email-delivery-mode', ...)`), toggle UI in Settings → Clinical Workflows. Task Track's two email stub buttons (`handleSendDailyReminders`, `handleGenerateEmails`) already branch on it — actual send/draft dispatch (Gmail API) is still a `TODO`, not implemented.
  - **Email signature** — `DEFAULT_EMAIL_SIGNATURE` in `data.ts` (Tyler's real signature, not PHI — office contact info), persisted via `stc-email-signature`, editable textarea + live preview in Settings → Clinical Workflows.
  - Header: Fingerprint clock-in icon added next to the bell (local toggle only, not wired to any attendance data yet); `header-controls` gap halved (`gap-6`→`gap-3`) per user request.
- Gate is green on all of the above (`tsc --noEmit` clean, verified via Playwright smoke checks in scratchpad, not committed to repo).

## Next steps

1. **Commit the uncommitted work above** — nothing risky in it, just needs a commit message pass.
2. **Big decision made, not started: Google Sheets + Apps Script backend.** Scoped with the user, deliberately deferred (their words: "we can wait to go to GAS"):
   - New Apps Script Web App = new HTTP API layer for this React app (NOT extending the existing `stc_dashboard_v4` GAS project — that stays separate).
   - Backs onto a **brand-new Google Sheet**, not any live clinic operational sheet.
   - Scope: **full migration** — clients, staff, census, attendance, everything currently in `INITIAL_*` seed data / localStorage moves to this backend, not just Task Track/UA.
   - User already has `clasp` installed and logged in, ready to scaffold a new Apps Script project when we resume.
   - This is the real answer to every `TODO(PHI)` comment in the code (UA assignments off localStorage, etc.) — when this lands, revisit those comments.
   - **Not started at all** — no Apps Script project created, no API contract designed, no client-side fetch layer written. Whoever picks this up next should treat it as a fresh design task: figure out the Sheet schema, the Apps Script endpoints, auth model (who can call it), and a migration path off `useLocalStorageState`/seed data per view — don't assume anything from this bullet list beyond the three decisions above.

## Open items (older, still unresolved)

Small (from spreadsheet-mapping Q&A, see archive / `.planning/spreadsheets/`):

1. Facesheet: derived from census or manually curated beyond Notes/Payment? (doc 01 Q9)
2. UA initials as audit-grade user attribution — low priority (doc 01 Q12)
3. Verify "I believe / pretty sure" answers against live sheets when building (doc 01 Q10, doc 07 Q4, doc 08 Q4)

Deferred cleanups (optional): SettingsView import-wizard flag state → discriminated union; SettingsView tab panels → separate components.

Standing `TODO(PHI)`: UA assignments etc. must move off localStorage before live data — see Google Sheets/Apps Script plan above.
