# Active Context — Free Throw Frenzy

## Current Focus
v0.7.0 complete. Dynamic vertical camera keeps high-arc free throws on screen. Overshoots and side-bounces are not tracked.

## Recent Changes (v0.7.0)
- New `src/engine/camera.ts` module: target Y from ball height, exponential lerp, top/bottom visibility clamps, world/screen helpers.
- `GameState.camera` (`x` always 0, `y` negative when looking up).
- `gameLoop` calls `updateCamera` after physics; `renderer` wraps world draws in `applyCameraTransform` and leaves wind/feedback in screen space.
- Background fills use `minY = camera.y` so extra sky appears when the camera pans up.
- `GameCanvas` assigns a fresh rest camera on each mount; `resetBall` snaps camera home.
- 24 camera unit tests (60 total, all passing). Diagram at `diagrams/camera.md`.

## Active Decisions
- Follow **Y only**. Horizontal overshoot (past the hoop / off the right edge) and balls that bounce off the sides stay as on-purpose misses.
- Follow only while `phase === 'flying'` and the ball still intersects the canvas in X. Otherwise the camera returns to rest.
- Lerp for smoothness; hard-clamp if the ball would actually leave the top or bottom of the viewport.
- `CONFIG` remains for static constants (canvas size, camera margins, SHOT_TIMER, BALL_RADIUS, etc.). Only gameplay-tunable values are overridden by `DifficultyConfig`.
- `DifficultyConfig` is embedded in `GameState` so the engine never needs to import utility files.
- No backend; difficulty choice is not persisted — player picks fresh each session.

## Next Steps
1. Screen shake on miss.
2. Responsive canvas sizing with ResizeObserver.
3. Ball skins / hoop paints in shop.
4. Leaderboard backend.

## Blockers
None.
