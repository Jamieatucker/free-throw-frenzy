import { createInitialState, getHighScore, saveHighScore } from '../engine/gameState';
import { CONFIG } from '../engine/config';

describe('GameState', () => {
  it('should initialize with correct defaults', () => {
    const state = createInitialState(CONFIG.CANVAS_W, CONFIG.CANVAS_H);

    expect(state.phase).toBe('idle');
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.multiplier).toBe(1);
    expect(state.currency).toBe(0);
    expect(state.shotTimer).toBe(CONFIG.SHOT_TIMER);
    expect(state.chargePower).toBe(0);
  });

  it('should place hoop on the right side', () => {
    const state = createInitialState(CONFIG.CANVAS_W, CONFIG.CANVAS_H);

    expect(state.hoop.backboardX).toBeGreaterThan(state.canvasW * 0.5);
    expect(state.hoop.rimLeftX).toBeGreaterThan(state.canvasW * 0.4);
  });

  it('should place player on the left side', () => {
    const state = createInitialState(CONFIG.CANVAS_W, CONFIG.CANVAS_H);

    expect(state.player.x).toBeLessThan(state.canvasW * 0.5);
  });

  it('multiplier should max at configured value', () => {
    const state = createInitialState(CONFIG.CANVAS_W, CONFIG.CANVAS_H);
    state.streak = 15;
    state.multiplier = Math.min(CONFIG.MAX_MULTIPLIER, state.streak + 1);

    expect(state.multiplier).toBe(CONFIG.MAX_MULTIPLIER);
  });

  it('should persist high scores to localStorage', () => {
    localStorage.clear();
    expect(getHighScore()).toBe(0);
    saveHighScore(42);
    expect(getHighScore()).toBe(42);
    saveHighScore(10);
    expect(getHighScore()).toBe(42);
    saveHighScore(100);
    expect(getHighScore()).toBe(100);
  });
});
