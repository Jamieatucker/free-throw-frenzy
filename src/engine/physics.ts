import { Ball, GameState, Hoop, Vec2 } from '../types/game';
import { CONFIG } from './config';
import { playSound } from './audio';
import { clamp, randomRange } from '../utils/math';

function solveArcVelocity(
  sx: number, sy: number,
  tx: number, ty: number,
  peakHeight: number,
  gravity: number
): Vec2 {
  const peakY = Math.min(sy, ty) - peakHeight;
  const dyUp = peakY - sy;
  const vy0 = -Math.sqrt(2 * gravity * Math.abs(dyUp));
  const tUp = -vy0 / gravity;
  const dyDown = ty - peakY;
  const tDown = Math.sqrt(2 * Math.max(0, dyDown) / gravity);
  const totalT = tUp + tDown;
  const vx = (tx - sx) / totalT;
  return { x: vx, y: vy0 };
}

export function launchBall(state: GameState): void {
  const dc = state.difficultyConfig;
  const power = state.chargePower;
  const ideal = state.shotIdealPower;
  const tolerance = getEffectiveShotTolerance(state);
  const gravity = dc.gravity;

  const rimCenterX = (state.hoop.rimLeftX + state.hoop.rimRightX) / 2;
  const rimCenterY = state.hoop.rimY;
  const sx = state.ball.pos.x;
  const sy = state.ball.pos.y;

  const dx = rimCenterX - sx;
  const basePeak = Math.abs(dx) * 0.45 + 80;

  if (power >= 0.99) {
    // Max power: auto-fire with severe accuracy penalty
    const penalty = CONFIG.MAX_POWER_ACCURACY_PENALTY;
    const offsetX = randomRange(-penalty, penalty) * 300;
    const offsetY = randomRange(-penalty, penalty) * 150;
    const peakH = basePeak * randomRange(0.6, 1.6);
    const targetX = rimCenterX + offsetX;
    const targetY = rimCenterY + offsetY;
    const vel = solveArcVelocity(sx, sy, targetX, targetY, Math.max(50, peakH), gravity);
    state.ball.vel.x = vel.x;
    state.ball.vel.y = vel.y;
  } else if (Math.abs(power - ideal) <= tolerance) {
    const peakH = basePeak + (Math.random() - 0.5) * 10;
    const vel = solveArcVelocity(sx, sy, rimCenterX, rimCenterY - 5, peakH, gravity);
    state.ball.vel.x = vel.x;
    state.ball.vel.y = vel.y;
  } else {
    const error = (power - ideal) / ideal;
    const peakH = basePeak * (1 + error * 0.8);
    const targetX = rimCenterX + error * 120;
    const targetY = rimCenterY - 20 + error * 60;
    const vel = solveArcVelocity(sx, sy, targetX, targetY, Math.max(40, peakH), gravity);
    state.ball.vel.x = vel.x;
    state.ball.vel.y = vel.y;
  }

  state.phase = 'flying';
  state.bounceCount = 0;
  state.passedAboveRim = false;
  state.bankedOffGlass = false;
  state.frontRimLatched = false;
  state.ball.opacity = 1;
  state.ball.prevY = state.ball.pos.y;
  playSound('shoot');
}

export function updatePhysics(state: GameState, dt: number): void {
  if (state.phase === 'falling_through') {
    updateFallThrough(state, dt);
    return;
  }
  if (state.phase !== 'flying') return;

  // Substep the flight so a fast ball cannot jump through the rim or glass
  // and appear inside the net. Gravity stays constant between contacts, so
  // the arc is still the parabola from the shot.
  let remaining = dt;
  let guard = 0;
  while (remaining > 1e-6 && state.phase === 'flying' && guard < 16) {
    const h = Math.min(CONFIG.PHYSICS_SUBSTEP, remaining);
    stepFlight(state, h);
    remaining -= h;
    guard += 1;
  }
  // `phase` is narrowed to 'flying' above; read it back after stepFlight may score.
  const phaseAfterFlight = state.phase as string;
  if (phaseAfterFlight === 'falling_through' && remaining > 1e-6) {
    updateFallThrough(state, remaining);
  }
}

function stepFlight(state: GameState, dt: number): void {
  const dc = state.difficultyConfig;
  const ball = state.ball;

  ball.prevX = ball.pos.x;
  ball.prevY = ball.pos.y;
  ball.vel.y += dc.gravity * dt;
  ball.vel.x += state.wind * dt;

  ball.pos.x += ball.vel.x * dt;
  ball.pos.y += ball.vel.y * dt;
  ball.rotation += ball.vel.x * dt * 0.05;

  if (state.bounceCount === 0 && ball.pos.y + ball.radius < state.hoop.rimY) {
    state.passedAboveRim = true;
  }

  resolveBackboard(state);
  if (state.phase !== 'flying') return;
  resolveRim(state);
  if (state.phase !== 'flying') return;

  // A clean downward crossing is a make and keeps falling. The net itself
  // does not stop a ball that rises into it from below.
  if (checkScore(state)) return;
  preventIllegalNetEntry(state);
  checkGroundBounce(state);
  checkOutOfBounds(state);
}

function updateFallThrough(state: GameState, dt: number): void {
  const ball = state.ball;
  const dc = state.difficultyConfig;
  const groundY = state.canvasH * CONFIG.GROUND_Y_RATIO;

  ball.prevY = ball.pos.y;
  ball.vel.y += dc.gravity * dt;
  ball.vel.x *= 0.94;
  ball.pos.x += ball.vel.x * dt;
  ball.pos.y += ball.vel.y * dt;
  ball.rotation += (ball.vel.x * 0.05 + 2.2) * dt;

  const fadeStartY = state.hoop.netBottom - 6;
  if (ball.pos.y > fadeStartY) {
    ball.opacity -= dt / CONFIG.BALL_FADE_DURATION;
  }
  if (ball.pos.y + ball.radius >= groundY) {
    ball.pos.y = groundY - ball.radius;
    ball.opacity -= dt / 0.12;
  }
  if (ball.opacity <= 0) {
    ball.opacity = 0;
    state.phase = 'scored';
    if (state.feedbackTimer <= 0) {
      state.feedbackTimer = CONFIG.FEEDBACK_DURATION;
    }
  }
}

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** Visible glass, matching `drawBackboard`. */
function backboardBox(hoop: Hoop): Rect {
  const left = hoop.backboardX - CONFIG.BACKBOARD_WIDTH / 2;
  return {
    left,
    right: left + CONFIG.BACKBOARD_WIDTH,
    top: hoop.backboardTop,
    bottom: hoop.backboardBottom,
  };
}

/** Open cylinder under the rim. The center may enter only from above. */
function netMouth(hoop: Hoop): Rect {
  return {
    left: hoop.rimLeftX + hoop.rimRadius,
    right: hoop.rimRightX - hoop.rimRadius,
    top: hoop.rimY,
    bottom: hoop.netBottom,
  };
}

function centerInNet(x: number, y: number, hoop: Hoop): boolean {
  const mouth = netMouth(hoop);
  return x > mouth.left && x < mouth.right && y > mouth.top && y < mouth.bottom;
}

/**
 * Equal-and-opposite rebound along the contact normal, plus a little
 * tangential friction from the ball's pebbled surface.
 * Returns true when the ball was still moving into the surface.
 */
function bounceOffNormal(
  ball: Ball,
  nx: number,
  ny: number,
  restitution: number,
  friction: number
): boolean {
  const rel = ball.vel.x * nx + ball.vel.y * ny;
  if (rel >= -1) return false;
  ball.vel.x -= (1 + restitution) * rel * nx;
  ball.vel.y -= (1 + restitution) * rel * ny;
  if (friction > 0) {
    const tx = -ny;
    const ty = nx;
    const tan = ball.vel.x * tx + ball.vel.y * ty;
    ball.vel.x -= tan * friction * tx;
    ball.vel.y -= tan * friction * ty;
  }
  return true;
}

function resolveBackboard(state: GameState): void {
  const { ball, hoop, difficultyConfig: dc } = state;
  const box = backboardBox(hoop);
  const r = ball.radius;
  const prevX = ball.prevX;
  const prevY = ball.prevY;

  // Swept hit on the court-side face. Stops a fast ball from passing
  // through the glass and being relocated into the net.
  const front = box.left;
  if (prevX + r <= front + 0.01 && ball.pos.x + r > front && ball.pos.x !== prevX) {
    const toi = (front - r - prevX) / (ball.pos.x - prevX);
    if (toi >= 0 && toi <= 1) {
      const hitY = prevY + (ball.pos.y - prevY) * toi;
      if (hitY >= box.top - r && hitY <= box.bottom + r) {
        ball.pos.x = front - r;
        ball.pos.y = hitY;
        state.bankedOffGlass = true;
        if (bounceOffNormal(ball, -1, 0, dc.restitution, CONFIG.BACKBOARD_FRICTION)) {
          playSound('bounce');
        }
        return;
      }
    }
  }

  const back = box.right;
  if (prevX - r >= back - 0.01 && ball.pos.x - r < back && ball.pos.x !== prevX) {
    const toi = (back + r - prevX) / (ball.pos.x - prevX);
    if (toi >= 0 && toi <= 1) {
      const hitY = prevY + (ball.pos.y - prevY) * toi;
      if (hitY >= box.top - r && hitY <= box.bottom + r) {
        ball.pos.x = back + r;
        ball.pos.y = hitY;
        if (bounceOffNormal(ball, 1, 0, dc.restitution, CONFIG.BACKBOARD_FRICTION)) {
          playSound('bounce');
        }
        return;
      }
    }
  }

  const mtv = circleAabbMtv(ball.pos.x, ball.pos.y, r, box, prevX, prevY);
  if (!mtv) return;
  ball.pos.x += mtv.x;
  ball.pos.y += mtv.y;
  if (mtv.x < 0) state.bankedOffGlass = true;
  const len = Math.hypot(mtv.x, mtv.y) || 1;
  if (bounceOffNormal(ball, mtv.x / len, mtv.y / len, dc.restitution, CONFIG.BACKBOARD_FRICTION)) {
    playSound('bounce');
  }
}

function centerInMouth(x: number, hoop: Hoop): boolean {
  const mouth = netMouth(hoop);
  return x > mouth.left && x < mouth.right;
}

/**
 * The center is already in the cylinder and still dropping from above the rim.
 * The iron must not shove that ball back outside — it is going in.
 */
function isDroppingThroughOpening(state: GameState): boolean {
  const { ball } = state;
  return (
    state.bounceCount === 0 &&
    state.passedAboveRim &&
    ball.vel.y > 0 &&
    centerInMouth(ball.pos.x, state.hoop)
  );
}

function circleAabbMtv(
  cx: number,
  cy: number,
  r: number,
  box: Rect,
  prevX: number,
  prevY: number
): Vec2 | null {
  const closestX = clamp(cx, box.left, box.right);
  const closestY = clamp(cy, box.top, box.bottom);
  const dx = cx - closestX;
  const dy = cy - closestY;
  const distSq = dx * dx + dy * dy;

  if (distSq > 1e-8) {
    if (distSq >= r * r) return null;
    const dist = Math.sqrt(distSq);
    const pen = r - dist;
    return { x: (dx / dist) * pen, y: (dy / dist) * pen };
  }

  // Center is inside the glass. Push out the face the ball entered through,
  // otherwise the nearest face — never a fixed snap into the hoop.
  const candidates: { side: string; pen: number; x: number; y: number }[] = [
    { side: 'left', pen: cx - box.left + r, x: -(cx - box.left + r), y: 0 },
    { side: 'right', pen: box.right - cx + r, x: box.right - cx + r, y: 0 },
    { side: 'top', pen: cy - box.top + r, x: 0, y: -(cy - box.top + r) },
    { side: 'bottom', pen: box.bottom - cy + r, x: 0, y: box.bottom - cy + r },
  ];
  let prefer: string | null = null;
  if (prevX < box.left) prefer = 'left';
  else if (prevX > box.right) prefer = 'right';
  else if (prevY < box.top) prefer = 'top';
  else if (prevY > box.bottom) prefer = 'bottom';

  const chosen = prefer
    ? candidates.find((c) => c.side === prefer) ?? candidates[0]
    : candidates.reduce((best, c) => (c.pen < best.pen ? c : best));
  return { x: chosen.x, y: chosen.y };
}

function resolveRim(state: GameState): void {
  const { ball, hoop, difficultyConfig: dc } = state;
  // A bank or a swish whose center is in the opening falls through.
  // Colliding with the iron here is what teleports that ball back out.
  if (isDroppingThroughOpening(state)) return;

  const minDist = ball.radius + hoop.rimRadius;
  const frontHit = sweepCircle(
    ball.prevX,
    ball.prevY,
    ball.pos.x,
    ball.pos.y,
    ball.radius,
    hoop.rimLeftX,
    hoop.rimY,
    hoop.rimRadius
  );
  const overlapsFront =
    Math.hypot(ball.pos.x - hoop.rimLeftX, ball.pos.y - hoop.rimY) < minDist - 0.01;

  // The near iron is the front of the rim. A hit here bounces back toward
  // the shooter and cannot stick or turn into a make.
  if (frontHit || overlapsFront) {
    deflectOffFrontRim(state, frontHit);
    return;
  }

  const back = { x: hoop.rimRightX, y: hoop.rimY };
  const backHit = sweepCircle(
    ball.prevX,
    ball.prevY,
    ball.pos.x,
    ball.pos.y,
    ball.radius,
    back.x,
    back.y,
    hoop.rimRadius
  );
  if (backHit) {
    const restingOnCrown = backHit.toi === 0 && backHit.ny < -0.6;
    if (!restingOnCrown) {
      ball.pos.x = back.x + backHit.nx * minDist;
      ball.pos.y = back.y + backHit.ny * minDist;
    }
    respondToRimContact(ball, backHit.nx, backHit.ny, dc.restitution, false);
  }
  separateFromCircle(ball, back.x, back.y, minDist, dc.restitution, CONFIG.RIM_FRICTION, false);
}

/**
 * One bounce off the front iron, along the contact normal.
 * Later substeps while the ball is still touching only separate it,
 * so the rebound keeps a single velocity instead of stuttering.
 */
function deflectOffFrontRim(
  state: GameState,
  hit: { nx: number; ny: number } | null
): void {
  const { ball, hoop, difficultyConfig: dc } = state;
  const minDist = ball.radius + hoop.rimRadius;
  const dx = ball.pos.x - hoop.rimLeftX;
  const dy = ball.pos.y - hoop.rimY;
  const dist = Math.hypot(dx, dy);

  if (state.frontRimLatched) {
    if (dist > minDist + 8) state.frontRimLatched = false;
    else if (dist < minDist && dist > 1e-6) {
      ball.pos.x = hoop.rimLeftX + (dx / dist) * minDist;
      ball.pos.y = hoop.rimY + (dy / dist) * minDist;
    }
    return;
  }

  let outX = hit ? hit.nx : dx;
  let outY = hit ? hit.ny : dy;
  const len = Math.hypot(outX, outY) || 1;
  outX /= len;
  outY /= len;
  if (outX > 0) outX = -outX;

  ball.pos.x = hoop.rimLeftX + outX * minDist;
  ball.pos.y = hoop.rimY + outY * minDist;

  const rel = ball.vel.x * outX + ball.vel.y * outY;
  if (rel < 0) {
    ball.vel.x -= (1 + dc.restitution) * rel * outX;
    ball.vel.y -= (1 + dc.restitution) * rel * outY;
  }
  const away = ball.vel.x * outX + ball.vel.y * outY;
  if (away < 60) {
    ball.vel.x += (60 - away) * outX;
    ball.vel.y += (60 - away) * outY;
  }
  // A slow crown contact has almost no sideways speed, so give it one
  // roll toward the court. A hard bounce already carries itself clear.
  if (outY < -0.6 && Math.abs(ball.vel.x) < 50 && ball.vel.y > -80) {
    ball.vel.x = -140;
  }

  if (state.bounceCount < 1) state.bounceCount = 1;
  state.frontRimLatched = true;
  playSound('bounce');
}

function separateFromCircle(
  ball: Ball,
  cx: number,
  cy: number,
  minDist: number,
  restitution: number,
  friction: number,
  isFrontRim: boolean
): void {
  const dx = ball.pos.x - cx;
  const dy = ball.pos.y - cy;
  const dist = Math.hypot(dx, dy);
  if (dist >= minDist || dist < 1e-6) return;
  const nx = dx / dist;
  const ny = dy / dist;
  ball.pos.x = cx + nx * minDist;
  ball.pos.y = cy + ny * minDist;
  respondToRimContact(ball, nx, ny, restitution, isFrontRim, friction);
}

/**
 * A hard hit still bounces. A slow contact on the crown does not: gravity
 * would re-embed the ball every substep, retrigger the bounce sound, and
 * leave the shot stuck in `flying`. Shed that rest off the front iron.
 */
function respondToRimContact(
  ball: Ball,
  nx: number,
  ny: number,
  restitution: number,
  isFrontRim: boolean,
  friction: number = CONFIG.RIM_FRICTION
): void {
  const rel = ball.vel.x * nx + ball.vel.y * ny;
  const onCrown = ny < -0.6;
  if (onCrown && rel > -110) {
    if (rel < 0) {
      ball.vel.x -= rel * nx;
      ball.vel.y -= rel * ny;
    }
    if (isFrontRim && Math.abs(ball.vel.x) < 80) {
      ball.vel.x = -140;
    }
    return;
  }
  if (bounceOffNormal(ball, nx, ny, restitution, friction)) {
    playSound('bounce');
  }
}

function sweepCircle(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  radius: number,
  cx: number,
  cy: number,
  otherRadius: number
): { toi: number; nx: number; ny: number } | null {
  const reach = radius + otherRadius;
  const ox = x0 - cx;
  const oy = y0 - cy;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const a = dx * dx + dy * dy;
  const c = ox * ox + oy * oy - reach * reach;

  if (c <= 0) {
    const dist = Math.hypot(ox, oy);
    if (dist < 1e-6) return { toi: 0, nx: 0, ny: -1 };
    return { toi: 0, nx: ox / dist, ny: oy / dist };
  }
  if (a < 1e-10) return null;
  const b = 2 * (ox * dx + oy * dy);
  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  if (t < 0 || t > 1) return null;
  const hx = x0 + dx * t;
  const hy = y0 + dy * t;
  const dist = Math.hypot(hx - cx, hy - cy) || 1;
  return { toi: t, nx: (hx - cx) / dist, ny: (hy - cy) / dist };
}

/**
 * The cords are not a wall. A swish is only a downward crossing of the
 * rim, so a ball that rises into the net from below keeps its velocity.
 * A ball shoved in by the glass is still pushed back out.
 */
function preventIllegalNetEntry(state: GameState): void {
  const { ball, hoop, difficultyConfig: dc } = state;
  if (!centerInNet(ball.pos.x, ball.pos.y, hoop)) return;

  const underTheRim = ball.vel.y <= 0 || ball.prevY >= hoop.rimY - 0.01;
  if (ball.vel.y <= 0 || (underTheRim && !state.bankedOffGlass)) return;

  const mouth = netMouth(hoop);
  const prevInside = centerInNet(ball.prevX, ball.prevY, hoop);
  if (!prevInside) {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 10; i++) {
      const mid = (lo + hi) / 2;
      const x = ball.prevX + (ball.pos.x - ball.prevX) * mid;
      const y = ball.prevY + (ball.pos.y - ball.prevY) * mid;
      if (centerInNet(x, y, hoop)) hi = mid;
      else lo = mid;
    }
    ball.pos.x = ball.prevX + (ball.pos.x - ball.prevX) * lo;
    ball.pos.y = ball.prevY + (ball.pos.y - ball.prevY) * lo;
  }

  if (!centerInNet(ball.pos.x, ball.pos.y, hoop)) {
    nudgeJustOutsideNet(ball, mouth);
  } else {
    const toLeft = ball.pos.x - mouth.left;
    const toRight = mouth.right - ball.pos.x;
    const toTop = ball.pos.y - mouth.top;
    if (toTop <= toLeft && toTop <= toRight) {
      ball.pos.y = mouth.top;
    } else if (toLeft <= toRight) {
      ball.pos.x = mouth.left;
    } else {
      ball.pos.x = mouth.right;
    }
  }

  const nx = ball.pos.x <= mouth.left ? -1 : ball.pos.x >= mouth.right ? 1 : 0;
  const ny = ball.pos.y <= mouth.top ? -1 : 0;
  const len = Math.hypot(nx, ny) || 1;
  if (bounceOffNormal(ball, nx / len, ny / len, dc.restitution, CONFIG.RIM_FRICTION)) {
    playSound('bounce');
  }
}

function nudgeJustOutsideNet(ball: Ball, mouth: Rect): void {
  const eps = 0.05;
  if (ball.pos.y <= mouth.top && ball.pos.y > mouth.top - eps) ball.pos.y = mouth.top - eps;
  if (ball.pos.x <= mouth.left && ball.pos.x > mouth.left - eps) ball.pos.x = mouth.left - eps;
  if (ball.pos.x >= mouth.right && ball.pos.x < mouth.right + eps) ball.pos.x = mouth.right + eps;
}

function checkGroundBounce(state: GameState): void {
  const { ball, canvasH, difficultyConfig: dc } = state;
  const groundY = canvasH * CONFIG.GROUND_Y_RATIO;

  if (ball.pos.y + ball.radius >= groundY && ball.vel.y > 0) {
    ball.pos.y = groundY - ball.radius;
    ball.vel.y = -ball.vel.y * dc.groundRestitution;
    ball.vel.x *= CONFIG.GROUND_FRICTION;
    state.bounceCount += 1;
    playSound('bounce');

    if (state.bounceCount >= CONFIG.MAX_BOUNCES || Math.abs(ball.vel.y) < 20) {
      if (state.phase === 'flying') {
        state.phase = 'missed';
        state.streak = 0;
        state.multiplier = 1;
        state.feedbackType = 'miss';
        state.feedbackTimer = CONFIG.FEEDBACK_DURATION;
        state.player.x = state.player.baseX;
        playSound('miss');
      }
    }
  }
}

function checkScore(state: GameState): boolean {
  if (!isRimEntryFromAbove(state)) return false;

  state.score += state.multiplier;
  state.streak += 1;
  state.multiplier = Math.min(CONFIG.MAX_MULTIPLIER, state.streak + 1);
  state.currency += state.multiplier;
  state.phase = 'falling_through';
  state.feedbackType = 'score';
  state.feedbackTimer = CONFIG.FEEDBACK_DURATION;
  state.netSwish = 1;
  playSound('score');

  const shift = Math.min(state.streak * 8, state.canvasW * 0.15);
  state.player.x = state.player.baseX + shift;
  return true;
}

/** Ball is currently dropping through the rim cylinder (already counted a make). */
export function isPassingThroughRim(state: GameState): boolean {
  if (state.phase !== 'falling_through') return false;
  const { ball, hoop } = state;
  return (
    ball.vel.y > 0 &&
    ball.pos.y > hoop.rimY - ball.radius &&
    ball.pos.x > hoop.rimLeftX + hoop.rimRadius &&
    ball.pos.x < hoop.rimRightX - hoop.rimRadius
  );
}

/**
 * A make requires: no ground or front-rim bounce, the ball above the rim
 * this shot, then a downward crossing while the center is in the opening.
 * A clean swish stays in the opening for the whole step. A bank may cross
 * on the same step it leaves the glass, so only the landing position has
 * to be in the opening — and only after that glass rebound.
 */
export function isRimEntryFromAbove(state: GameState): boolean {
  if (state.bounceCount > 0 || !state.passedAboveRim) return false;
  const { ball, hoop } = state;
  const crossedPlane = ball.prevY < hoop.rimY && ball.pos.y >= hoop.rimY && ball.vel.y > 0;
  if (!crossedPlane || !centerInMouth(ball.pos.x, hoop)) return false;
  if (centerInMouth(ball.prevX, hoop)) return true;
  return state.bankedOffGlass;
}

function checkOutOfBounds(state: GameState): void {
  const { ball, canvasW } = state;
  if (ball.pos.x > canvasW + 80 || ball.pos.x < -80) {
    if (state.phase === 'flying') {
      state.phase = 'missed';
      state.streak = 0;
      state.multiplier = 1;
      state.feedbackType = 'miss';
      state.feedbackTimer = CONFIG.FEEDBACK_DURATION;
      state.player.x = state.player.baseX;
    }
  }
}

export function rollShotIdealPower(baseIdeal: number): number {
  const jitter = CONFIG.SHOT_IDEAL_JITTER;
  const rolled = baseIdeal + randomRange(-jitter, jitter);
  return Math.min(0.85, Math.max(0.35, rolled));
}

/** Ideal zone width including the +4% near-ideal make bonus. */
export function getEffectiveShotTolerance(state: GameState): number {
  const ideal = state.shotIdealPower;
  const base = ideal * state.difficultyConfig.powerTolerance;
  return base + CONFIG.NEAR_IDEAL_MAKE_BONUS;
}

export function computeIdealPower(state: GameState): number {
  return state.shotIdealPower;
}

export function isWithinTolerance(power: number, ideal: number, tolerance?: number): boolean {
  const tol = tolerance ?? CONFIG.IDEAL_POWER * CONFIG.POWER_TOLERANCE;
  return Math.abs(power - ideal) <= tol;
}
