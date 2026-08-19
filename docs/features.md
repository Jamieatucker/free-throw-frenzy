# Feature Overview — Free Throw Frenzy

## Core Game Loop
The game implements a fast Aim → Release → Evaluate → Reset cycle. Players hold spacebar (or touch on mobile) to charge a power meter, then release to shoot. The ball follows a physics-based arc toward the hoop. Made shots earn points multiplied by the current streak. The cycle repeats until the 10-second shot timer expires.

## How It Works
The game is split into two layers: a **React UI layer** (App, HUD) and a **pure TypeScript engine** (gameLoop, physics, renderer, input, gameState). The engine runs a `requestAnimationFrame` loop at 60 FPS, updating physics and redrawing the canvas each frame. React only handles the HUD overlay (score, streak, timer, game-over screen) and reads state via callbacks — it never touches the canvas directly.

**Physics**: Euler integration with gravity (980 px/s²), random wind per shot, and collision detection against the rim (circle-circle) and backboard (circle-rect). Bounce uses a restitution coefficient of 0.55.

**Input**: Spacebar keydown/keyup on desktop; touchstart/touchend on mobile. Charge accumulates from 0 → 1 over 1.5 seconds. A cyan marker on the power meter shows the ideal release point. The accepted tolerance is ±3% of ideal power.

**Scoring**: +1 × multiplier per make. Streak increments on makes (max multiplier 10×). Resets to 1× on miss. Currency accumulates for a future shop system.

**Visual Feedback**: "SWISH!" in green on score, "MISS!" in red. Fire particle effect around the player at streak ≥ 5. Power meter changes color (green → yellow → red). Timer turns red at ≤ 3 seconds.

## How to Edit
- **Adjust difficulty**: Change `GRAVITY` and `RESTITUTION` in `src/engine/physics.ts`, or the charge rate in `src/engine/input.ts`.
- **Change visuals**: All drawing happens in `src/engine/renderer.ts` — modify colors, shapes, or add new effects there.
- **Add new game states**: Extend the `GamePhase` union in `src/types/game.ts` and handle transitions in `src/engine/gameLoop.ts`.
- **Modify HUD**: Edit `src/components/HUD.tsx` (React + Tailwind).
- **Add shop/skins**: Create new components in `src/components/` and store unlocks in `gameState.ts`.
