import { Camera, GameState, Vec2 } from '../types/game';
import { CONFIG } from './config';
import { lerp } from '../utils/math';

export function createCamera(): Camera {
  return { x: CONFIG.CAMERA_REST_X, y: CONFIG.CAMERA_REST_Y };
}

export function resetCamera(camera: Camera): void {
  camera.x = CONFIG.CAMERA_REST_X;
  camera.y = CONFIG.CAMERA_REST_Y;
}

/**
 * True when any part of the ball is still inside the canvas horizontally.
 * Overshoots and side-bounces that leave the play area are excluded so
 * the camera never pans X or chases those misses.
 */
export function isBallInHorizontalView(state: GameState): boolean {
  const { ball, canvasW } = state;
  return ball.pos.x + ball.radius >= 0 && ball.pos.x - ball.radius <= canvasW;
}

/**
 * Desired camera Y so a high-arc ball stays on screen with a top margin.
 * Returns rest Y when the shot is not in flight, or when the ball has
 * left the screen sideways (overshoot / bounce off the sides).
 * Never produces a non-zero X target — horizontal tracking is disabled.
 */
export function getCameraTargetY(state: GameState): number {
  if (state.phase !== 'flying') {
    return CONFIG.CAMERA_REST_Y;
  }
  if (!isBallInHorizontalView(state)) {
    return CONFIG.CAMERA_REST_Y;
  }

  const lookAhead = Math.min(0, state.ball.vel.y) * CONFIG.CAMERA_LOOKAHEAD;
  const ballTop = state.ball.pos.y - state.ball.radius + lookAhead;
  if (ballTop < CONFIG.CAMERA_TOP_MARGIN) {
    return ballTop - CONFIG.CAMERA_TOP_MARGIN;
  }
  return CONFIG.CAMERA_REST_Y;
}

export function getCameraTargetX(_state: GameState): number {
  return CONFIG.CAMERA_REST_X;
}

export function updateCamera(state: GameState, dt: number): void {
  const targetY = getCameraTargetY(state);
  const t = 1 - Math.exp(-CONFIG.CAMERA_FOLLOW_LERP * Math.max(0, dt));
  state.camera.y = lerp(state.camera.y, targetY, t);
  state.camera.x = CONFIG.CAMERA_REST_X;

  // Hard clamps: lerp is smoothed, but a high-arc ball must never leave the
  // viewport while it is still in the horizontal play area.
  if (state.phase === 'flying' && isBallInHorizontalView(state)) {
    const ballTop = state.ball.pos.y - state.ball.radius;
    const ballBottom = state.ball.pos.y + state.ball.radius;
    if (ballTop - state.camera.y < 0) {
      state.camera.y = ballTop;
    }
    if (ballBottom - state.camera.y > state.canvasH) {
      state.camera.y = ballBottom - state.canvasH;
    }
  }

  if (state.camera.y > CONFIG.CAMERA_REST_Y) {
    state.camera.y = CONFIG.CAMERA_REST_Y;
  }
}

export function applyCameraTransform(ctx: CanvasRenderingContext2D, camera: Camera): void {
  ctx.translate(-camera.x, -camera.y);
}

export function worldToScreen(camera: Camera, worldX: number, worldY: number): Vec2 {
  return { x: worldX - camera.x, y: worldY - camera.y };
}

export function screenToWorld(camera: Camera, screenX: number, screenY: number): Vec2 {
  return { x: screenX + camera.x, y: screenY + camera.y };
}

/** Visible world-space rectangle for the current camera + canvas size. */
export function getVisibleWorldBounds(state: GameState): {
  left: number;
  top: number;
  right: number;
  bottom: number;
} {
  return {
    left: state.camera.x,
    top: state.camera.y,
    right: state.camera.x + state.canvasW,
    bottom: state.camera.y + state.canvasH,
  };
}

export function isBallVerticallyOnScreen(state: GameState, margin = 0): boolean {
  const screen = worldToScreen(state.camera, state.ball.pos.x, state.ball.pos.y);
  const r = state.ball.radius;
  return screen.y - r >= margin && screen.y + r <= state.canvasH - margin;
}

export function isBallOnScreen(state: GameState, margin = 0): boolean {
  const screen = worldToScreen(state.camera, state.ball.pos.x, state.ball.pos.y);
  const r = state.ball.radius;
  return (
    screen.x - r >= margin &&
    screen.x + r <= state.canvasW - margin &&
    screen.y - r >= margin &&
    screen.y + r <= state.canvasH - margin
  );
}
