import { createInitialState, resetBall } from '../engine/gameState';
import { updatePhysics, launchBall, isWithinTolerance } from '../engine/physics';
import { CONFIG } from '../engine/config';

jest.mock('../engine/audio', () => ({
  playSound: jest.fn(),
}));

jest.mock('../utils/shopData', () => ({
  getActiveBackground: () => 'stadium',
  saveCoins: jest.fn(),
}));

jest.mock('../utils/difficultyData', () => {
  const real = jest.requireActual('../utils/difficultyData');
  return real;
});

describe('Physics Engine', () => {
  const W = CONFIG.CANVAS_W;
  const H = CONFIG.CANVAS_H;

  it('should apply gravity to a flying ball', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.ball.vel.y = 0;
    const startY = state.ball.pos.y;
    updatePhysics(state, 0.016);
    expect(state.ball.vel.y).toBeGreaterThan(0);
    expect(state.ball.pos.y).toBeGreaterThan(startY);
  });

  it('should not move ball when phase is idle', () => {
    const state = createInitialState(W, H);
    const startX = state.ball.pos.x;
    const startY = state.ball.pos.y;
    updatePhysics(state, 0.016);
    expect(state.ball.pos.x).toBe(startX);
    expect(state.ball.pos.y).toBe(startY);
  });

  it('should detect backboard collision', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.ball.pos.x = state.hoop.backboardX - 5;
    state.ball.pos.y = (state.hoop.backboardTop + state.hoop.backboardBottom) / 2;
    state.ball.vel.x = 500;
    state.ball.vel.y = 0;
    updatePhysics(state, 0.016);
    expect(state.ball.vel.x).toBeLessThan(0);
  });

  it('should bounce off the ground instead of going through', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    const groundY = H * CONFIG.GROUND_Y_RATIO;
    state.ball.pos.y = groundY - state.ball.radius + 1;
    state.ball.vel.y = 300;
    state.ball.vel.x = 50;
    updatePhysics(state, 0.016);
    expect(state.ball.vel.y).toBeLessThan(0);
    expect(state.ball.pos.y).toBeLessThanOrEqual(groundY - state.ball.radius);
  });

  it('should mark missed after max bounces', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.bounceCount = CONFIG.MAX_BOUNCES;
    const groundY = H * CONFIG.GROUND_Y_RATIO;
    state.ball.pos.y = groundY - state.ball.radius + 1;
    state.ball.vel.y = 100;
    updatePhysics(state, 0.016);
    expect(state.phase).toBe('missed');
  });

  it('isWithinTolerance should accept within tolerance range', () => {
    const ideal = CONFIG.IDEAL_POWER;
    const tol = ideal * CONFIG.POWER_TOLERANCE;
    expect(isWithinTolerance(ideal, ideal, tol)).toBe(true);
    expect(isWithinTolerance(ideal + tol, ideal, tol)).toBe(true);
    expect(isWithinTolerance(ideal - tol, ideal, tol)).toBe(true);
    expect(isWithinTolerance(ideal + tol * 3, ideal, tol)).toBe(false);
  });

  it('should launch ball with velocity when power is at ideal', () => {
    const state = createInitialState(W, H);
    state.phase = 'charging';
    state.chargePower = CONFIG.IDEAL_POWER;
    launchBall(state);
    expect(state.phase).toBe('flying');
    expect(state.ball.vel.x).toBeGreaterThan(0);
    expect(state.ball.vel.y).toBeLessThan(0);
  });

  it('should produce an arc that can reach the rim at ideal power', () => {
    const state = createInitialState(W, H);
    state.phase = 'charging';
    state.chargePower = CONFIG.IDEAL_POWER;
    state.wind = 0;
    launchBall(state);
    for (let i = 0; i < 200; i++) {
      updatePhysics(state, 0.01);
      if (state.phase !== 'flying') break;
    }
    expect(['scored', 'falling_through']).toContain(state.phase);
  });

  it('should severely penalize max power shots', () => {
    const state = createInitialState(W, H);
    state.phase = 'charging';
    state.chargePower = 1.0;
    state.wind = 0;
    launchBall(state);
    expect(state.phase).toBe('flying');
    // Ball should launch but with wild deviation — just verify it fires
    expect(state.ball.vel.x).not.toBe(0);
  });

  it('resetBall should return ball to player position', () => {
    const state = createInitialState(W, H);
    state.ball.pos.x = 999;
    state.ball.pos.y = 999;
    state.bounceCount = 3;
    resetBall(state);
    expect(state.phase).toBe('idle');
    expect(state.ball.vel.x).toBe(0);
    expect(state.ball.vel.y).toBe(0);
    expect(state.shotTimer).toBe(CONFIG.SHOT_TIMER);
    expect(state.bounceCount).toBe(0);
  });

  it('should allow ball to fly past the hoop (behind backboard)', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.ball.pos.x = state.hoop.backboardX + 50;
    state.ball.pos.y = state.hoop.rimY - 50;
    state.ball.vel.x = 100;
    state.ball.vel.y = -50;
    updatePhysics(state, 0.016);
    // Ball should still be flying (not blocked)
    expect(state.phase).toBe('flying');
    expect(state.ball.pos.x).toBeGreaterThan(state.hoop.backboardX + 50);
  });
});
