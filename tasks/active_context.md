# Active Context — Free Throw Frenzy

## Current Focus
v0.3.0 complete. Fixed physics, added cel-shaded graphics, sound effects, error boundary, high scores, and config module.

## Recent Changes (v0.3.0)
- Rewrote `launchBall` with `solveArcVelocity` — proper projectile solver guarantees makeable shots.
- Cel-shaded graphics: multi-toned player (jersey, skin, hair, arm), shaded ball with seam curve, shaded rim/backboard/court.
- Web Audio API sound effects (shoot, score, miss, bounce).
- Error boundary wrapping entire app.
- High score persistence via localStorage.
- Extracted all magic numbers to `config.ts`.
- 13 tests passing (added arc-reach and high-score tests).

## Active Decisions
- `solveArcVelocity` uses exact projectile math: computes vy0 and vx to land ball at target with given peak height.
- Ideal power at 0.55 (center of meter) with ±3% tolerance — shots within sweet spot are auto-aimed at rim center.
- Gravity reduced to 680 for visible arcs. Wind ±30.
- Cel outlines use consistent `#1a1a2e` color at 2-2.5px width.

## Next Steps
1. Shop system (skins, court designs, hoop paints).
2. Difficulty scaling (wind increases, timer decreases with streak).
3. Screen shake on miss.
4. Responsive canvas sizing with ResizeObserver.

## Blockers
None.
