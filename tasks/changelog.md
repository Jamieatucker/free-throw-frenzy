# Changelog — Free Throw Frenzy

## [0.2.0] — 2026-08-19
### Added
- Full game engine: gameState, physics, input, renderer, gameLoop (all TypeScript).
- React components: GameCanvas, HUD, App.tsx.
- Tailwind CSS integration with custom styles.
- Physics: gravity, wind, rim/backboard collision, ball bounce.
- Scoring: streak multiplier (max 10×), currency system, player distance shifting.
- Visual feedback: SWISH/MISS overlays, fire particle effect at streak ≥ 5, color-changing power meter.
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
- Created Memory Files: product_requirement_docs.md, architecture.md, technical.md, tasks_plan.md, active_context.md.
- Created lessons-learned.mdc and error-documentation.mdc.
- Established directory structure: docs/, tasks/, tests/, diagrams/, utils/, styles/.
