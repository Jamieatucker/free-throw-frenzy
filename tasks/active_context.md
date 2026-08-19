# Active Context — Free Throw Frenzy

## Current Focus
v0.4.0 complete. Major gameplay loop improvements, shop system, Cade Cunningham design, 8 stage backgrounds.

## Recent Changes (v0.4.0)
- Max power exploit fixed: auto-fires at full charge with ±45% random accuracy penalty.
- Ground bounce physics: ball bounces off court with restitution 0.65, friction 0.85, max 5 bounces before miss.
- Behind-hoop shooting: backboard collision only triggers on face hits, allowing overshoots.
- Backboard widened to 14px, removed red target square.
- In-game shop: click COINS in HUD or from game-over screen. 7 purchasable backgrounds + default stadium.
- Player redesigned as Cade Cunningham (Pistons #2, blue jersey, red stripes).
- Utility modules in `src/utils/` (math, shopData).
- 28 tests across 4 suites — all passing.

## Active Decisions
- Shop data persisted in localStorage (unlocked backgrounds, active bg, coins).
- `bounceCount` tracks ground bounces per shot; resets on `resetBall`.
- Auto-fire uses `updateCharge` callback pattern — no extra state needed.
- Utils live in `src/utils/` due to CRA's `src/` restriction.

## Next Steps
1. Difficulty scaling (wind increases, timer decreases with streak).
2. Screen shake on miss.
3. Responsive canvas sizing with ResizeObserver.
4. Ball skins / hoop paints in shop.

## Blockers
None.
