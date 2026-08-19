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
- **Gravity**: constant `g = 980 px/s²` (scaled for canvas).
- **Wind**: random horizontal acceleration ±20 px/s², re-rolled per shot.
- **Ball trajectory**: Euler integration each frame (`vx += ax*dt`, `x += vx*dt`).
- **Collision**: circle-circle (ball vs rim endpoints), circle-rect (ball vs backboard). Bounce uses coefficient of restitution ~0.6.

### Input Handling
- Desktop: `keydown`/`keyup` on spacebar. Charge accumulates while held.
- Mobile: `touchstart`/`touchend`. Same charge logic.
- Charge rate: 0 → 1 over ~1.5 seconds. Release value maps to shot power.

### Shot Window Tolerance
- Ideal power for a make is computed from player distance to hoop.
- Accepted range: `idealPower ± 3%`. Within this window the ball trajectory is nudged to go in.

### Rendering Pipeline (60 FPS)
1. Clear canvas.
2. Draw court background (gradient + lines).
3. Draw backboard + rim + net.
4. Draw player silhouette.
5. Draw ball (with rotation).
6. Draw power meter (during charge).
7. Draw "on-fire" particles when streak ≥ 5.

### Performance Constraints
- No allocations in hot loop (pre-allocate vectors).
- Canvas size: responsive, max 1280×720.
- All art is vector (arc, rect, line) — no image assets needed for v1.

## Design Patterns
- **Game State Machine**: `idle → charging → flying → scored/missed → reset → idle`.
- **Observer callbacks**: engine emits events (`onScore`, `onMiss`, `onTimerTick`) consumed by React HUD.
- **Separation of concerns**: React owns DOM/UI; engine owns canvas + physics. They share state via refs, not re-renders.

## Technical Constraints
- No external physics/game engines.
- Minimal npm dependencies.
- Must run on mobile Safari, Chrome, Firefox.
