# Changelog — Free Throw Frenzy

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
