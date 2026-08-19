import { GameState, GameCallbacks } from '../types/game';
import { updatePhysics, launchBall } from './physics';
import { updateCharge } from './input';
import { render } from './renderer';
import { resetBall, saveHighScore } from './gameState';
import { saveCoins } from '../utils/shopData';

export function startGameLoop(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  callbacks: GameCallbacks
): () => void {
  let lastTime = performance.now();
  let animId = 0;
  let running = true;

  function tick(now: number) {
    if (!running) return;
    const rawDt = (now - lastTime) / 1000;
    const dt = Math.min(rawDt, 0.05);
    lastTime = now;

    update(state, dt);
    render(ctx, state);
    callbacks.onStateChange(state);
    animId = requestAnimationFrame(tick);
  }

  animId = requestAnimationFrame(tick);

  return () => {
    running = false;
    cancelAnimationFrame(animId);
  };
}

function update(state: GameState, dt: number): void {
  if (state.phase === 'gameover') return;

  updateCharge(state, dt, () => {
    if (state.phase === 'charging') launchBall(state);
  });

  if (state.phase === 'idle' || state.phase === 'charging') {
    state.shotTimer -= dt;
    if (state.shotTimer <= 0) {
      state.phase = 'gameover';
      saveHighScore(state.score);
      saveCoins(state.currency);
      return;
    }
  }

  updatePhysics(state, dt);

  if (state.feedbackTimer > 0) {
    state.feedbackTimer -= dt;
  }

  if ((state.phase === 'scored' || state.phase === 'missed') && state.feedbackTimer <= 0) {
    resetBall(state);
  }
}

export function handleRelease(state: GameState): void {
  if (state.phase === 'charging') {
    launchBall(state);
  }
}
