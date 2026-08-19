# Technical Specification — Free Throw Frenzy

## Stack
| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5.x |
| UI Framework | React 19 |
| Styling | Tailwind CSS 3.x |
| Build Tool | Create React App (react-scripts 5) |
| Testing | Jest + React Testing Library |
| Canvas | HTML5 Canvas 2D API |

## Development Setup
```bash
cd free-throw-frenzy
npm install        # installs deps (typescript already present)
npm start          # dev server on localhost:3000
npm test           # jest watch mode
npm run build      # production bundle
```

## Key Technical Decisions

### Physics Model
- **Gravity**: constant `g = 680 px/s²` (scaled for canvas, configured in `config.ts`).
- **Wind**: random horizontal acceleration ±30 px/s², re-rolled per shot.
- **Ball trajectory**: `solveArcVelocity` computes exact initial velocity to land ball at target with a specified peak height. Euler integration each frame.
- **Collision**: circle-circle (ball vs rim endpoints), circle-rect (ball vs backboard). Bounce uses coefficient of restitution 0.5.
- **Shot guarantee**: At ideal power (55% ± 3%), the ball is aimed directly at rim center — always makeable.

### Input Handling
- Desktop: `keydown`/`keyup` on spacebar. Charge accumulates while held.
- Mobile: `touchstart`/`touchend`. Same charge logic.
- Charge rate: 0 → 1 over ~1.5 seconds. Release value maps to shot power.

### Shot Window Tolerance
- Ideal power for a make is computed from player distance to hoop.
- Accepted range: `idealPower ± 3%`. Within this window the ball trajectory is nudged to go in.

### Rendering Pipeline (60 FPS) — Cel-Shaded Style
1. Clear canvas.
2. Draw sky (gradient + stars).
3. Draw court (3-band cel shading + dashed free-throw line + pole).
4. Draw backboard + rim + net (cel-shaded with dark outlines).
5. Draw player (multi-tone jersey, skin highlight/shadow, hair, animated shooting arm).
6. Draw ball (dark/light halves, highlight spot, seam curve, cel outline).
7. Draw power meter with gradient fill + ideal zone highlight.
8. Draw "on-fire" particles when streak ≥ 5.

### Audio
- Web Audio API synthesized sounds (no asset files).
- Shoot: noise burst + triangle tone. Score: ascending 3-note chime. Miss: descending sawtooth.
- AudioContext created lazily on first interaction; resumed if suspended.

### Performance Constraints
- No allocations in hot loop (pre-allocate vectors).
- Canvas size: responsive, max 1280×720.
- All art is vector (arc, rect, line) — no image assets needed for v1.

## Design Patterns
- **Game State Machine**: `idle → charging → flying → falling_through → scored / missed → reset → idle`.
- **Observer callbacks**: engine emits events consumed by React HUD via shallow-copy callback.
- **Separation of concerns**: React owns DOM/UI; engine owns canvas + physics. They share state via refs, not re-renders.
- **Error Boundary**: Class component wraps entire app; catches render errors with friendly recovery UI.
- **Config module**: All tunable constants in `src/engine/config.ts` — single source of truth.

## Technical Constraints
- No external physics/game engines.
- Minimal npm dependencies.
- Must run on mobile Safari, Chrome, Firefox.
