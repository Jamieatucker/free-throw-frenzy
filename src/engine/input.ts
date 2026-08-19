import { GameState } from '../types/game';
import { CONFIG } from './config';

let isCharging = false;

export function setupInput(
  canvas: HTMLCanvasElement,
  getState: () => GameState,
  onRelease: () => void
): () => void {
  const onDown = (e: Event) => {
    e.preventDefault();
    const state = getState();
    if (state.phase === 'idle') {
      state.phase = 'charging';
      state.chargePower = 0;
      isCharging = true;
    }
  };

  const onUp = (e: Event) => {
    e.preventDefault();
    const state = getState();
    if (state.phase === 'charging' && isCharging) {
      isCharging = false;
      onRelease();
    }
  };

  const keyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat) onDown(e);
  };
  const keyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') onUp(e);
  };

  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  canvas.addEventListener('touchstart', onDown, { passive: false });
  canvas.addEventListener('touchend', onUp, { passive: false });
  canvas.addEventListener('mousedown', onDown);
  canvas.addEventListener('mouseup', onUp);

  return () => {
    window.removeEventListener('keydown', keyDown);
    window.removeEventListener('keyup', keyUp);
    canvas.removeEventListener('touchstart', onDown);
    canvas.removeEventListener('touchend', onUp);
    canvas.removeEventListener('mousedown', onDown);
    canvas.removeEventListener('mouseup', onUp);
  };
}

export function updateCharge(state: GameState, dt: number, onAutoFire: () => void): void {
  if (state.phase === 'charging') {
    state.chargePower = Math.min(1, state.chargePower + dt / CONFIG.CHARGE_DURATION);
    if (state.chargePower >= 1) {
      isCharging = false;
      onAutoFire();
    }
  }
}
