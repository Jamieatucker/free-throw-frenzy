# Tasks Plan — Free Throw Frenzy

## Phase 1: Project Setup ✅
- [x] Initialize CRA project
- [x] Create Memory Files (docs/, tasks/)
- [x] Add TypeScript support (rename files, add tsconfig)
- [x] Add Tailwind CSS
- [x] Create directory structure (components/, engine/, types/, styles/, tests/)

## Phase 2: Core Engine ✅
- [x] Implement `gameState.ts` — state machine + data model
- [x] Implement `input.ts` — spacebar + touch input with charge tracking
- [x] Implement `physics.ts` — gravity, wind, trajectory, collision detection
- [x] Implement `renderer.ts` — court, player, hoop, ball, power meter drawing
- [x] Implement `gameLoop.ts` — rAF loop coordinating update + render

## Phase 3: React Integration ✅
- [x] Convert `App.js` → `App.tsx`, wire up GameCanvas + HUD
- [x] Build `GameCanvas.tsx` — canvas ref, mount/unmount game loop
- [x] Build `HUD.tsx` — score, streak/multiplier, shot timer, game-over overlay

## Phase 4: Polish & Feedback ✅
- [x] Visual feedback: flash on score, shake on miss, "on-fire" effect at streak ≥ 5
- [x] Player distance changes based on streak
- [x] 10-second shot timer with auto-loss

## Phase 5: Testing & Docs ✅
- [x] Unit tests for physics (collision, trajectory) — 7 tests
- [x] Unit test for game state transitions — 4 tests
- [x] Feature docs in docs/features.md
- [x] Mermaid diagram in diagrams/architecture.md
- [x] Changelog in tasks/changelog.md

## Future Work (Phase 6+)
- [ ] Shop system: basketball skins, court designs, hoop paints
- [ ] Sound effects (swish, bounce, buzzer)
- [ ] Leaderboard (local storage or backend)
- [ ] Difficulty scaling (wind increases, timer decreases)
- [ ] Screen shake on miss

## Known Issues
- None.

## Current Status
v0.2.0 — Core game is fully playable. All 11 tests pass. Build succeeds.
