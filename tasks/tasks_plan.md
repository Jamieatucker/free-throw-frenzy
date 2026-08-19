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

## Phase 6: Bug Fixes & Polish (v0.3.0) ✅
- [x] Fix impossible shot physics — rewrote launchBall with solveArcVelocity
- [x] Widen rim and scoring zone
- [x] Cel-shaded graphics for player, ball, hoop, backboard, court
- [x] Sound effects (Web Audio API: shoot, score, miss, bounce)
- [x] Error boundary component
- [x] High score persistence (localStorage)
- [x] Extract magic numbers to config.ts
- [x] New tests (arc-reach, high-score persistence) — 13 total

## Future Work (Phase 7+)
- [ ] Shop system: basketball skins, court designs, hoop paints
- [ ] Difficulty scaling (wind increases, timer decreases with streak)
- [ ] Screen shake on miss
- [ ] Responsive canvas sizing with ResizeObserver
- [ ] Leaderboard backend

## Known Issues
- None.

## Current Status
v0.3.0 — All 13 tests pass. Build succeeds. Shots are always makeable at ideal power.
