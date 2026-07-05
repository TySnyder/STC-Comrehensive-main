# Handoff: Census Page — STC Operations Portal

**Last updated:** 2026-06-29  
**Status:** Active development — census grid is functional. See "Current State" below.

---

## Project Context

**App:** STC Operations Portal — internal admin dashboard for the Office Manager at Solutions Treatment Center (STC), a behavioral health facility with two locations: Santa Fe (SF) and Albuquerque (ABQ).

**Stack:** React 19 + Vite + TypeScript + Tailwind v4 + lucide-react. Dev port: **3004**.

**Backend:** Supabase free tier (dev phase). No real PHI yet. Will migrate to Firebase/Firestore + Google Cloud BAA when real clients go live.

---

## Architecture: Source of Truth

**`src/types.ts` and `src/data.ts` — NEVER MODIFY THESE.**  
All new data lives in `CensusEntry[]` and `InsuranceBillingNote[]`, managed in `App.tsx` state.

### Adapter Pattern
`src/utils/clientAdapter.ts` maps `Client` → `TempClient` (view-model):
- `adaptClient(client)` — uses `client.attendanceHistory` only
- `adaptClientWithEntries(client, allCensusEntries)` — merges live census records on top of history so Totals/Analytics reflect what's been entered in the grid this week

`TempClient` is the shape consumed by all analytics sub-views. It is never stored — always derived.

### CensusEntry shape (from `src/types.ts`)
```ts
interface CensusEntry {
  id: string;
  clientId: string;
  date: string;          // ISO YYYY-MM-DD
  block: ProgramBlock;   // 'DIOP' | 'DOP' | 'EIOP' | 'EOP' | 'IND'
  status: 'Present' | 'Absent' | null;
  excused: boolean;
  tardy: boolean;
  virtualMode: 'none' | 'residence' | 'away';
  specialCode?: 'L' | 'D';   // additive modifier — Last Day, Discharged
  autoFilled: boolean;
}
```

### Auto-fill rule
When DIOP or EIOP is recorded, the paired block (DOP or EOP respectively) is automatically mirrored — **unless** the pair was manually set (autoFilled: false).

---

## Current State (as of 2026-06-29)

### Census sub-tabs
`CensusView.tsx` has 4 sub-tabs: **Census Grid | Totals | Runway | Analytics**  
(Roster tab exists in code but is hidden from the nav.)

### Census Grid tab
- **`src/components/census/CensusGrid.tsx`** — weekly grid grouped by program (DIOP/EIOP/EOP/DOP/IND), location + program filters, legend, avatar initials
- **`src/components/census/CensusCell.tsx`** — fully inline interactive card (NO popup). Contains:
  - `*` / `L` / `D` modifier in top-left (cycles: undefined → L → D → undefined)
  - Status toggle (null → Present → Absent → null)
  - Present mode: Clock (tardy), Video/Home/Car (virtualMode cycle)
  - Absent mode: Unexcused / Excused pill toggle
  - Future days: grey + "upcoming", non-interactive
  - IND cells only: `×` button top-right to remove the entry
- Week nav: pill control with month label above, `‹ 22nd | Today | 27th ›`; date range subtitle only shown when not on current week

### Totals tab
`src/components/census/AttendanceTotals.tsx` — uses `adaptClientWithEntries` so it reflects live census edits.

### Runway tab
`src/components/census/TemporalRunway.tsx` — repurposed as visual attendance distribution per client:
- Bar = 85 program days wide (100% = 85 days)
- X = (fullDaysAtt + excused) / 85 — shown as "X% of 85-day program"
- 6 colored segments sorted largest → smallest:
  - Emerald = In-Person present (fullDaysAtt − virtualCount)
  - Slate = Absent total (excused + unexcused)
  - Amber = Excused
  - Red = Unexcused
  - Orange = Tardy
  - Sky = Virtual
- Sorted by most total recorded days at the top

### Analytics tab
`src/components/census/BentoDashboard.tsx`

---

## Key Files

| File | Role |
|------|------|
| `src/App.tsx` | State: `clients`, `censusEntries`, `billingNotes`. Handlers: `onSaveCensusEntry`, `onRemoveCensusEntry`, `onUpdateBillingNote` |
| `src/components/CensusView.tsx` | Sub-tab nav, week navigation, wires everything together |
| `src/components/census/CensusGrid.tsx` | Weekly grid shell — filters, program groups, avatar, billing cog |
| `src/components/census/CensusCell.tsx` | Inline interactive attendance card |
| `src/components/census/CellCard.tsx` | Standalone card (used in Roster/WeeklyCensusGrid — NOT used in the main census grid) |
| `src/components/census/QuickAdmitModal.tsx` | Exports `QuickAdmitCard` — used in Roster tab |
| `src/utils/clientAdapter.ts` | `TempClient` type + `adaptClient` + `adaptClientWithEntries` |
| `src/components/census/blockStyles.ts` | `clientBlocks(program)` → which ProgramBlocks to show per client |

---

## Prop Chain: Cell Update

```
App.tsx
  onSaveCensusEntry / onRemoveCensusEntry
    → CensusView.tsx
        handleGridCellUpdate (builds/merges CensusEntry, saves, auto-fills pair block)
        onRemoveCensusEntry (passed straight through)
          → CensusGrid.tsx
              onCellUpdate / onRemoveInd
                → CensusCell.tsx
                    onUpdate(Partial<CensusEntry>) / onRemove()
```

---

## Design Rules

- **No popover/modal for cell editing** — all interactions are inline on the card itself
- **D and L are additive modifiers** — they don't replace Present/Absent status, stored as `specialCode` only
- **Half-day fields** (`halfDaysAtt`, `halfExc`, `halfUnexc`) exist in TempClient but are excluded from the Runway visualization
- **Future days** (date > today ISO string) are always disabled/grey
- **85 days** is the program target — used as the denominator in Runway bar
- Tailwind custom tokens: `text-primary`, `bg-primary`, `font-display`, `text-secondary`

---

## What's Not Done / Possible Next Steps

- Roster tab is hidden (code exists in `WeeklyCensusGrid.tsx`, `QuickAdmitModal.tsx`) — could be unhidden if needed
- No persistence yet (all state in memory — Supabase integration is future work)
- `InsuranceBillingModal` exists but billing notes aren't surfaced in reports yet
- `BentoDashboard` (Analytics tab) was ported from stc-temp and may need data wiring review

---

*Last updated: 2026-06-29*
