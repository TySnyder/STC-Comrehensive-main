# STC Clinical Operations Portal — session rules

## NEVER COMPACT — HANDOFF INSTEAD (mandatory)

Auto-compaction loses decisions. Do not let a session run long enough to trigger it.

- **Watch context usage.** When context passes ~60–70%, or a work phase completes
  (whichever comes first), STOP starting new work.
- **Write/update a handoff first:** `.planning/HANDOFF-<topic>.md` capturing state,
  decisions made, and next steps — decisions live in repo docs, never only in chat.
- **Then tell the user the handoff is ready** so they can start a fresh chat from it.
- New sessions begin by reading the handoff the user points at (they usually paste
  the path as the first message).

## Other standing rules

- No PHI in docs/code/localStorage; `live data/` is never committed.
- Never assume — batch questions and ask (see `.planning/spreadsheets/README.md`
  open-questions workflow).
- Stack locked: React 19 / Vite / TS / Tailwind v4. `tsc --noEmit` is the gate.
