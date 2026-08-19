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

## Phase 7: Gameplay Loop & Shop (v0.4.0) ✅
- [x] Max power auto-fire with severe accuracy penalty
- [x] Ground bounce physics (restitution, friction, max bounces)
- [x] Behind-hoop shooting (backboard collision fix)
- [x] In-game shop (click coins → shop overlay)
- [x] 8 stage backgrounds (stadium + 7 purchasable)
- [x] Cade Cunningham player design (Pistons #2)
- [x] Wider backboard, removed red square
- [x] Utility modules (math.ts, shopData.ts)
- [x] 15 new tests (28 total across 4 suites)

## Phase 8: UX & Polish (v0.5.0) ✅
- [x] Ball fall-through animation (new `falling_through` phase, 0.45s net drop)
- [x] Fix infinite coins on game over (one-shot save flag in gameLoop)
- [x] Extend backboard height (70px → 95px above rim)
- [x] Shop UI as side panel overlay (not full-page modal)
- [x] Rename tests to snake_case (physics_test, game_state_test, shop_test, math_test)
- [x] Updated Mermaid diagram, changelog, docs

## Phase 9: Difficulty System & Main Menu (v0.6.0) ✅
- [x] `DifficultyConfig` type with 10 physics/layout fields
- [x] `DIFFICULTY_CONFIGS` map (easy / medium / hard) in `src/utils/difficultyData.ts`
- [x] `createInitialState` accepts `difficulty` param
- [x] Engine (physics, input, renderer) reads per-difficulty values from `state.difficultyConfig`
- [x] `MainMenu` component with animated difficulty picker cards
- [x] `App.tsx` manages `menu | game` screen state
- [x] HUD difficulty badge + "Menu" button on game over
- [x] `difficulty_test.ts` — 8 tests (36 total)
- [x] Updated changelog, Mermaid diagram, active_context, tasks_plan

## Future Work (Phase 10+)
- [ ] Difficulty scaling (wind increases, timer decreases with streak)
- [ ] Screen shake on miss
- [ ] Responsive canvas sizing with ResizeObserver
- [ ] Ball skins / hoop paints in shop
- [ ] Leaderboard backend

## Known Issues
- None.

## Current Status
v0.6.0 — 36 tests, all passing. Main menu, difficulty system, per-difficulty physics/layout, HUD badge all complete.
