# Active Context — Free Throw Frenzy

## Current Focus
Desktop launcher releases its local server when the last game tab closes (v0.10.1).

## Recent Changes
- `mac/session_server.py` replaces `python -m http.server` for the Mac app and `npm run play`.
- Mac app quits when that server exits. Session lifetime tests: `mac/test_session_server.py`.

## Earlier
- `CrtShell` wraps menu + game; TV Restart/Menu controls.
- `jerseyData.ts` (30 teams); Shop Courts/Jerseys tabs; renderer tint.
- `shotIdealPower` + `NEAR_IDEAL_MAKE_BONUS = 0.04`.
- Tests: `src/tests/*.test.ts` — 106 passing.

## Next Steps
1. Polish CRT mobile scaling / canvas fit if needed in playtest.
2. Optional: screen shake, ResizeObserver canvas, leaderboard.

## Blockers
None.
