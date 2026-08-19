import { createInitialState, resetBall } from '../engine/gameState';
import { updatePhysics, launchBall, isWithinTolerance } from '../engine/physics';

describe('Physics Engine', () => {
  const W = 900;
  const H = 500;

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
    state.ball.pos.y = H * 0.82 + 50;
    state.ball.vel.y = 100;

    updatePhysics(state, 0.016);

    expect(state.phase).toBe('missed');
    expect(state.streak).toBe(0);
  });

  it('isWithinTolerance should accept ±3% of ideal', () => {
    expect(isWithinTolerance(0.72, 0.72)).toBe(true);
    expect(isWithinTolerance(0.74, 0.72)).toBe(true);
    expect(isWithinTolerance(0.70, 0.72)).toBe(true);
    expect(isWithinTolerance(0.80, 0.72)).toBe(false);
  });

  it('should launch ball with velocity when power is set', () => {
    const state = createInitialState(W, H);
    state.phase = 'charging';
    state.chargePower = 0.72;

    launchBall(state);

    expect(state.phase).toBe('flying');
    expect(state.ball.vel.x).not.toBe(0);
    expect(state.ball.vel.y).not.toBe(0);
  });

  it('resetBall should return ball to player position', () => {
    const state = createInitialState(W, H);
    state.ball.pos.x = 999;
    state.ball.pos.y = 999;

    resetBall(state);

    expect(state.phase).toBe('idle');
    expect(state.ball.vel.x).toBe(0);
    expect(state.ball.vel.y).toBe(0);
    expect(state.shotTimer).toBe(10);
  });
});
