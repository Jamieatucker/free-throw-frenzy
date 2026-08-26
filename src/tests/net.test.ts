import { createInitialState, resetBall } from '../engine/gameState';
import { updatePhysics, launchBall } from '../engine/physics';
import { CONFIG } from '../engine/config';
import {
  computeNetCords,
  computeNetBands,
  isBallPassingThroughNet,
  getNetStretch,
} from '../engine/net';

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

const W = CONFIG.CANVAS_W;
const H = CONFIG.CANVAS_H;

describe('Net swish', () => {
  it('idle cords attach to the rim and taper at the hem', () => {
    const state = createInitialState(W, H);
    const cords = computeNetCords(state, 0);
    expect(cords.length).toBe(CONFIG.NET_CORD_COUNT + 1);
    expect(cords.some((c) => c.layer === 'front')).toBe(true);
    expect(cords.some((c) => c.layer === 'back')).toBe(true);
    for (const cord of cords) {
      expect(cord.topY).toBeCloseTo(state.hoop.rimY + 3);
      expect(cord.topX).toBeGreaterThanOrEqual(state.hoop.rimLeftX - 0.01);
      expect(cord.topX).toBeLessThanOrEqual(state.hoop.rimRightX + 0.01);
      expect(cord.bottomX).toBeGreaterThan(state.hoop.rimLeftX);
      expect(cord.bottomX).toBeLessThan(state.hoop.rimRightX);
    }
  });

  it('should not wrap around the ball while idle', () => {
    const state = createInitialState(W, H);
    expect(state.netSwish).toBe(0);
    expect(isBallPassingThroughNet(state)).toBe(false);
    expect(getNetStretch(state)).toBeCloseTo(0);
  });

  it('should wrap cords around the ball while it falls through the net', () => {
    const state = createInitialState(W, H);
    const rimCenterX = (state.hoop.rimLeftX + state.hoop.rimRightX) / 2;
    state.phase = 'falling_through';
    state.netSwish = 1;
    state.ball.pos.x = rimCenterX;
    state.ball.pos.y = (state.hoop.rimY + state.hoop.netBottom) / 2;
    expect(isBallPassingThroughNet(state)).toBe(true);

    const cords = computeNetCords(state, 0);
    const left = cords.filter((c) => c.topX < rimCenterX);
    const right = cords.filter((c) => c.topX > rimCenterX);
    const minDist = state.ball.radius + CONFIG.NET_WRAP_PADDING - 0.5;
    expect(left.some((c) => c.midX <= state.ball.pos.x - minDist + 2)).toBe(true);
    expect(right.some((c) => c.midX >= state.ball.pos.x + minDist - 2)).toBe(true);
    for (const cord of cords) {
      const d = Math.hypot(cord.midX - state.ball.pos.x, cord.midY - state.ball.pos.y);
      expect(d).toBeGreaterThanOrEqual(state.ball.radius - 0.5);
    }
  });

  it('should open a gap in the net bands where the ball is', () => {
    const state = createInitialState(W, H);
    const rimCenterX = (state.hoop.rimLeftX + state.hoop.rimRightX) / 2;
    state.phase = 'falling_through';
    state.netSwish = 1;
    state.ball.pos.x = rimCenterX;
    state.ball.pos.y = state.hoop.rimY + 20;
    const bands = computeNetBands(state);
    const gapped = bands.filter((b) => b.gapLeftX !== null);
    expect(gapped.length).toBeGreaterThan(0);
    expect(gapped.some((b) => b.layer === 'front')).toBe(true);
    for (const band of gapped) {
      expect(band.gapLeftX!).toBeLessThan(rimCenterX);
      expect(band.gapRightX!).toBeGreaterThan(rimCenterX);
    }
  });

  it('should stretch the net further as the ball pushes out the bottom', () => {
    const state = createInitialState(W, H);
    state.phase = 'falling_through';
    state.netSwish = 1;
    const rimCenterX = (state.hoop.rimLeftX + state.hoop.rimRightX) / 2;
    state.ball.pos.x = rimCenterX;
    state.ball.pos.y = state.hoop.netBottom - 4;
    const early = getNetStretch(state);
    state.ball.pos.y = state.hoop.netBottom + 16;
    const late = getNetStretch(state);
    expect(late).toBeGreaterThan(early);
  });

  it('launching a make should start the net swish', () => {
    const state = createInitialState(W, H);
    state.phase = 'charging';
    state.shotIdealPower = CONFIG.IDEAL_POWER;
    state.chargePower = CONFIG.IDEAL_POWER;
    state.wind = 0;
    launchBall(state);
    for (let i = 0; i < 200; i++) {
      updatePhysics(state, 0.01);
      if ((state.phase as string) === 'falling_through') break;
    }
    expect(state.phase).toBe('falling_through');
    expect(state.netSwish).toBe(1);
    expect(isBallPassingThroughNet(state)).toBe(true);
  });

  it('resetBall should clear net swish', () => {
    const state = createInitialState(W, H);
    state.netSwish = 1;
    resetBall(state);
    expect(state.netSwish).toBe(0);
  });
});
