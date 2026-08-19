# Active Context — Free Throw Frenzy

## Current Focus
v0.6.0 complete. Full difficulty system with main menu, per-difficulty physics/layout overrides, HUD badge, and 36 passing tests.

## Recent Changes (v0.6.0)
- New `MainMenu` component: animated title screen with difficulty picker cards showing rim width, distance, wind, and meter speed for each option.
- `DifficultyConfig` interface (10 fields) and `DIFFICULTY_CONFIGS` map in `src/utils/difficultyData.ts`.
- `Difficulty` + `DifficultyConfig` added to `GameState`; `createInitialState` now accepts difficulty.
- Engine reads `gravity`, `restitution`, `windRange`, `chargeDuration`, `powerTolerance`, `idealPower` from `state.difficultyConfig` instead of global `CONFIG`.
- Hoop x-ratio, player x-ratio, rim width, and backboard height all driven by difficulty.
- Power meter ideal-zone and wind indicator adapt to current difficulty values.
- `App.tsx` now manages a `screen` state (`'menu' | 'game'`).
- HUD shows difficulty badge; game over shows "Menu" button.
- `difficulty_test.ts` added (36 total tests, all passing).

## Active Decisions
- `CONFIG` remains for static constants (canvas size, SHOT_TIMER, BALL_RADIUS, etc.). Only gameplay-tunable values are overridden by `DifficultyConfig`.
- `DifficultyConfig` is embedded in `GameState` so the engine never needs to import utility files.
- No backend; difficulty choice is not persisted — player picks fresh each session.

## Next Steps
1. Screen shake on miss.
2. Responsive canvas sizing with ResizeObserver.
3. Ball skins / hoop paints in shop.
4. Leaderboard backend.

## Blockers
None.
