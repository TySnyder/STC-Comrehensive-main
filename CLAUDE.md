# STC Clinical Operations Portal — session rules

## NEVER COMPACT — HANDOFF INSTEAD (mandatory)

Auto-compaction loses decisions. Handoffs follow the global director system
(`~/.claude/CLAUDE.md`); project specifics:

- `HANDOFF.md` (repo root) is the **director**: current state, decisions, exact next
  steps. Hard cap 150 lines. Fresh sessions read it first; it directs everything else.
- Completed work moves verbatim to `HANDOFF-COMPLETED.md` (newest-first archive) as
  each slice finishes. Never read it wholesale — `rg` it when a past diagnosis is needed.
- Multi-phase efforts split into `HANDOFF-1.md`, `HANDOFF-2.md`, … with the director
  as index. Handoffs live at repo root — `.planning/` holds planning docs only
  (`PROJECT.md`, `spreadsheets/`, `codebase/`).
- When context passes ~50%, write/update the director; by ~80% stop new work,
  finalize it, and tell the user to start a fresh chat from it. Decisions live in
  repo docs, never only in chat.

## Other standing rules

- No PHI in docs/code/localStorage; `live data/` is never committed.
- Never assume — batch questions and ask (see `.planning/spreadsheets/README.md`
  open-questions workflow).
- Stack locked: React 19 / Vite / TS / Tailwind v4. `tsc --noEmit` is the gate.
