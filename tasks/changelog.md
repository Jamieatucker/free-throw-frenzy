# Changelog — Free Throw Frenzy

## [0.4.0] — 2026-08-19
### Fixed
- **Max power exploit**: Holding spacebar/touch to max now auto-fires with severe accuracy penalty (±45% random offset). No more guaranteed scores at full power.
- **Ground bounce**: Ball now bounces off the court floor like a real basketball (restitution 0.65, friction 0.85) instead of phasing through. After 5 bounces or velocity < 20, it counts as a miss.
- **Behind-hoop shooting**: Ball can now fly past the backboard — only collides when hitting the actual board face, allowing overshoots.
- **Backboard visual**: Widened from 8px to 14px, removed the red target square that looked bad in 2D. Added proper 3-tone cel shading.

### Added
- **In-game shop**: Click the COINS HUD element to open shop. Also accessible from game-over screen. Purchase and equip backgrounds with earned coins (persisted to localStorage).
- **8 backgrounds**: Pro Stadium (default, free), Basketball Park (50), Farm (100), Desert (150), Pirate Ship (200), Amazon Jungle (250), NYC Rooftop (300), Outer Space (500). Each has unique cel-shaded artwork.
- **Cade Cunningham player design**: Detroit Pistons blue jersey (#2) with red stripe accents, white pinstripe, red shoes, darker skin tone matching Cunningham's appearance.
- **Utility modules**: `src/utils/math.ts` (distance, clamp, lerp, randomRange), `src/utils/shopData.ts` (purchase, unlock, persist backgrounds/coins).
- **15 new tests** (28 total): shop purchase/unlock/persist (8), math utilities (4), ground bounce (1), max bounces miss (1), behind-hoop fly-through (1).

### Changed
- Power meter now shows "MAX!" warning and red danger zone at top.
- `updateCharge` now accepts auto-fire callback for max-power trigger.
- Coins saved to localStorage at game over for shop persistence.
- `bounceCount` added to GameState for ground bounce tracking.

## [0.3.0] — 2026-08-19
### Fixed
- Rewrote `launchBall` with `solveArcVelocity` — proper projectile solver.
- Widened rim, relaxed scoring zone.

### Added
- Cel-shaded graphics, sound effects, error boundary, high score persistence, config module.

## [0.2.0] — 2026-08-19
### Added
- Full game engine, React components, Tailwind CSS, physics, scoring, input, tests.

## [0.1.0] — 2026-08-19
### Added
- Initial CRA project, Memory Files, directory structure.
