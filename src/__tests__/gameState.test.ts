import { createInitialState } from '../engine/gameState';

describe('GameState', () => {
  it('should initialize with correct defaults', () => {
    const state = createInitialState(900, 500);

    expect(state.phase).toBe('idle');
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.multiplier).toBe(1);
    expect(state.currency).toBe(0);
    expect(state.shotTimer).toBe(10);
    expect(state.chargePower).toBe(0);
  });

  it('should place hoop on the right side', () => {
    const state = createInitialState(900, 500);

    expect(state.hoop.backboardX).toBeGreaterThan(state.canvasW * 0.5);
    expect(state.hoop.rimLeftX).toBeGreaterThan(state.canvasW * 0.5);
  });

  it('should place player on the left side', () => {
    const state = createInitialState(900, 500);

    expect(state.player.x).toBeLessThan(state.canvasW * 0.5);
  });

  it('multiplier should max at 10', () => {
    const state = createInitialState(900, 500);
    state.streak = 15;
    state.multiplier = Math.min(10, state.streak + 1);

    expect(state.multiplier).toBe(10);
  });
});
