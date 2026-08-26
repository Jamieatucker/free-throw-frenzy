import { createInitialState, setPaused } from '../engine/gameState';
import { updateGame } from '../engine/gameLoop';
import { CONFIG } from '../engine/config';

jest.mock('../engine/audio', () => ({
  playSound: jest.fn(),
}));

jest.mock('../utils/shopData', () => ({
  getActiveBackground: () => 'stadium',
  saveCoins: jest.fn(),
  getSavedCoins: () => 0,
}));

jest.mock('../utils/jerseyData', () => ({
  getActiveJersey: () => 'det',
}));

describe('Pause', () => {
  const W = CONFIG.CANVAS_W;
  const H = CONFIG.CANVAS_H;

  it('createInitialState should start unpaused', () => {
    const state = createInitialState(W, H);
    expect(state.paused).toBe(false);
  });

  it('setPaused should freeze the shot timer', () => {
    const state = createInitialState(W, H);
    state.shotTimer = 8;
    setPaused(state, true);
    updateGame(state, 0.5);
    expect(state.paused).toBe(true);
    expect(state.shotTimer).toBe(8);
  });

  it('resuming should let the timer run again', () => {
    const state = createInitialState(W, H);
    state.shotTimer = 8;
    setPaused(state, true);
    setPaused(state, false);
    updateGame(state, 0.5);
    expect(state.paused).toBe(false);
    expect(state.shotTimer).toBeLessThan(8);
  });

  it('pausing while charging should cancel the shot', () => {
    const state = createInitialState(W, H);
    state.phase = 'charging';
    state.chargePower = 0.4;
    setPaused(state, true);
    expect(state.phase).toBe('idle');
    expect(state.chargePower).toBe(0);
  });

  it('should not pause on game over', () => {
    const state = createInitialState(W, H);
    state.phase = 'gameover';
    setPaused(state, true);
    expect(state.paused).toBe(false);
  });
});
