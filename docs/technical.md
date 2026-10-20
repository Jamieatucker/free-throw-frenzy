# Technical Specification — Free Throw Frenzy

## Stack
| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5.x |
| UI Framework | React 19 |
| Styling | Tailwind CSS 3.x + `src/styles/*.css` |
| Build | Create React App (react-scripts 5) |
| Testing | Jest + RTL; suites in `src/tests/` (camelCase) |
| Canvas | HTML5 Canvas 2D |

## Development Setup
```bash
cd free-throw-frenzy
npm install
npm start          # localhost:3000 (dev server; stays up until you stop it)
npm test           # jest
npm run build
npm run play       # local game server; exits when the last game tab closes
```

## Phase 11 — CRT Shell
- Component: `CrtShell` wraps children in bezel + 4:3 screen region.
- Styles: `src/styles/crtTv.css` (imported from `styles/index.css`): dark matte bezel, inner step shadow, scanline overlay, subtle spherical warp (`perspective` / mild `transform` or mask), bottom speaker/controls strip.
- Responsive: scale CRT to viewport (`max-width`/`max-height`, `object-fit`-like containment); touch targets ≥44px on Restart/Menu.
- Do not use root `App.css`; keep CSS under `src/styles/`.

## Phase 11 — Restart Wipe API
Helpers on `shopData` (+ jersey helpers): `resetEconomyAndUnlocks()` clears coins, unlocked/active backgrounds, unlocked/active jerseys. Preserve high-score localStorage key. App remounts via `key++` after wipe.

## Phase 11 — Jerseys (30 NBA teams)
- `src/utils/jerseyData.ts`: `{ id, name, primary, secondary, price }[]` for all current teams.
- Persist like BGs: `ftf_unlocked_jerseys`, `ftf_active_jersey`.
- Default active: current Pistons-style / free starter.
- `renderer` reads active jersey colors when drawing player torso/trim.
- Shop: tabs **Courts** | **Jerseys**.

## Physics & Shot Window
- Baseline ideals still live on `DifficultyConfig`; each shot sets `state.shotIdealPower` (re-roll around difficulty ideal).
- Zone: `|power - shotIdealPower| <= shotIdealPower * powerTolerance`.
- Near-zone make boost: `NEAR_IDEAL_MAKE_BONUS = 0.04` — widen effective tolerance by 4% **or** equivalent soft aim nudge when inside base zone (pick one implementation; keep tested).
- Max power ≥0.99: keep `MAX_POWER_ACCURACY_PENALTY`.
- Gravity/wind/collision unchanged in spirit (`config.ts` + difficulty overrides).

## Input
- Desktop: spacebar keydown/keyup charge.
- Mobile: touchstart/touchend on canvas/screen (`passive: false` where needed).

## Camera / Render / Audio
- Vertical follow camera (`camera.ts`); cel-shaded renderer; Web Audio SFX + stage music — unchanged unless jersey tint touches player draw.

## Testing
- Canonical path: **`src/tests/*.test.ts`** (camelCase base name + CRA `.test.ts` suffix).
- CRA `testMatch` requires `*.test.ts` or `src/**/__tests__/**`; bare `*Test.ts` is not discovered.
- Phase 11: `phase11.test.ts` covers restart wipe, 30 jerseys, ideal re-roll / +4% bonus.

## Design Patterns
- State machine phases; engine mutates plain `GameState`; React overlays via callbacks.
- Config module for constants (`NEAR_IDEAL_MAKE_BONUS` in `config.ts`).

## Desktop play
- `bin/free-throw-frenzy` and `Free Throw Frenzy.app` start `mac/session_server.py` (loopback only).
- Each open game tab holds `GET /__ftf/session`. The last tab closing, or no tab within 60s of launch, stops the server.
- Refresh is covered by a 1.5s grace period. `python3 mac/test_session_server.py` covers that lifetime.
- The app binary is `clang -fobjc-arc -mmacosx-version-min=11.0 -framework Cocoa` from `mac/main.m`. `session_server.py` is copied into `Contents/Resources/`.

## Constraints
- No external physics engines; minimal deps; mobile Safari/Chrome/Firefox; ≤60 FPS.
