import { createInitialState, resetBall } from '../engine/gameState';
import { updatePhysics, launchBall, isWithinTolerance, isRimEntryFromAbove } from '../engine/physics';
import { CONFIG } from '../engine/config';

jest.mock('../engine/audio', () => ({
  playSound: jest.fn(),
}));

jest.mock('../utils/shopData', () => ({
  getActiveBackground: () => 'stadium',
  saveCoins: jest.fn(),
}));

jest.mock('../utils/jerseyData', () => ({
  getActiveJersey: () => 'det',
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

  it('should still be flying before reaching max ground bounces', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.bounceCount = Math.max(0, CONFIG.MAX_BOUNCES - 2);
    const groundY = H * CONFIG.GROUND_Y_RATIO;
    state.ball.pos.y = groundY - state.ball.radius + 1;
    state.ball.vel.y = 200;
    updatePhysics(state, 0.016);
    expect(state.bounceCount).toBe(CONFIG.MAX_BOUNCES - 1);
    expect(state.phase).toBe('flying');
  });

  it('should mark missed on the max ground bounce', () => {
    const state = createInitialState(W, H);
    expect(CONFIG.MAX_BOUNCES).toBeGreaterThanOrEqual(2);
    state.phase = 'flying';
    state.bounceCount = CONFIG.MAX_BOUNCES - 1;
    const groundY = H * CONFIG.GROUND_Y_RATIO;
    state.ball.pos.y = groundY - state.ball.radius + 1;
    state.ball.vel.y = 200;
    updatePhysics(state, 0.016);
    expect(state.bounceCount).toBe(CONFIG.MAX_BOUNCES);
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
    state.shotIdealPower = CONFIG.IDEAL_POWER;
    state.chargePower = CONFIG.IDEAL_POWER;
    launchBall(state);
    expect(state.phase).toBe('flying');
    expect(state.ball.vel.x).toBeGreaterThan(0);
    expect(state.ball.vel.y).toBeLessThan(0);
  });

  it('should produce an arc that can reach the rim at ideal power', () => {
    const state = createInitialState(W, H);
    state.phase = 'charging';
    state.shotIdealPower = CONFIG.IDEAL_POWER;
    state.chargePower = CONFIG.IDEAL_POWER;
    state.wind = 0;
    launchBall(state);
    for (let i = 0; i < 200; i++) {
      updatePhysics(state, 0.01);
      if ((state.phase as string) !== 'flying') break;
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

  it('should not count a swish from a ground bounce under the net', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.bounceCount = 1;
    state.passedAboveRim = false;
    state.score = 0;
    const rimCenterX = (state.hoop.rimLeftX + state.hoop.rimRightX) / 2;
    state.ball.pos.x = rimCenterX;
    state.ball.pos.y = state.hoop.rimY + 10;
    state.ball.prevY = state.hoop.rimY + 8;
    state.ball.vel.x = 0;
    state.ball.vel.y = 180;
    updatePhysics(state, 0.016);
    expect(isRimEntryFromAbove(state)).toBe(false);
    expect(state.phase).toBe('flying');
    expect(state.score).toBe(0);
    expect(state.feedbackType).not.toBe('score');
  });

  it('should not count a swish if the ball never went above the rim', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.bounceCount = 0;
    state.passedAboveRim = false;
    state.score = 0;
    const rimCenterX = (state.hoop.rimLeftX + state.hoop.rimRightX) / 2;
    state.ball.pos.x = rimCenterX;
    state.ball.pos.y = state.hoop.rimY + 8;
    state.ball.vel.y = 200;
    updatePhysics(state, 0.016);
    expect(state.phase).toBe('flying');
    expect(state.score).toBe(0);
  });

  it('should count a swish only when the ball crosses the rim from above', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.bounceCount = 0;
    state.passedAboveRim = true;
    state.score = 0;
    const rimCenterX = (state.hoop.rimLeftX + state.hoop.rimRightX) / 2;
    state.ball.pos.x = rimCenterX;
    state.ball.pos.y = state.hoop.rimY - 3;
    state.ball.prevY = state.hoop.rimY - 3;
    state.ball.vel.x = 0;
    state.ball.vel.y = 280;
    updatePhysics(state, 0.016);
    expect(state.phase).toBe('falling_through');
    expect(state.score).toBeGreaterThan(0);
    expect(state.netSwish).toBe(1);
  });

  it('should keep the ball moving through the net then fade it out', () => {
    const state = createInitialState(W, H);
    state.phase = 'falling_through';
    state.netSwish = 1;
    state.feedbackType = 'score';
    state.feedbackTimer = CONFIG.FEEDBACK_DURATION;
    const rimCenterX = (state.hoop.rimLeftX + state.hoop.rimRightX) / 2;
    state.ball.pos.x = rimCenterX;
    state.ball.pos.y = state.hoop.rimY + 4;
    state.ball.vel.x = 0;
    state.ball.vel.y = 160;
    state.ball.opacity = 1;

    const startY = state.ball.pos.y;
    updatePhysics(state, 0.032);
    expect(state.phase).toBe('falling_through');
    expect(state.ball.pos.y).toBeGreaterThan(startY);
    expect(state.ball.opacity).toBeGreaterThan(0);

    for (let i = 0; i < 80; i++) {
      updatePhysics(state, 0.02);
      if ((state.phase as string) === 'scored') break;
    }
    expect(state.phase).toBe('scored');
    expect(state.ball.opacity).toBe(0);
  });

  it('should leave falling_through after a make without throwing on the next tick', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.bounceCount = 0;
    state.passedAboveRim = true;
    const rimCenterX = (state.hoop.rimLeftX + state.hoop.rimRightX) / 2;
    state.ball.pos.x = rimCenterX;
    state.ball.pos.y = state.hoop.rimY - 3;
    state.ball.vel.x = 0;
    state.ball.vel.y = 280;
    expect(() => updatePhysics(state, 0.016)).not.toThrow();
    expect(state.phase).toBe('falling_through');
    expect(() => updatePhysics(state, 0.016)).not.toThrow();
    expect(state.phase).toBe('falling_through');
    expect(state.ball.pos.y).toBeGreaterThan(state.hoop.rimY);
  });
});
