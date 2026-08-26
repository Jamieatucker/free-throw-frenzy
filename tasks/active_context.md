# Active Context — Free Throw Frenzy

## Current Focus
**Phase 11 implemented (v0.9.0).** CRT shell, restart wipe, 30 jerseys, per-shot ideal +4% bonus, tests in `src/tests/`.

## Recent Changes
- `CrtShell` wraps menu + game; TV Restart/Menu controls.
- `jerseyData.ts` (30 teams); Shop Courts/Jerseys tabs; renderer tint.
- `shotIdealPower` + `NEAR_IDEAL_MAKE_BONUS = 0.04`.
- Tests: `src/tests/*.test.ts` — 106 passing.

## Next Steps
1. Polish CRT mobile scaling / canvas fit if needed in playtest.
2. Optional: screen shake, ResizeObserver canvas, leaderboard.

## Blockers
None.
