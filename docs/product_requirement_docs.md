# Product Requirement Document — Free Throw Frenzy

## Vision
A 2D free-throw basketball simulator built as a portfolio-quality web game. Fast, satisfying, and replayable on any device.

## Problems Solved
- Demonstrates full-stack game development skill (canvas physics, React state, responsive input).
- Provides an addictive micro-game loop: Aim → Release → Evaluate → Reset.

## Target Platforms
Desktop browsers (keyboard — spacebar) and mobile browsers (touch hold/release).

## Core Requirements

### Game Loop
1. **Aim/Charge**: Hold spacebar (desktop) or touch-hold (mobile) to charge power meter.
2. **Release**: Release to shoot. Power determines arc/distance.
3. **Evaluate**: Ball follows physics trajectory; collision with rim/backboard/net determines score or miss. Clear visual/audio feedback.
4. **Reset**: Ball returns, next shot begins. 10-second shot clock per attempt; timeout = loss.

### Scoring & Progression
- +1 point per made shot.
- Streak multiplier: increases by 1 per consecutive make (max 10×). Resets to 1× on miss.
- Currency earned per basket (points × multiplier).
- Player moves closer to hoop as streak grows; farther on miss.

### Customization Shop (future)
- Basketball skins, court designs, hoop paints, net particle effects.
- Purchased with earned currency.

### Physics (no external engine)
- Gravity, wind (light random per shot), ball bounce off rim/backboard.
- Collision detection: rim (two circles), backboard (rectangle), net (trigger zone).
- Shot window tolerance: ±3 % of ideal release timing so every shot is makeable.

### Camera / Perspective
- Third-person side view: player on left, hoop on right.
- Single HTML5 `<canvas>` element managed inside a React component (`GameCanvas`).
- Dynamic vertical camera: when a free throw arcs above the default framing, the viewport pans up so the ball stays visible, then returns to rest. Horizontal overshoot (past the hoop) and balls that bounce off the sides of the screen are **not** tracked.

### Non-Functional
- 60 FPS target; `requestAnimationFrame` loop.
- Stack: TypeScript, React, Tailwind CSS. Minimal dependencies.
- Works on modern mobile and desktop browsers.

## Out of Scope (v1)
- Multiplayer, leaderboard backend, sound effects (can add later).
