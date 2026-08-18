---
name: stc-daily-rundown
description: Generate STC daily rundown from live Google Calendar/Gmail.
license: "MIT"
metadata:
  category: productivity
  version: "1.1.0"
  author: "Tyler Snyder"
  hermes:
    tags: ["stc", "daily-rundown", "google-workspace", "calendar", "gmail"]
    related_skills: ["google-workspace", "daily-rundown"]
---

## When to Use

- User asks for "daily rundown", "STC rundown", "today's rundown", "Monday rundown", etc.
- Any request for a same-day or named-day operational summary for Solutions Treatment Center (STC).
- The skill re-discovers from live mail/calendar every run — no cached state.

# STC Daily Rundown Skill

**Trigger**: User asks for "daily rundown", "STC rundown", "today's rundown", or similar for Solutions Treatment Center.

**Behavior**: Search Google Calendar and Gmail as if seeing the mailbox for the first time. Produce a same-day (or named-day) rundown with priority actions, event timeline, and combined chronological list. Read-only — never send, reply, draft, or forward.

---

## 1. Prerequisites & Setup

### 1.1 Confirm Connections

- **Calendar**: If connected, list events for target date. If missing, note "Calendar not connected" and build times from email only.
- **Gmail**: **Required**. If missing, stop and ask user to connect it.
- **Timezone**: User's local zone (America/Denver unless mailbox indicates otherwise).

### 1.2 Identify Target Date

- Named day (e.g., "Monday", "tomorrow", "August 18") → resolve to date.
- Default: next workday (Mon–Fri).
- All searches use this date in America/Denver.

### 1.3 Detect Run Type (Initial vs Update)

Check the current time in America/Denver:

- **2:00 PM or later → Initial Run** (the evening job). This is the first
  send for the target date — proceed normally, deliver per 7.2.
- **Before 2:00 PM → Update Run** (the morning job). Re-gather fresh per
  section 2, fold anything new into one current rundown, and deliver per 7.3
  (reply in the same email thread as the Initial Run, not a new one).

**Manual override, for testing:** if the user explicitly asks to test or
simulate a specific run — e.g. "test the morning/update run", "run this as
if it's 10am", "simulate the evening/initial run" — skip the clock check and
use whichever run type they named. Everything else about that run (7.2 or
7.3, including gathering live and searching for a real thread to reply into)
still runs for real; only the time-of-day decision is overridden.

---

## 2. Search Strategy (Every Run, Fresh)

### 2.1 Calendar First (if connected)

- List all events for target date.
- Treat calendar events as **timed facts**.

### 2.2 Gmail Searches (in order, using search queries not hunches)

1. **Unread & recent inbox** (~last 4 days + anything dated for target day)
2. **Date-named mail**: Subject/body contains target date, "Daily Reminder", group schedule for that week, SOS/EOS from previous business day, time-off/out-early, UA needs for that week, virtual links for that week, census/other unsent drafts
3. **Tyler-named mail**: Subject/body/from/to contains "Tyler" or "Tyler Snyder" (catches emails sent to/from user, tasks assigned to user)
4. **Starred/important recent** that still looks open

### 2.3 Thread Resolution

- Open a thread before treating something as an open task.
- If user already answered → drop it or keep only a later leftover ask.
- **Never relist a closed question**.

### 2.4 Ignore List

- Security alerts
- Product welcome emails
- Marketing/promotional mail

### 2.5 Pattern Learning (per run)

- Learn who sends Daily Reminder
- Learn where group times live
- Learn where next-day items appear in clock-out mail
- **Use patterns found THIS run only**. Do not hard-code prior findings.

---

## 3. Classification & Priority

| Type | Definition | Priority |
|------|------------|----------|
| **Timed Event** | Has clock time (calendar event, Daily Reminder appt, group, scheduled call) | Goes on Timeline |
| **Actionable Item** | User expected to do it (calls, drafts, pings, schedules to print, links to send, tabs to update) | P1/P2/P3 |

### Priority Rules

- **P1**: User must do it, OR confirmed appointment they run
- **P2**: Happens that day (groups, other staff appointments, coverage) OR standard opener for role
- **P3 / Background**: Upcoming later this week, someone else's lane, unread mail not day-critical

### Time Rules

- **Never invent a time**.
- If inferring group time from last same weekday → label **"inferred"**.
- If source missing (no UA list, calendar disconnected, schedule doc unreadable) → note at end.

---

## 4. Output Format (In This Order)

### 4.1 Source Line

Short line: what searched, Calendar connected?, whose mail used.

### 4.2 Priority List (Actionable Items)

P1 items → P2 items → P3 items. No times required.

### 4.3 Timeline (Events Only)

Clock times only, chronological.

### 4.4 Combined Chronological List

Every actionable item + every event on one timeline.

- **Untimed openers** → under **"Open (before first timed item)"**
- Each line: `time (or Open) | priority | who/what | source (few words)`
- End with:
  - **"Background, not timed"** section
  - **"Could not confirm"** line (missing sources)

---

## 5. Style Guidelines

- Use mailbox's own shorthand (subject-line codes, not extra narrative)
- **One list, not a memo**
- No advice beyond the rundown unless something is blocked
- Concise, scannable, actionable

---

## 6. Tool Usage

- `google-workspace` skill for Calendar/Gmail access
- `terminal` for date calculations if needed
- No other external tools required

---

## 7. Output Formats

### 7.1 Full Rundown (Default Format)

Full format with source line, priority list, timeline, combined list with sources, Background section, and Could Not Confirm section. Used for ad-hoc requests — not tied to either scheduled cron run (see 7.2/7.3 for those).

```Source: Calendar ✓, Gmail ✓ (tyler@treatmentconsultants.net), target: Monday 2026-08-17 MDT

P1 — Actionable (must do)
- Print group schedule for week
- Send virtual links for EIOP (Kirsten)
- Confirm UA list for Tuesday

P2 — Day-critical
- DIOP 12:00 (Amy) — inferred from last Monday
- EIOP 4:00 (Tina/ABQ) — calendar
- Daily Reminder 3:00 — email thread

P3 — Background
- Census draft (unsent) — starred draft
- Time-off request (Crystal) — email Wed

Timeline
12:00  DIOP (Amy)
13:30  DIOP/DOP (Kirsten)
15:00  Daily Reminder
16:00  EIOP (Tina/ABQ)
17:30  EIOP/EOP (Kirsten)

Combined
Open  P1  Print group schedule  (starred draft)
Open  P1  Send virtual links    (email thread)
Open  P1  Confirm UA list       (email thread)
12:00 P1  DIOP (Amy)            (calendar, inferred)
13:30 P2  DIOP/DOP (Kirsten)    (calendar)
15:00 P1  Daily Reminder        (email)
16:00 P2  EIOP (Tina/ABQ)       (calendar)
17:30 P2  EIOP/EOP (Kirsten)    (calendar)

Background, not timed
- Census draft (unsent)
- Crystal time-off request

Could not confirm
- UA list for Tuesday (no email found this week)
- Virtual links for Kirsten (no recent thread)
```

### 7.2 Evening Preliminary Rundown (Initial Run)

**Trigger**: User asks for "evening preliminary", "preliminary rundown", or "8pm rundown" — or detected as the Initial Run per 1.3.
**Modifications from standard:**

- **Omit** Source line
- **Omit** "Background, not timed" section
- **Omit** "Could not confirm" section
- **Combined list**: Show only `time | priority | who/what` — no source annotations
- **Deliver via email** to <tyler@treatmentconsultants.net> with subject: `STC Daily Update [Day], [Month] [Date], [Year]`
- **Email body is HTML**, rendered via `scripts/render_email.py` — see section 8.
- **Logo is a hosted URL** — `https://stc-comprehensive.vercel.app/stc-logo-horizontal-v2.webp` (see 8.3). No inline attachment or `--inline-image` flag needed; the HTML `<img src>` points straight at it.
- This is the first email for the target date — followed by the Update Run
  (7.3) the next morning, which replies in this same thread.

```
STC Daily Update Monday, August 17, 2026

P1 — Actionable (must do)
- Print group schedule for week of 8/17-8/21 (Google Doc shared by Amy 8/14)
- Send virtual links for EIOP/EOP 5:30pm (Kirsten)
- Confirm UA list for Tuesday
- Call references for Kristi Dew (Crystal asked to start Monday 8/17)
- QOL with Zainah at 10:30 AM (scheduled from 8/14 EOS)

P2 — Day-critical
- DIOP 12:00 (Amy) — inferred from last Monday
- DIOP/DOP 1:30 (Kirsten) — inferred from last Monday
- Daily Reminder 3:00 (DaSu with Amy SF, AnNi with Tina ABQ) — email from Sean 8/14
- EIOP 4:00 (Tina/ABQ) — inferred from last Monday
- EIOP/EOP 5:30 (Kirsten) — inferred from last Monday

Timeline
08:00  Sean Communications
10:30  QOL with Zainah
10:45  Begin Daily Reminders
12:00  DIOP (Amy)
13:30  DIOP/DOP (Kirsten)
14:00  Check Mail
14:15  Lunch Break
15:00  Daily Reminder (DaSu/AnNi)
16:00  EIOP (Tina/ABQ)
16:00  General Progress Notes
17:30  EIOP/EOP (Kirsten)

Combined
Open  P1  Print group schedule for week of 8/17-8/21
Open  P1  Send virtual links for EIOP/EOP 5:30pm (Kirsten)
Open  P1  Confirm UA list for Tuesday
Open  P1  Call references for Kristi Dew
Open  P1  QOL with Zainah at 10:30 AM
08:00  P2  Sean Communications
10:30  P1  QOL with Zainah
10:45  P2  Begin Daily Reminders
12:00  P2  DIOP (Amy)
13:30  P2  DIOP/DOP (Kirsten)
14:00  P2  Check Mail
14:15  P2  Lunch Break
15:00  P1  Daily Reminder (DaSu with Amy SF, AnNi with Tina ABQ)
16:00  P2  EIOP (Tina/ABQ)
16:00  P2  General Progress Notes
17:30  P2  EIOP/EOP (Kirsten)
```

### 7.3 Morning Update (Update Run)

**Trigger**: Detected as the Update Run per 1.3 (before 2:00 PM), or user
asks for "morning update," "last-minute updates," or similar.

**Behavior:**

- Re-gather fresh per section 2 — same as always, no cached state.
- Fold anything new into **one current rundown**, not a separate delta list:
  a newly confirmed appointment, a cancellation, a reply that closes out a
  P1, a UA list that landed overnight, etc. Apply Thread Resolution (2.3) as
  usual — a closed item drops off, an updated time replaces the old one.
  Don't send a "what changed" list unless asked; just send the current,
  fully up-to-date rundown.
- Format and render exactly as 7.2 (same field omissions, same HTML via
  section 8).

**No diffing against the Initial Run's content — by design.** The previous
email is superseded, not an input. Don't fetch or parse its body, and don't
try to compute or call out what changed — a fresh re-gather already achieves
that (Thread Resolution alone drops closed items and replaces stale times),
and it can't inherit a mistake the evening run made. The only thing the
Initial Run's message is used for is finding where to thread the reply.

**Find the Initial Run's message, if any:**

```
gmail search 'in:sent subject:"STC Daily Update [Day], [Month] [Date], [Year]" newer_than:1d'
```

- **Found** → deliver as a real reply in that thread, using `gmail reply`
  (not `gmail send`) with its message ID. **Read `rendered.html`'s actual
  contents first**, then pass that literal HTML text as `--body` — never
  write `$(cat rendered.html)` as the value itself (see 8.3 for why):

  ```
  gmail reply <message_id> --html --body "<rendered.html's actual contents, read and inlined>"
  ```

  `gmail reply` sets `In-Reply-To`/`References`/`threadId` from the original
  message automatically — don't hand-build a subject line or use
  `gmail send --thread-id` for this, `reply` is the correct tool for it. No
  `--inline-image` flag needed — the logo is a hosted URL baked into the
  template (see 8.3).
- **Not found** → this isn't an error, it just means there's nothing to
  thread onto. Fall back to normal Initial Run delivery (7.2): `gmail send`
  with the standard subject line. Note in chat (not in the email — it has no
  slot for this) that no prior thread was found, so you know why it went out
  as a new email instead of a reply.

---

## 8. HTML Email Rendering

Both the Initial Run (7.2) and Update Run (7.3) emails are sent as HTML,
rendered from `templates/email.html` (a fixed-width 480px card, MSO-safe
table layout). The STC logo is a hosted image, referenced in the template as
`<img src="https://stc-comprehensive.vercel.app/stc-logo-horizontal-v2.webp">`.

**Why a hosted URL, and not `data:` or `cid:`:** Gmail strips `data:` URI
(base64-embedded) images out of HTML email bodies entirely — confirmed
against Gmail's documented behavior. A `cid:` reference works in Gmail, but
requires attaching the actual image bytes to the outgoing message as a real
inline MIME part — which, on this MCP-tool-based setup (no local `gmail`
CLI), means an agent has to reproduce the logo's ~59,000-character base64
encoding verbatim inside a tool call. That is prohibitively expensive and
error-prone for an LLM to retype from context, and was the direct cause of
several failed/incomplete sends. A plain `https://` image `src` sidesteps
both problems: email clients (including Gmail) fetch the image themselves,
no attachment step required. The logo is hosted at
`https://stc-comprehensive.vercel.app/stc-logo-horizontal-v2.webp` — never
switch this back to `data:` or `cid:` embedding, and never add a second
image to this template without hosting it the same way.

**Don't hand-write or retype the filled-in HTML** — always fill the template
by running `scripts/render_email.py`, which does exact string substitution on
the placeholders and repeat blocks and leaves everything else untouched.

**Scope note:** this template is intentionally compact — "P1/P2 items at a
glance." It only has slots for P1 untimed priorities and the timed Timeline.
Untimed P2/P3 items, the Background section, and Could-Not-Confirm notes have
no slot in the HTML and are left out of the email — keep producing those in
the plain-text/chat rundown as before, just don't try to force them into this
template.

### 8.1 Data shape

```json
{
  "date_long": "Monday, August 17, 2026",
  "week_range": "8/17-8/21",
  "priorities": [
    {"title": "Print group schedule", "note": "Google Doc shared by Amy 8/14"},
    {"title": "Confirm UA list for Tuesday", "note": ""}
  ],
  "timeline": [
    {"time": "8:00", "ampm": "AM", "priority": "", "title": "Sean Communications", "note": ""},
    {"time": "12:00", "ampm": "PM", "priority": "P2", "title": "DIOP (Amy)", "note": "inferred from last Monday"},
    {"time": "3:00", "ampm": "PM", "priority": "P1", "title": "DaSu with Amy", "note": "Confirmed on the daily reminder"}
  ]
}
```

- `priorities` — P1 untimed items only from 4.2; `note` may be `""`.
- `timeline` — every clock-time row from the Combined list (4.4), chronological;
  `priority` is `"P1"`, `"P2"`, or `""` for an untagged landmark; `note` may be `""`.

### 8.2 Run it

Write the JSON to a temp file, then (via the `terminal` tool):

```
python3 <skill-folder>/scripts/render_email.py data.json > rendered.html
```

Run `python3 <skill-folder>/scripts/render_email.py --selftest` once if
you've never run this skill before, or after editing the template, to
confirm it fills correctly and still references the hosted logo URL (not a
`data:` or `cid:` embed — see the note above).

### 8.3 Send it — no attachment needed, but read the file for real

`rendered.html`'s **contents** are the email body — not a shell command that
produces them. **Read the file first** (with a Read/file tool), then pass
that literal HTML text as the send tool's body parameter.

**Never write `$(cat rendered.html)` as the literal body value.** That is
shell command-substitution syntax — it only gets evaluated inside a real
Bash shell. This skill is most commonly run through Gmail **MCP tools**, not
a real shell, and MCP tools have no idea what `$(...)` means — they send it
as a literal 22-character string. This already happened once: the entire
email body was the text `$(cat /tmp/rendered.html)`, not the rendered page.
If you catch yourself about to type `$(` into a body/htmlBody argument,
stop — go read the file's actual contents and use those instead.

The logo is a normal `https://` image reference
(`https://stc-comprehensive.vercel.app/stc-logo-horizontal-v2.webp`) baked
into the template, so no `--inline-image` flag or MIME attachment is needed
either way.

**If sending through Gmail MCP tools (the common case, no `terminal`/`gmail`
CLI available):** read `rendered.html`, then pass its contents as `htmlBody`
to `send_message`/`reply`.

**If a real `gmail` CLI is available via a terminal tool:**

```
gmail send --to tyler@treatmentconsultants.net --html \
  --subject "STC Daily Update Monday, August 17, 2026" \
  --body "<rendered.html's actual contents, read and inlined here>"
```

(For the Update Run, use `gmail reply <message_id>` instead — same rule, see 7.3.)
---

## 9. Website Task Track Update

Both the Initial Run (7.2) and Update Run (7.3) **also** write the same
day's rundown into the STC website's own Task Track timeline, so the live
site (not just the email) reflects it. Do this in addition to sending the
email — same underlying data, one more delivery target.

The website is `STC-Comrehensive-main`
(repo: `/Users/ts/github-sites/STC-Comrehensive-main` — find it if that's
moved). Its right-rail timeline reads
`.planning/TASK-TRACK-TIMELINE.md`, bundled into the site **at build time**
(`?raw` import), so editing that file alone changes nothing live — it has to
be committed and pushed; pushing to `master` auto-deploys on Vercel.

**Only Monday–Friday targets have a section in that file** — these two cron
jobs only ever run for weekday targets, so this should always apply, but
skip this section (and say so in chat) if the target date somehow isn't a
weekday.

### 9.1 Data shape

Similar to 8.1 but not identical — `priorities` here includes **both P1 and
P2** untimed items (the website supports both tiers; the email template only
had room for P1), and every entry needs an explicit `"priority"` field:

```json
{
  "weekday": "Monday",
  "priorities": [
    {"priority": "P1", "title": "Print group schedule", "note": "Google Doc shared by Amy 8/14"},
    {"priority": "P2", "title": "Confirm Crystal's 3:45 leave is on the time-off tab", "note": ""}
  ],
  "timeline": [
    {"time": "10:30am", "priority": "P1", "title": "DaSt QOL with Zainah", "note": "Scheduled on Friday's EOS"},
    {"time": "12:00pm", "priority": "P2", "title": "DIOP group", "note": "Amy; inferred from last Monday"},
    {"time": "2:00pm", "priority": "", "title": "Check Mail", "note": ""}
  ]
}
```

- `priorities` — every P1/P2 untimed item from 4.2 (P3 has no home here either — same as the email).
- `timeline` — every row from the Combined list (4.4), chronological, `time` as e.g. `10:30am` (lowercase, no space); `priority` is `"P1"`, `"P2"`, or `""` for an untagged landmark like the `## Every Day` items.
- Don't include `## Every Day` items unless something about that specific day changes them — they're already seeded site-wide.

### 9.2 Run it

```
python3 <skill-folder>/scripts/update_task_track.py data.json --repo /Users/ts/github-sites/STC-Comrehensive-main
```

This replaces only that weekday's two sections in `TASK-TRACK-TIMELINE.md`
(leaving `## Every Day` and every other weekday untouched), commits, and
pushes. Run `python3 <skill-folder>/scripts/update_task_track.py --selftest`
once if you've never run this skill before, to confirm the section-replace
and git commit both work — it uses an isolated temp repo and never touches
the real one.

If the commit/push fails (merge conflict, auth, etc.), report that in chat —
don't force-push or retry destructively.
