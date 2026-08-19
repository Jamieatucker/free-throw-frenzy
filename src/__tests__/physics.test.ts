import { createInitialState, resetBall } from '../engine/gameState';
import { updatePhysics, launchBall, isWithinTolerance } from '../engine/physics';
import { CONFIG } from '../engine/config';

// Mock audio to avoid Web Audio API in tests
jest.mock('../engine/audio', () => ({
  playSound: jest.fn(),
}));

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

  it('should mark missed when ball goes out of bounds', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.ball.pos.y = H * CONFIG.GROUND_Y_RATIO + 50;
    state.ball.vel.y = 100;

    updatePhysics(state, 0.016);

    expect(state.phase).toBe('missed');
    expect(state.streak).toBe(0);
  });

  it('isWithinTolerance should accept within tolerance range', () => {
    const ideal = CONFIG.IDEAL_POWER;
    const tol = ideal * CONFIG.POWER_TOLERANCE;
    expect(isWithinTolerance(ideal, ideal)).toBe(true);
    expect(isWithinTolerance(ideal + tol, ideal)).toBe(true);
    expect(isWithinTolerance(ideal - tol, ideal)).toBe(true);
    expect(isWithinTolerance(ideal + tol * 3, ideal)).toBe(false);
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

    // Simulate ~2 seconds of flight
    let maxY = state.ball.pos.y;
    for (let i = 0; i < 200; i++) {
      updatePhysics(state, 0.01);
      if (state.ball.pos.y < maxY) maxY = state.ball.pos.y;
      if (state.phase !== 'flying') break;
    }

    expect(state.phase).toBe('scored');
  });

  it('resetBall should return ball to player position', () => {
    const state = createInitialState(W, H);
    state.ball.pos.x = 999;
    state.ball.pos.y = 999;

    resetBall(state);

    expect(state.phase).toBe('idle');
    expect(state.ball.vel.x).toBe(0);
    expect(state.ball.vel.y).toBe(0);
    expect(state.shotTimer).toBe(CONFIG.SHOT_TIMER);
  });
});
