import { GameState, Vec2 } from '../types/game';
import { CONFIG } from './config';
import { playSound } from './audio';
import { randomRange } from '../utils/math';

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
  const ideal = dc.idealPower;
  const tolerance = ideal * dc.powerTolerance;
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
  playSound('shoot');
}

export function updatePhysics(state: GameState, dt: number): void {
  if (state.phase === 'falling_through') {
    updateFallThrough(state, dt);
    return;
  }
  if (state.phase !== 'flying') return;

  const dc = state.difficultyConfig;
  const ball = state.ball;

  ball.vel.y += dc.gravity * dt;
  ball.vel.x += state.wind * dt;

  ball.pos.x += ball.vel.x * dt;
  ball.pos.y += ball.vel.y * dt;
  ball.rotation += ball.vel.x * dt * 0.05;

  checkRimCollision(state);
  checkBackboardCollision(state);
  checkScore(state);
  checkGroundBounce(state);
  checkOutOfBounds(state);
}

function updateFallThrough(state: GameState, dt: number): void {
  const ball = state.ball;
  ball.vel.y = 120;
  ball.vel.x *= 0.9;
  ball.pos.y += ball.vel.y * dt;
  ball.pos.x += ball.vel.x * dt;
  ball.rotation += ball.vel.x * dt * 0.02;

  state.feedbackTimer -= dt;
  if (state.feedbackTimer <= 0) {
    state.phase = 'scored';
    state.feedbackTimer = CONFIG.FEEDBACK_DURATION;
  }
}

function checkRimCollision(state: GameState): void {
  const { ball, hoop, difficultyConfig: dc } = state;
  const rimPoints: Vec2[] = [
    { x: hoop.rimLeftX, y: hoop.rimY },
    { x: hoop.rimRightX, y: hoop.rimY },
  ];

  for (const rp of rimPoints) {
    const dx = ball.pos.x - rp.x;
    const dy = ball.pos.y - rp.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = ball.radius + hoop.rimRadius;

    if (dist < minDist && dist > 0) {
      const nx = dx / dist;
      const ny = dy / dist;
      const relVel = ball.vel.x * nx + ball.vel.y * ny;
      if (relVel < 0) {
        ball.vel.x -= (1 + dc.restitution) * relVel * nx;
        ball.vel.y -= (1 + dc.restitution) * relVel * ny;
        playSound('bounce');
      }
      ball.pos.x = rp.x + nx * minDist;
      ball.pos.y = rp.y + ny * minDist;
    }
  }
}

function checkBackboardCollision(state: GameState): void {
  const { ball, hoop, difficultyConfig: dc } = state;
  if (
    ball.pos.x + ball.radius > hoop.backboardX &&
    ball.pos.x - ball.radius < hoop.backboardX + CONFIG.BACKBOARD_WIDTH &&
    ball.pos.y > hoop.backboardTop &&
    ball.pos.y < hoop.backboardBottom
  ) {
    if (ball.vel.x > 0) {
      ball.pos.x = hoop.backboardX - ball.radius;
    } else {
      ball.pos.x = hoop.backboardX + CONFIG.BACKBOARD_WIDTH + ball.radius;
    }
    ball.vel.x = -ball.vel.x * dc.restitution;
    playSound('bounce');
  }
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

function checkScore(state: GameState): void {
  const { ball, hoop } = state;
  const inRimX = ball.pos.x > hoop.rimLeftX + 5 && ball.pos.x < hoop.rimRightX - 5;
  const crossedRimY = ball.pos.y > hoop.rimY && ball.pos.y < hoop.rimY + 20;
  const goingDown = ball.vel.y > 0;

  if (inRimX && crossedRimY && goingDown) {
    state.score += state.multiplier;
    state.streak += 1;
    state.multiplier = Math.min(CONFIG.MAX_MULTIPLIER, state.streak + 1);
    state.currency += state.multiplier;
    state.phase = 'falling_through';
    state.feedbackType = 'score';
    state.feedbackTimer = CONFIG.FALL_THROUGH_DURATION;
    playSound('score');

    const shift = Math.min(state.streak * 8, state.canvasW * 0.15);
    state.player.x = state.player.baseX + shift;
  }
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

export function computeIdealPower(_state: GameState): number {
  return _state.difficultyConfig.idealPower;
}

export function isWithinTolerance(power: number, ideal: number, tolerance?: number): boolean {
  const tol = tolerance ?? CONFIG.IDEAL_POWER * CONFIG.POWER_TOLERANCE;
  return Math.abs(power - ideal) <= tol;
}
