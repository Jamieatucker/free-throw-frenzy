# Changelog — Free Throw Frenzy

## [0.3.0] — 2026-08-19
### Fixed
- **Game-breaking physics**: Rewrote `launchBall` with proper projectile arc solver (`solveArcVelocity`) that computes exact velocity to reach the rim. Shots at ideal power (55%) are guaranteed to score.
- Widened rim from 50px to 60px and relaxed scoring detection zone for fairer gameplay.
- Moved player closer (22% from left) and hoop closer (72% from left) for better arc geometry.

### Added
- **Cel-shaded graphics**: Player now has a multi-toned jersey (#7), skin with highlight/shadow halves, hair, and a shooting arm that animates during charge. Ball has dark/light halves, highlight spot, and seam curve. Backboard, rim, and court all have cel-shading bands and dark outlines.
- **Sound effects**: Web Audio API synthesized sounds for shoot (noise burst + triangle), score (ascending 3-note chime), miss (descending sawtooth), and bounce.
- **Error boundary**: `ErrorBoundary` component wraps the entire app; shows friendly "Try Again" UI on crash.
- **High score persistence**: Scores saved to `localStorage`; displayed on game-over screen.
- **Config module**: All magic numbers extracted to `src/engine/config.ts` (gravity, restitution, tolerances, canvas size, etc.).
- **New test**: "should produce an arc that can reach the rim at ideal power" — simulates 2s of flight and asserts `phase === 'scored'`.
- **New test**: localStorage high score persistence.

### Changed
- Reduced gravity from 980 to 680 px/s² for more visible arcs.
- Ideal power shifted from 0.72 to 0.55 (mid-meter is now the sweet spot).
- Wind range reduced from ±40 to ±30 for fairer shots.
- Power meter now shows a gradient (green→yellow→red) with a highlighted ideal zone band.
- Net strings now have subtle sway animation via sine wave.
- Stars added to sky background.
- Court now shows dashed free-throw line and hoop pole.

## [0.2.0] — 2026-08-19
### Added
- Full game engine: gameState, physics, input, renderer, gameLoop (all TypeScript).
- React components: GameCanvas, HUD, App.tsx.
- Tailwind CSS integration with custom styles.
- Physics: gravity, wind, rim/backboard collision, ball bounce.
- Scoring: streak multiplier (max 10x), currency system, player distance shifting.
- Visual feedback: SWISH/MISS overlays, fire particle effect at streak >= 5, color-changing power meter.
- 10-second shot timer with auto game-over.
- Desktop (spacebar) and mobile (touch) input support.
- 11 unit tests (physics + gameState) — all passing.
- Architecture diagram in diagrams/architecture.md (Mermaid).
- Feature documentation in docs/features.md.

### Changed
- Converted all .js files to .tsx/.ts.
- Updated index.html title and meta description.

## [0.1.0] — 2026-08-19
### Added
- Initialized CRA project with React 19.
- Created Memory Files.
- Established directory structure.
