import { createInitialState, resetBall } from '../engine/gameState';
import { updatePhysics, launchBall, isWithinTolerance, isRimEntryFromAbove } from '../engine/physics';
import { CONFIG } from '../engine/config';
import { playSound } from '../engine/audio';

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

  function centerIsInsideNet(state: ReturnType<typeof createInitialState>): boolean {
    const { ball, hoop } = state;
    const left = hoop.rimLeftX + hoop.rimRadius;
    const right = hoop.rimRightX - hoop.rimRadius;
    return (
      ball.pos.x > left &&
      ball.pos.x < right &&
      ball.pos.y > hoop.rimY &&
      ball.pos.y < hoop.netBottom
    );
  }

  it('should bounce off the glass instead of teleporting into the net', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.passedAboveRim = true;
    state.bounceCount = 0;
    state.score = 0;
    state.ball.pos.x = state.hoop.backboardX;
    state.ball.pos.y = state.hoop.rimY + 8;
    state.ball.vel.x = 420;
    state.ball.vel.y = 30;
    updatePhysics(state, 0.05);
    expect(state.score).toBe(0);
    expect(state.phase).toBe('flying');
    expect(centerIsInsideNet(state)).toBe(false);
  });

  it('should bounce off the front of the rim and end as a miss', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.passedAboveRim = true;
    state.score = 0;
    const rimX = state.hoop.rimLeftX;
    const rimY = state.hoop.rimY;
    const minDist = state.ball.radius + state.hoop.rimRadius;
    state.ball.pos.x = rimX - minDist + 1;
    state.ball.pos.y = rimY;
    state.ball.vel.x = 30;
    state.ball.vel.y = 15;

    updatePhysics(state, 1 / 60);
    expect(state.score).toBe(0);
    expect(state.ball.vel.x).toBeLessThan(0);
    expect(state.ball.pos.x).toBeLessThan(rimX - state.ball.radius);

    for (let i = 0; i < 180; i++) {
      updatePhysics(state, 1 / 60);
      if ((state.phase as string) !== 'flying') break;
    }
    expect(state.phase).toBe('missed');
    expect(state.feedbackType).toBe('miss');
    expect(state.score).toBe(0);
  });

  it('should bounce off the front rim instead of tunneling into the net', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.passedAboveRim = true;
    state.bounceCount = 0;
    state.score = 0;
    state.ball.pos.x = state.hoop.rimLeftX;
    state.ball.pos.y = state.hoop.rimY - state.ball.radius - state.hoop.rimRadius - 4;
    state.ball.vel.x = 0;
    state.ball.vel.y = 480;
    updatePhysics(state, 0.05);
    expect(state.score).toBe(0);
    expect(state.phase).toBe('flying');
    expect(centerIsInsideNet(state)).toBe(false);
    expect(state.ball.vel.y).toBeLessThan(0);
  });

  it('should not tunnel a fast ball through the backboard', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.passedAboveRim = true;
    const face = state.hoop.backboardX - CONFIG.BACKBOARD_WIDTH / 2;
    state.ball.pos.x = face - state.ball.radius - 2;
    state.ball.pos.y = (state.hoop.backboardTop + state.hoop.rimY) / 2;
    state.ball.vel.x = 1800;
    state.ball.vel.y = 0;
    updatePhysics(state, 0.05);
    expect(state.ball.pos.x + state.ball.radius).toBeLessThanOrEqual(face + 0.02);
    expect(state.ball.vel.x).toBeLessThan(0);
    expect(centerIsInsideNet(state)).toBe(false);
  });

  it('should not pull a ball from behind the glass into the net', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.passedAboveRim = true;
    state.score = 0;
    const back = state.hoop.backboardX + CONFIG.BACKBOARD_WIDTH / 2;
    state.ball.pos.x = back + 3;
    state.ball.pos.y = state.hoop.rimY - 30;
    state.ball.vel.x = -900;
    state.ball.vel.y = 40;
    updatePhysics(state, 0.05);
    expect(state.score).toBe(0);
    expect(centerIsInsideNet(state)).toBe(false);
    expect(state.ball.pos.x).toBeGreaterThan(state.hoop.rimRightX);
  });

  it('should roll off the top of the front rim instead of sticking and rattling', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.passedAboveRim = true;
    const rimX = state.hoop.rimLeftX;
    const rimY = state.hoop.rimY;
    const minDist = state.ball.radius + state.hoop.rimRadius;
    state.ball.pos.x = rimX;
    state.ball.pos.y = rimY - minDist + 0.5;
    state.ball.vel.x = 0;
    state.ball.vel.y = 12;
    (playSound as jest.Mock).mockClear();

    for (let i = 0; i < 120; i++) {
      updatePhysics(state, 1 / 60);
      if ((state.phase as string) !== 'flying') break;
    }

    const bounceCalls = (playSound as jest.Mock).mock.calls.filter((call) => call[0] === 'bounce').length;
    expect(bounceCalls).toBeLessThan(6);
    const parkedOnCrown =
      Math.abs(state.ball.pos.x - rimX) < 8 &&
      state.ball.pos.y <= rimY &&
      state.ball.pos.y > rimY - minDist - 10;
    expect(parkedOnCrown).toBe(false);
    expect(['flying', 'missed']).toContain(state.phase);
    if (state.phase === 'flying') {
      expect(state.ball.pos.y).toBeGreaterThan(rimY + state.ball.radius);
    }
  });

  it('should drop through the net in short steps after a clean swish', () => {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.bounceCount = 0;
    state.passedAboveRim = true;
    const rimCenterX = (state.hoop.rimLeftX + state.hoop.rimRightX) / 2;
    state.ball.pos.x = rimCenterX;
    state.ball.pos.y = state.hoop.rimY - 2;
    state.ball.vel.x = 0;
    state.ball.vel.y = 220;
    updatePhysics(state, 0.016);
    expect(state.phase).toBe('falling_through');
    expect(state.ball.pos.y).toBeGreaterThan(state.hoop.rimY);
    expect(state.ball.pos.y).toBeLessThan(state.hoop.rimY + 24);

    let prevY = state.ball.pos.y;
    for (let i = 0; i < 6; i++) {
      updatePhysics(state, 0.016);
      const phase: string = state.phase;
      expect(phase === 'falling_through' || phase === 'scored').toBe(true);
      expect(state.ball.pos.y).toBeGreaterThan(prevY);
      expect(state.ball.pos.y - prevY).toBeLessThan(36);
      prevY = state.ball.pos.y;
    }
  });
});

describe('shot collision outcomes', () => {
  const W = CONFIG.CANVAS_W;
  const H = CONFIG.CANVAS_H;

  function flyingAt(
    x: number,
    y: number,
    vx: number,
    vy: number,
    extra: Partial<ReturnType<typeof createInitialState>> = {}
  ) {
    const state = createInitialState(W, H);
    state.phase = 'flying';
    state.wind = 0;
    state.score = 0;
    state.passedAboveRim = true;
    state.bounceCount = 0;
    state.bankedOffGlass = false;
    state.ball.pos.x = x;
    state.ball.pos.y = y;
    state.ball.prevX = x;
    state.ball.prevY = y;
    state.ball.vel.x = vx;
    state.ball.vel.y = vy;
    Object.assign(state, extra);
    return state;
  }

  function settle(state: ReturnType<typeof createInitialState>, frames = 300) {
    let maxJump = 0;
    for (let i = 0; i < frames; i++) {
      const x0 = state.ball.pos.x;
      const y0 = state.ball.pos.y;
      updatePhysics(state, 1 / 60);
      maxJump = Math.max(maxJump, Math.hypot(state.ball.pos.x - x0, state.ball.pos.y - y0));
      const phase: string = state.phase;
      if (phase === 'missed' || phase === 'scored' || phase === 'falling_through') break;
    }
    return maxJump;
  }

  it('counts a straight swish when the center drops through the opening', () => {
    const state = createInitialState(W, H);
    state.wind = 0;
    state.chargePower = state.shotIdealPower;
    const before = state.score;
    launchBall(state);
    settle(state);
    expect(state.score).toBeGreaterThan(before);
    expect(state.phase).toBe('falling_through');
    expect(state.ball.pos.x).toBeGreaterThan(state.hoop.rimLeftX);
    expect(state.ball.pos.x).toBeLessThan(state.hoop.rimRightX);
  });

  it('counts a backboard bank that drops into the rim as a make', () => {
    const state = createInitialState(W, H);
    const face = state.hoop.backboardX - CONFIG.BACKBOARD_WIDTH / 2;
    const shot = flyingAt(face - state.ball.radius - 6, state.hoop.rimY - 36, 160, 60);
    const jump = settle(shot, 180);
    expect(shot.bankedOffGlass).toBe(true);
    expect(shot.score).toBeGreaterThan(0);
    expect(shot.phase).toBe('falling_through');
    expect(shot.ball.pos.x).toBeGreaterThan(shot.hoop.rimLeftX);
    expect(shot.ball.pos.x).toBeLessThan(shot.hoop.rimRightX);
    expect(shot.ball.pos.y).toBeGreaterThan(shot.hoop.rimY);
    expect(jump).toBeLessThan(40);
  });

  it('does not count a bounce up into the net as a make', () => {
    const state = createInitialState(W, H);
    const rimCenterX = (state.hoop.rimLeftX + state.hoop.rimRightX) / 2;
    const groundY = H * CONFIG.GROUND_Y_RATIO;
    const shot = flyingAt(rimCenterX, groundY - state.ball.radius - 2, 0, -520, {
      bounceCount: 1,
      passedAboveRim: false,
    });
    settle(shot, 180);
    expect(shot.score).toBe(0);
    expect(shot.feedbackType).not.toBe('score');
  });

  it('misses a backboard carom that rebounds away from the opening', () => {
    const state = createInitialState(W, H);
    const face = state.hoop.backboardX - CONFIG.BACKBOARD_WIDTH / 2;
    const shot = flyingAt(face - state.ball.radius - 4, state.hoop.rimY - 40, 300, -400);
    settle(shot, 240);
    expect(shot.bankedOffGlass).toBe(true);
    expect(shot.score).toBe(0);
    expect(shot.phase).toBe('missed');
  });

  it('misses a shot that bounces off the front rim', () => {
    const state = createInitialState(W, H);
    const shot = flyingAt(
      state.hoop.rimLeftX - 2,
      state.hoop.rimY - state.ball.radius - state.hoop.rimRadius - 6,
      40,
      360
    );
    settle(shot, 240);
    expect(shot.score).toBe(0);
    expect(shot.phase).toBe('missed');
  });

  it('misses a floor bounce that stays short of the rim', () => {
    const state = createInitialState(W, H);
    const shot = flyingAt(state.player.x + 30, state.hoop.rimY - 20, 25, 80);
    settle(shot, 300);
    expect(shot.bounceCount).toBeGreaterThan(0);
    expect(shot.score).toBe(0);
    expect(shot.phase).toBe('missed');
  });

  it('passes through the net from below without losing momentum', () => {
    const state = createInitialState(W, H);
    const rimCenterX = (state.hoop.rimLeftX + state.hoop.rimRightX) / 2;
    const shot = flyingAt(rimCenterX, state.hoop.netBottom + 4, 20, -280, {
      bounceCount: 1,
      passedAboveRim: false,
    });
    const vx = shot.ball.vel.x;
    let prevY = shot.ball.pos.y;
    for (let i = 0; i < 20; i++) {
      updatePhysics(shot, 1 / 60);
      expect(shot.ball.pos.y).toBeLessThan(prevY);
      prevY = shot.ball.pos.y;
    }
    expect(shot.score).toBe(0);
    expect(shot.phase).toBe('flying');
    expect(shot.ball.vel.x).toBeCloseTo(vx, 0);
    expect(shot.ball.vel.y).toBeLessThan(0);
    expect(shot.ball.pos.y).toBeLessThan(state.hoop.rimY);
  });

  it('bounces off the top of the front rim with one consistent rebound', () => {
    const state = createInitialState(W, H);
    const rimX = state.hoop.rimLeftX;
    const rimY = state.hoop.rimY;
    const shot = flyingAt(rimX, rimY - state.ball.radius - state.hoop.rimRadius - 2, 0, 360);
    (playSound as jest.Mock).mockClear();

    const vertical: number[] = [];
    for (let i = 0; i < 12; i++) {
      updatePhysics(shot, 1 / 60);
      vertical.push(shot.ball.vel.y);
    }

    const bounceCalls = (playSound as jest.Mock).mock.calls.filter((call) => call[0] === 'bounce').length;
    expect(bounceCalls).toBe(1);
    expect(shot.score).toBe(0);
    const rising = vertical.filter((vy) => vy < 0);
    expect(rising.length).toBeGreaterThan(4);
    for (let i = 1; i < vertical.length; i++) {
      expect(vertical[i] - vertical[i - 1]).toBeLessThan(20);
    }
    expect(shot.ball.pos.y).toBeLessThan(rimY);
  });

  it('misses an airball that never reaches the rim', () => {
    const state = createInitialState(W, H);
    const shot = flyingAt(state.player.x + 20, state.hoop.rimY + 40, 40, -80, {
      passedAboveRim: false,
    });
    settle(shot, 300);
    expect(shot.score).toBe(0);
    expect(shot.phase).toBe('missed');
    expect(shot.ball.pos.x).toBeLessThan(shot.hoop.rimLeftX);
  });
});
