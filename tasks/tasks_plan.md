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

## Phase 10: Dynamic Camera (v0.7.0) ✅
- [x] `Camera` type + `state.camera` on GameState
- [x] `src/engine/camera.ts` — vertical follow, no X pan, lerp + visibility clamps
- [x] `gameLoop` updates camera after physics; `renderer` applies transform
- [x] Backgrounds extend above y=0 when looking up; HUD overlays stay screen-space
- [x] `GameCanvas` resets camera on remount; `resetBall` snaps to rest
- [x] `camera_test.ts` — 24 tests (60 total, all passing)
- [x] Diagram `diagrams/camera.md`; docs + changelog updated

## Phase 11: CRT TV UI + Jerseys + Shot Bonus ✅
- [x] `CrtShell` + `src/styles/crtTv.css` — bezel, 4:3 glass, scanlines, mild warp; wrap Main Menu + game
- [x] Replace blue “Free Throw Frenzy” page chrome with CRT presentation
- [x] TV panel **Restart** / **Menu** controls (mobile-friendly hit targets)
- [x] Restart wipe: coins + unlocked courts + jerseys; keep high score; remount
- [x] `jerseyData.ts` — all 30 NBA teams (primary/secondary); shop Jerseys tab
- [x] Persist unlock/active jersey; tint player in `renderer.ts`
- [x] Per-shot `shotIdealPower` re-roll; `NEAR_IDEAL_MAKE_BONUS = 0.04` in physics
- [x] Move root `tests/` → `src/tests/`; migrate `src/__tests__/*` → camelCase `*.test.ts`
- [x] Unit tests: wipe, jersey shop, ideal re-roll / +4% bonus; all tests pass (106)
- [x] Feature overview `docs/crt_phase11.md`; Mermaid `diagrams/crtShell.md`; changelog 0.9.0

## Future Work (Phase 12+)
- [ ] Difficulty scaling (wind/timer with streak)
- [ ] Screen shake on miss
- [ ] Responsive canvas sizing with ResizeObserver
- [ ] Ball skins / hoop paints
- [ ] Leaderboard backend

## Known Issues
- None.

## Current Status
v0.9.0 — Phase 11 complete. 106 tests passing. CRT UI + 30 jerseys + per-shot ideal (+4%).
