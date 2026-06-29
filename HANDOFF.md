# Handoff — STC Operations Portal
**Date:** 2026-06-21  
**Repo:** `/Users/ts/github-sites/STC-Comrehensive-main`  
**Stack:** React 19 + Vite + TypeScript + Tailwind v4 + lucide-react  
**Dev server:** `npm run dev` → runs on port 3004 (3000–3003 in use on this machine)

---

## What this app is

STC Operations Portal — an internal behavioral health clinical operations EHR for admin staff. Not a consumer app. Register is "clinical control room": dense, precise, trust-through-consistency. PRODUCT.md and DESIGN.md are both present and complete. Impeccable context is loaded.

---

## What was built this session

### Attendance model refactored (COMPLETE)

`src/types.ts` — `AttendanceEntry` interface:
```ts
export interface AttendanceEntry {
  date: string;
  status: 'Present' | 'Absent';   // was 'Present' | 'Absent' | 'Late'
  tardy?: boolean;                  // NEW — amber Clock icon toggle
  virtual?: boolean;                // NEW — blue Video icon toggle
  note?: string;                    // TODO: callout/excused/unexcused — next pass
}
```

`App.tsx` — `handleUpdateClientAttendance` accepts partial updates:
```ts
handleUpdateClientAttendance(clientId, historyIndex, { status?, tardy?, virtual? })
```

Both `ClientsView` and `AttendanceView` receive `onUpdateAttendance` with this signature.

### Client profile calendar boxes (COMPLETE)

`src/components/ClientsView.tsx` — Each day box:
- **Top half click**: toggles Present ↔ Absent
- **Below divider**: Clock icon (amber = tardy) + Video icon (blue = virtual)
- Both icons disabled + greyed when Absent
- Legend updated to show all four states

### Clinic roster cards (COMPLETE)

`src/components/AttendanceView.tsx` — Each client row:
- Status **pill** toggles Present ↔ Absent on click
- Clock + Video icons inline to the right of the pill
- Same disable-when-Absent behavior
- "Late Arrivals" filter renamed "Tardy Arrivals"

---

## What needs to be built next (PRIMARY TASK)

### Program structure + two-block attendance

The facility runs four group programs plus individual therapy:

| Program | Time | Days |
|---|---|---|
| DIOP (Day Intensive Outpatient) | 11:45 AM – 1:30 PM | Mon–Fri |
| DOP (Day Outpatient) | 1:45 PM – 3:00 PM | Mon–Fri |
| EIOP (Evening Intensive Outpatient) | 3:45 PM – 5:30 PM | Mon–Fri |
| EOP (Evening Outpatient) | 5:45 PM – 7:00 PM | Mon–Fri |
| IND (Individual therapy) | Varies | Once/week |

**Key rules:**
- DIOP clients attend **both** the 11:45 and 1:45 blocks → two independent attendance records per day
- DOP clients attend only the 1:45 block
- EIOP clients attend both the 3:45 and 5:45 blocks → two independent attendance records per day
- EOP clients attend only the 5:45 block
- ALL clients (regardless of program) have a weekly IND session tracked separately
- IND-only is its own track: clients who've completed group step down to one IND/week

**Enrollment / graduation flow:**
- Single enrollment record per client. `program` tag changes as they step down: DIOP → DOP → IND
- Attendance history retains which program was active at each entry (label each record with program at time of logging)
- Reports need: total days attended, absences subtracted, tardy count — all filterable by program stage

### Roster view restructure

Currently shows flat lists by program. Needs to become **4 time-block sections**:
1. DIOP Block — 11:45 AM–1:30 PM (DIOP clients only)
2. DOP Block — 1:45–3:00 PM (DOP clients + DIOP clients again for second block)
3. EIOP Block — 3:45–5:30 PM (EIOP clients only)
4. EOP Block — 5:45–7:00 PM (EOP clients + EIOP clients again for second block)
5. IND Section — today's scheduled IND sessions (pre-populated from calendar parse + manual add button)

### IND section on roster

- Pre-populated from a calendar parsing feature (already exists separately — shows Time, Client Name, Phone, Therapist, Program/Location, Status columns — see screenshot described below)
- Needs a **manual "Add" button** for therapist-rescheduled sessions not on calendar
- IND attendance also tracked with Present/Absent + tardy/virtual modifiers

### Daily Reminders panel (separate feature, relates to IND)

A "Daily Reminders" panel already exists in another part of the codebase (screenshot was shared). It shows:
- Columns: TIME | CLIENT NAME | PHONE NUMBER | THERAPIST | PROGRAM/LOCATION | STATUS (dropdown: Confirmed/etc.)
- Header: "Daily Reminders (Calls for [date])" with a `+` button and "Send Daily Reminders" CTA
- This list is pre-populated by parsing therapist calendars
- The same calendar parse also produces UA (urinalysis) schedules — that feature needs tracking too

---

## Outstanding TODOs in code

```
// TODO: callout / excused / unexcused notes — tackle in next pass
```
This is on `AttendanceEntry.note` in `types.ts`. The note field already exists in seed data (e.g. "Medical appointment", "Traffic delays"). The excused/unexcused/callout layer is not yet designed.

---

## Questions that were asked but NOT fully resolved

1. **Two-block calendar display** — For a DIOP client in their profile, how should the day boxes show both the 11:45 block AND the 1:45 block? Two boxes per day column? Or one card that expands?
2. **Virtual + Absent** — User confirmed Absent+Virtual is a valid state (client connected virtually then disconnected for second half). Currently disabled per user instruction, but may need revisiting.
3. **IND on roster** — Whether to show IND every day (with N/A for non-IND days) or only on scheduled days → user said use the calendar parse to pre-populate, so only on days with scheduled sessions.

---

## Files changed this session

- `src/types.ts`
- `src/data.ts`
- `src/App.tsx`
- `src/components/ClientsView.tsx`
- `src/components/AttendanceView.tsx`
