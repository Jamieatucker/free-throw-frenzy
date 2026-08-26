import { createInitialState, resetBall } from '../engine/gameState';
import { updatePhysics, launchBall } from '../engine/physics';
import { CONFIG } from '../engine/config';
import {
  createCamera,
  resetCamera,
  updateCamera,
  getCameraTargetY,
  getCameraTargetX,
  isBallInHorizontalView,
  worldToScreen,
  screenToWorld,
  getVisibleWorldBounds,
  isBallVerticallyOnScreen,
  isBallOnScreen,
  applyCameraTransform,
} from '../engine/camera';
import { GameState } from '../types/game';

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

function makeState(): GameState {
  return createInitialState(W, H, 'medium');
}

function snapCamera(state: GameState): void {
  state.camera.x = getCameraTargetX(state);
  state.camera.y = getCameraTargetY(state);
}

function settleCamera(state: GameState): void {
  for (let i = 0; i < 12; i++) {
    updateCamera(state, 0.2);
  }
}

describe('Camera', () => {
  it('createCamera should start at rest framing', () => {
    const cam = createCamera();
    expect(cam.x).toBe(CONFIG.CAMERA_REST_X);
    expect(cam.y).toBe(CONFIG.CAMERA_REST_Y);
  });

  it('createInitialState should include a rest camera', () => {
    const state = makeState();
    expect(state.camera.x).toBe(0);
    expect(state.camera.y).toBe(0);
  });

  it('resetCamera should restore rest position from an offset', () => {
    const cam = createCamera();
    cam.x = 40;
    cam.y = -120;
    resetCamera(cam);
    expect(cam.x).toBe(CONFIG.CAMERA_REST_X);
    expect(cam.y).toBe(CONFIG.CAMERA_REST_Y);
  });

  it('should stay at rest while idle even if the ball is above the canvas', () => {
    const state = makeState();
    state.phase = 'idle';
    state.ball.pos.y = -80;
    expect(getCameraTargetY(state)).toBe(CONFIG.CAMERA_REST_Y);
    settleCamera(state);
    expect(state.camera.y).toBe(CONFIG.CAMERA_REST_Y);
  });

  it('should stay at rest while charging', () => {
    const state = makeState();
    state.phase = 'charging';
    state.ball.pos.y = -80;
    expect(getCameraTargetY(state)).toBe(CONFIG.CAMERA_REST_Y);
  });

  it('should not pan when a flying ball is still inside the default view', () => {
    const state = makeState();
    state.phase = 'flying';
    state.ball.pos.y = 200;
    state.ball.vel.y = 0;
    expect(getCameraTargetY(state)).toBe(CONFIG.CAMERA_REST_Y);
  });

  it('should pan up so a high-arc ball stays below the top margin', () => {
    const state = makeState();
    state.phase = 'flying';
    state.ball.pos.x = W * 0.4;
    state.ball.pos.y = -80;
    state.ball.vel.y = 0;
    const target = getCameraTargetY(state);
    expect(target).toBeLessThan(CONFIG.CAMERA_REST_Y);
    expect(target).toBe(state.ball.pos.y - state.ball.radius - CONFIG.CAMERA_TOP_MARGIN);

    snapCamera(state);
    const screen = worldToScreen(state.camera, state.ball.pos.x, state.ball.pos.y);
    expect(screen.y - state.ball.radius).toBeCloseTo(CONFIG.CAMERA_TOP_MARGIN);
    expect(isBallVerticallyOnScreen(state)).toBe(true);
  });

  it('should never pan horizontally — target X is always rest', () => {
    const state = makeState();
    state.phase = 'flying';
    state.ball.pos.x = W + 400;
    state.ball.pos.y = -120;
    expect(getCameraTargetX(state)).toBe(CONFIG.CAMERA_REST_X);
    updateCamera(state, 1);
    expect(state.camera.x).toBe(CONFIG.CAMERA_REST_X);
  });

  it('should not follow a shot that overshoots off the right of the screen', () => {
    const state = makeState();
    state.phase = 'flying';
    state.ball.pos.x = W + state.ball.radius + 20;
    state.ball.pos.y = -90;
    state.ball.vel.y = -200;
    expect(isBallInHorizontalView(state)).toBe(false);
    expect(getCameraTargetY(state)).toBe(CONFIG.CAMERA_REST_Y);
    settleCamera(state);
    expect(state.camera.y).toBe(CONFIG.CAMERA_REST_Y);
    expect(state.camera.x).toBe(CONFIG.CAMERA_REST_X);
  });

  it('should not follow a ball that bounces off the left of the screen', () => {
    const state = makeState();
    state.phase = 'flying';
    state.ball.pos.x = -state.ball.radius - 10;
    state.ball.pos.y = -60;
    expect(isBallInHorizontalView(state)).toBe(false);
    expect(getCameraTargetY(state)).toBe(CONFIG.CAMERA_REST_Y);
  });

  it('should still follow a high ball that remains horizontally on screen', () => {
    const state = makeState();
    state.phase = 'flying';
    state.ball.pos.x = W * 0.5;
    state.ball.pos.y = -40;
    expect(isBallInHorizontalView(state)).toBe(true);
    expect(getCameraTargetY(state)).toBeLessThan(0);
  });

  it('should return to rest when the phase becomes missed', () => {
    const state = makeState();
    state.phase = 'flying';
    state.ball.pos.y = -100;
    snapCamera(state);
    expect(state.camera.y).toBeLessThan(0);

    state.phase = 'missed';
    expect(getCameraTargetY(state)).toBe(CONFIG.CAMERA_REST_Y);
    settleCamera(state);
    expect(state.camera.y).toBeCloseTo(CONFIG.CAMERA_REST_Y, 5);
  });

  it('should return to rest when the phase becomes scored', () => {
    const state = makeState();
    state.camera.y = -90;
    state.phase = 'scored';
    settleCamera(state);
    expect(state.camera.y).toBeCloseTo(CONFIG.CAMERA_REST_Y, 5);
  });

  it('updateCamera should lerp toward the target rather than snap in one short frame', () => {
    const state = makeState();
    state.phase = 'flying';
    state.ball.pos.x = W * 0.4;
    // Slightly above the top margin so we pan, but not so high that the
    // visibility clamp has to snap in a single frame.
    state.ball.pos.y = CONFIG.CAMERA_TOP_MARGIN;
    state.ball.vel.y = 0;
    const target = getCameraTargetY(state);
    expect(target).toBeLessThan(CONFIG.CAMERA_REST_Y);
    updateCamera(state, 0.016);
    expect(state.camera.y).toBeLessThan(CONFIG.CAMERA_REST_Y);
    expect(state.camera.y).toBeGreaterThan(target);
  });

  it('should snap far enough in one frame that a teleported high ball is still on screen', () => {
    const state = makeState();
    state.phase = 'flying';
    state.ball.pos.x = W * 0.4;
    state.ball.pos.y = -200;
    state.ball.vel.y = 0;
    updateCamera(state, 0.016);
    expect(isBallVerticallyOnScreen(state)).toBe(true);
    expect(state.camera.x).toBe(CONFIG.CAMERA_REST_X);
  });

  it('updateCamera should never pan below the default rest Y', () => {
    const state = makeState();
    state.camera.y = 40;
    state.phase = 'idle';
    updateCamera(state, 1);
    expect(state.camera.y).toBeLessThanOrEqual(CONFIG.CAMERA_REST_Y);
  });

  it('should look ahead while the ball is rising so the camera leads the arc', () => {
    const state = makeState();
    state.phase = 'flying';
    state.ball.pos.x = W * 0.4;
    state.ball.pos.y = -20;
    state.ball.vel.y = 0;
    const atApex = getCameraTargetY(state);

    state.ball.vel.y = -400;
    const rising = getCameraTargetY(state);
    expect(rising).toBeLessThan(atApex);
  });

  it('worldToScreen and screenToWorld should be inverses', () => {
    const cam = createCamera();
    cam.y = -75;
    const world = { x: 220, y: -40 };
    const screen = worldToScreen(cam, world.x, world.y);
    const back = screenToWorld(cam, screen.x, screen.y);
    expect(back.x).toBeCloseTo(world.x);
    expect(back.y).toBeCloseTo(world.y);
    expect(screen.y).toBeCloseTo(world.y - cam.y);
  });

  it('getVisibleWorldBounds should shift up with the camera', () => {
    const state = makeState();
    state.camera.y = -80;
    const bounds = getVisibleWorldBounds(state);
    expect(bounds.left).toBe(0);
    expect(bounds.right).toBe(W);
    expect(bounds.top).toBe(-80);
    expect(bounds.bottom).toBe(H - 80);
  });

  it('applyCameraTransform should translate by the negated camera offset', () => {
    const calls: number[][] = [];
    const ctx = {
      translate: (x: number, y: number) => calls.push([x, y]),
    } as unknown as CanvasRenderingContext2D;
    applyCameraTransform(ctx, { x: 0, y: -90 });
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBeCloseTo(0);
    expect(calls[0][1]).toBe(90);
  });

  it('a rest-position ball should be fully on screen', () => {
    const state = makeState();
    expect(isBallOnScreen(state)).toBe(true);
    expect(isBallVerticallyOnScreen(state)).toBe(true);
  });

  it('resetBall should snap the camera back to rest', () => {
    const state = makeState();
    state.camera.y = -150;
    state.ball.pos.y = -90;
    resetBall(state);
    expect(state.camera.x).toBe(CONFIG.CAMERA_REST_X);
    expect(state.camera.y).toBe(CONFIG.CAMERA_REST_Y);
  });

  it('should keep a high-arc makeable shot vertically on screen after the camera settles', () => {
    const state = makeState();
    state.phase = 'charging';
    state.shotIdealPower = CONFIG.IDEAL_POWER;
    state.chargePower = CONFIG.IDEAL_POWER;
    state.wind = 0;
    launchBall(state);

    let minWorldY = state.ball.pos.y;
    for (let i = 0; i < 180; i++) {
      updatePhysics(state, 0.01);
      updateCamera(state, 0.01);
      minWorldY = Math.min(minWorldY, state.ball.pos.y);
      // launchBall mutates phase; TS does not track that narrowing
      if ((state.phase as string) !== 'flying') break;

      if (isBallInHorizontalView(state)) {
        expect(isBallVerticallyOnScreen(state)).toBe(true);
      }
    }

    expect(minWorldY).toBeLessThan(0);
  });

  it('should keep an extra-high (overpowered) arc vertically on screen while the ball is in horizontal view', () => {
    const state = makeState();
    state.phase = 'charging';
    state.chargePower = 0.8;
    state.wind = 0;
    launchBall(state);

    for (let i = 0; i < 180; i++) {
      updatePhysics(state, 0.01);
      updateCamera(state, 0.01);
      if ((state.phase as string) !== 'flying') break;
      if (!isBallInHorizontalView(state)) {
        expect(getCameraTargetY(state)).toBe(CONFIG.CAMERA_REST_Y);
        expect(state.camera.x).toBe(CONFIG.CAMERA_REST_X);
        continue;
      }
      expect(isBallVerticallyOnScreen(state)).toBe(true);
    }
  });
});
