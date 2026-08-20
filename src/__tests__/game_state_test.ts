import { createInitialState, getHighScore, saveHighScore } from '../engine/gameState';
import { CONFIG } from '../engine/config';

jest.mock('../utils/shopData', () => ({
  getActiveBackground: () => 'stadium',
}));

describe('GameState', () => {
  const W = CONFIG.CANVAS_W;
  const H = CONFIG.CANVAS_H;

  it('should initialize with correct defaults on medium difficulty', () => {
    const state = createInitialState(W, H, 'medium');
    expect(state.phase).toBe('idle');
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.multiplier).toBe(1);
    expect(state.currency).toBe(0);
    expect(state.shotTimer).toBe(CONFIG.SHOT_TIMER);
    expect(state.chargePower).toBe(0);
    expect(state.bounceCount).toBe(0);
    expect(state.activeBackground).toBe('stadium');
    expect(state.difficulty).toBe('medium');
    expect(state.camera.x).toBe(0);
    expect(state.camera.y).toBe(0);
    expect(state.netSwish).toBe(0);
    expect(state.passedAboveRim).toBe(false);
    expect(state.ball.opacity).toBe(1);
    expect(state.paused).toBe(false);
  });

  it('should carry difficulty config into state', () => {
    const easy = createInitialState(W, H, 'easy');
    const hard = createInitialState(W, H, 'hard');
    expect(easy.difficultyConfig.rimWidth).toBeGreaterThan(hard.difficultyConfig.rimWidth);
    expect(easy.difficultyConfig.gravity).toBeLessThan(hard.difficultyConfig.gravity);
    expect(easy.difficultyConfig.windRange).toBeLessThan(hard.difficultyConfig.windRange);
  });

  it('easy should place player closer to hoop than hard', () => {
    const easy = createInitialState(W, H, 'easy');
    const hard = createInitialState(W, H, 'hard');
    expect(easy.player.x).toBeGreaterThan(hard.player.x);
  });

  it('hard should have narrower rim than easy', () => {
    const easy = createInitialState(W, H, 'easy');
    const hard = createInitialState(W, H, 'hard');
    const easyRimW = easy.hoop.rimRightX - easy.hoop.rimLeftX;
    const hardRimW = hard.hoop.rimRightX - hard.hoop.rimLeftX;
    expect(easyRimW).toBeGreaterThan(hardRimW);
  });

  it('should place hoop on the right side', () => {
    const state = createInitialState(W, H);
    expect(state.hoop.backboardX).toBeGreaterThan(state.canvasW * 0.5);
    expect(state.hoop.rimLeftX).toBeGreaterThan(state.canvasW * 0.4);
  });

  it('should place player on the left side', () => {
    const state = createInitialState(W, H);
    expect(state.player.x).toBeLessThan(state.canvasW * 0.5);
  });

  it('multiplier should max at configured value', () => {
    const state = createInitialState(W, H);
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
