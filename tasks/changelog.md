# Changelog — Free Throw Frenzy

## [0.9.0] — 2026-08-26
### Added
- **CRT TV shell**: `CrtShell` + `crtTv.css` wrap Main Menu and game (4:3 glass, scanlines, control panel).
- **Restart wipe**: clears coins, unlocked courts, and jerseys; keeps high score.
- **30 NBA jerseys** in Shop (colors only); canvas player tint via `jerseyData` + renderer.
- **Per-shot ideal power** re-roll + **+4%** near-ideal make window (`NEAR_IDEAL_MAKE_BONUS`).
- Tests moved to `src/tests/*.test.ts` (camelCase); `phase11.test.ts` covers wipe, jerseys, shot ideal.
- Docs: `docs/crt_phase11.md`, diagram `diagrams/crtShell.md`.

### Changed
- Removed blue full-page title chrome; branding lives on the CRT screen.
- Power meter ideal marker follows `shotIdealPower` and widened tolerance.

## [0.8.0] — 2026-08-20
### Fixed
- **Physics phase error**: Scoring no longer compares a TypeScript-narrowed `phase === 'flying'` against `'falling_through'`. `checkScore` returns a boolean and the flying tick exits immediately on a make.

### Added
- **Pause menu**: Overlay from a non-blocking pause button (bottom-right) or Esc. Toggle SFX, mute music, resume, or return to the main menu to change difficulty.
- **Stage music**: Unique looping background track per court (≤ 25s). Each stage has a theme-specific arrangement (arena stabs, pastoral chirps, folk fifths, desert wind, pirate 6/8 shanty, jungle perc, urban boom-bap, space drones).

## [0.7.2] — 2026-08-20
### Fixed
- **Swish animation**: After a make the ball keeps falling through the net (no snap-to-center freeze), then fades out instead of hanging mid-air until the next shot.
- **Bounce swish exploit**: A ground bounce into the net no longer counts as a make. The ball must pass above the rim, then cross the rim plane downward inside the rim, with `bounceCount === 0`.

## [0.7.1] — 2026-08-20
### Added
- **Net swish**: On a make, net cords wrap around the basketball (back strings behind, front strings over the ball) and stretch as it drops through, then snap back. Driven by `src/engine/net.ts`.
- `net_test.ts` covering wrap, band gap, stretch, and swish reset.

### Changed
- Miss is called after **3** ground bounces (was 5).
- Fall-through lasts 0.6s and eases the ball toward rim center so it reads as going through the net, not sitting on it.

## [0.7.0] — 2026-08-20
### Added
- **Dynamic camera**: Vertical follow-cam so high-arc free throws stay on screen. Ideal-power shots already peak above the 500px canvas; the camera pans up, then lerps back as the ball descends.
- `src/engine/camera.ts`: `createCamera`, `updateCamera`, `getCameraTargetY`, world/screen conversion, visibility helpers.
- `Camera` type on `GameState` (`x`, `y` viewport offset). `camera.x` is always 0.
- Camera tunables in `config.ts`: `CAMERA_TOP_MARGIN` (56px), `CAMERA_FOLLOW_LERP` (10), `CAMERA_LOOKAHEAD` (0.08s).
- `camera_test.ts`: 24 tests covering rest framing, high-arc follow, overshoot/side-bounce ignore, lerp vs snap, look-ahead, transforms, and full-shot simulations (60 tests total).
- Mermaid diagram in `diagrams/camera.md`.

### Changed
- `gameLoop` runs `updateCamera` after physics each frame.
- `renderer` applies the camera transform to world drawing (sky, court, hoop, player, ball) and draws wind/feedback in screen space. Backgrounds extend above y=0 when the camera looks up.
- `GameCanvas` resets the camera on each mount / difficulty change.
- `resetBall` snaps the camera back to rest for the next shot.
- App HUD state copy includes `camera`.

### Not in scope (by design)
- Camera does **not** pan horizontally when the player overshoots the hoop or when the ball bounces off the left/right of the screen. Those misses still leave the play area.

### Improvements (S1–S3)
- **S1 (Stability/Scalability)**: Follow rules are data-driven off `GameState.phase` and horizontal bounds; adding a new phase that should not track the ball requires no renderer changes.
- **S2 (Performance/Security)**: Camera update is a few arithmetic ops per frame; transform is one `translate` around existing draw calls. No extra allocations in the hot loop.
- **S3 (Readability/Maintainability)**: All follow/clamp logic lives in `camera.ts`. Renderer only applies the offset; physics is unchanged.

## [0.6.0] — 2026-08-19
### Added
- **Main Menu**: Full title screen shown before the game. Displays high score and coin balance, then lets the player choose a difficulty before starting.
- **Difficulty System**: Three difficulties — Easy, Medium, Hard — each with distinct physics and layout overrides stored in `DifficultyConfig`.
  - **Easy**: Player close to hoop (30%), wide rim (80px), slow charge meter (1.8s), low gravity (560), calm wind (±15), forgiving timing window (±6%).
  - **Medium**: Standard free-throw distance (22%), 60px rim, 1.5s meter, gravity 680, wind ±30, timing ±3% (unchanged from prior versions).
  - **Hard**: Far player (15%), narrow rim (44px), fast meter (1.1s), heavy gravity (820), gusty wind (±55), tiny timing window (±1.5%).
- **DifficultyConfig type**: 10-field interface covering `playerXRatio`, `hoopXRatio`, `rimWidth`, `backboardExtendTop`, `idealPower`, `powerTolerance`, `gravity`, `restitution`, `windRange`, `chargeDuration`, `groundRestitution`.
- `src/utils/difficultyData.ts`: Maps each `Difficulty` to its `DifficultyConfig`.
- `difficulty_test.ts`: 5 tests covering config ordering, field presence, and game-state integration (36 tests total).
- **HUD difficulty badge**: Coloured pill showing current difficulty in the top HUD row.
- **Game over "Menu" button**: Returns player to main menu to change difficulty.

### Changed
- `GameState` gains `difficulty: Difficulty` and `difficultyConfig: DifficultyConfig` fields.
- `createInitialState` accepts `difficulty` param; builds hoop and player position from `DifficultyConfig`.
- `launchBall` and `updatePhysics` read gravity, restitution, and shot window from `state.difficultyConfig` — no longer hardcoded from `CONFIG`.
- `updateCharge` reads `chargeDuration` from `state.difficultyConfig`.
- Power meter ideal-zone marker scales with difficulty's `idealPower` and `powerTolerance`.
- Wind indicator colour shifts from blue (calm) to red (intense) based on wind relative to `windRange`.
- `resetBall` uses `difficultyConfig.windRange` for per-shot wind re-roll.
- `GameCanvas` accepts `difficulty` prop; restarts with new difficulty on each `key` change.
- `App.tsx` manages `Screen` (`'menu' | 'game'`); routes between `MainMenu` and game view.
- `HUD.tsx` receives `onMainMenu` callback and shows "Menu" button on game over.

### Improvements (S1–S3)
- **S1 (Stability/Scalability)**: `DifficultyConfig` is a plain data record — adding new difficulties requires only a new entry in `DIFFICULTY_CONFIGS`; zero engine changes needed.
- **S2 (Performance/Security)**: Physics reads per-frame difficulty values directly off `state.difficultyConfig` (no extra lookup cost); `gameOverSaved` flag prevents repeated localStorage writes.
- **S3 (Readability/Maintainability)**: All difficulty-driven numbers live in one file (`difficultyData.ts`). Engine functions accept `state` and read config from it — no argument threading needed.

## [0.5.0] — 2026-08-19
### Fixed
- Ball fall-through animation (new `falling_through` phase, 0.45s net drop).
- Infinite coins on game over fixed (one-shot save flag in `gameLoop`).
- Backboard extended from 70px to 95px above rim (`BACKBOARD_EXTEND_TOP`).

### Changed
- Shop UI converted to side panel overlay.
- Tests renamed to snake_case.

## [0.4.0] — 2026-08-19
### Fixed
- Max power exploit, ground bounce, behind-hoop shooting, backboard visual.

### Added
- In-game shop, 8 backgrounds, Cade Cunningham design, utility modules, 15 new tests.

## [0.3.0] — 2026-08-19
### Fixed
- Rewrote `launchBall` with `solveArcVelocity`.

### Added
- Cel-shaded graphics, sound effects, error boundary, high score, config module.

## [0.2.0] — 2026-08-19
### Added
- Full game engine, React components, Tailwind CSS, physics, scoring, input, tests.

## [0.1.0] — 2026-08-19
### Added
- Initial CRA project, Memory Files, directory structure.
