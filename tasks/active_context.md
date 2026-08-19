# Active Context — Free Throw Frenzy

## Current Focus
Core game complete (v0.2.0). Ready for polish, shop system, and additional features.

## Recent Changes
- Implemented full game engine (physics, input, rendering, game loop) in TypeScript.
- Built React components (GameCanvas, HUD) with Tailwind CSS styling.
- Added 11 unit tests — all passing.
- Created feature docs, architecture diagram, and changelog.
- Converted all JS files to TS/TSX. Deleted old CRA boilerplate.

## Active Decisions
- CRA with TypeScript (not Vite) since project was bootstrapped with CRA.
- Game state is a plain TS object mutated each frame; React reads via shallow-copy callback.
- Tests live in `src/__tests__/` due to CRA's jest config constraints.

## Next Steps
1. Add shop system (skins, court designs, hoop paints).
2. Add sound effects.
3. Add difficulty scaling as streak grows.
4. Consider screen shake on miss.
5. Local storage leaderboard.

## Blockers
None.
