import { GameState, Vec2 } from '../types/game';
import { CONFIG } from './config';
import { playSound } from './audio';

const { GRAVITY, RESTITUTION } = CONFIG;

/**
 * Compute the exact velocity needed to land the ball at (targetX, targetY)
 * from (startX, startY) with a given peak height above the start.
 */
function solveArcVelocity(
  sx: number, sy: number,
  tx: number, ty: number,
  peakHeight: number
): Vec2 {
  const peakY = Math.min(sy, ty) - peakHeight;
  const dyUp = peakY - sy;
  // time to reach peak: vy0 = -sqrt(2*g*|dyUp|), t_up = -vy0/g
  const vy0 = -Math.sqrt(2 * GRAVITY * Math.abs(dyUp));
  const tUp = -vy0 / GRAVITY;
  // time from peak to target: dyDown = ty - peakY, t_down = sqrt(2*dyDown/g)
  const dyDown = ty - peakY;
  const tDown = Math.sqrt(2 * Math.max(0, dyDown) / GRAVITY);
  const totalT = tUp + tDown;
  const vx = (tx - sx) / totalT;
  return { x: vx, y: vy0 };
}

export function launchBall(state: GameState): void {
  const power = state.chargePower;
  const ideal = CONFIG.IDEAL_POWER;
  const tolerance = ideal * CONFIG.POWER_TOLERANCE;

  const rimCenterX = (state.hoop.rimLeftX + state.hoop.rimRightX) / 2;
  const rimCenterY = state.hoop.rimY;
  const sx = state.ball.pos.x;
  const sy = state.ball.pos.y;

  const dx = rimCenterX - sx;
  const basePeak = Math.abs(dx) * 0.45 + 80;

  if (Math.abs(power - ideal) <= tolerance) {
    // Within sweet spot — guaranteed make with slight variance
    const peakH = basePeak + (Math.random() - 0.5) * 10;
    const vel = solveArcVelocity(sx, sy, rimCenterX, rimCenterY - 5, peakH);
    state.ball.vel.x = vel.x;
    state.ball.vel.y = vel.y;
  } else {
    // Outside sweet spot — deviate proportionally to error
    const error = (power - ideal) / ideal;
    const peakH = basePeak * (1 + error * 0.8);
    const targetX = rimCenterX + error * 120;
    const targetY = rimCenterY - 20 + error * 60;
    const vel = solveArcVelocity(sx, sy, targetX, targetY, Math.max(40, peakH));
    state.ball.vel.x = vel.x;
    state.ball.vel.y = vel.y;
  }

  state.phase = 'flying';
  playSound('shoot');
}

export function updatePhysics(state: GameState, dt: number): void {
  if (state.phase !== 'flying') return;
  const ball = state.ball;

  ball.vel.y += GRAVITY * dt;
  ball.vel.x += state.wind * dt;

  ball.pos.x += ball.vel.x * dt;
  ball.pos.y += ball.vel.y * dt;
  ball.rotation += ball.vel.x * dt * 0.05;

  checkRimCollision(state);
  checkBackboardCollision(state);
  checkScore(state);
  checkOutOfBounds(state);
}

function checkRimCollision(state: GameState): void {
  const { ball, hoop } = state;
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
        ball.vel.x -= (1 + RESTITUTION) * relVel * nx;
        ball.vel.y -= (1 + RESTITUTION) * relVel * ny;
      }
      ball.pos.x = rp.x + nx * minDist;
      ball.pos.y = rp.y + ny * minDist;
    }
  }
}

function checkBackboardCollision(state: GameState): void {
  const { ball, hoop } = state;
  if (
    ball.pos.x + ball.radius > hoop.backboardX &&
    ball.pos.y > hoop.backboardTop &&
    ball.pos.y < hoop.backboardBottom
  ) {
    ball.pos.x = hoop.backboardX - ball.radius;
    ball.vel.x = -ball.vel.x * RESTITUTION;
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
    state.phase = 'scored';
    state.feedbackType = 'score';
    state.feedbackTimer = CONFIG.FEEDBACK_DURATION;
    playSound('score');

    const shift = Math.min(state.streak * 8, state.canvasW * 0.15);
    state.player.x = state.player.baseX + shift;
  }
}

function checkOutOfBounds(state: GameState): void {
  const { ball, canvasW, canvasH } = state;
  const groundY = canvasH * CONFIG.GROUND_Y_RATIO;

  if (ball.pos.y > groundY + 30 || ball.pos.x > canvasW + 50 || ball.pos.x < -50) {
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
  return CONFIG.IDEAL_POWER;
}

export function isWithinTolerance(power: number, ideal: number): boolean {
  return Math.abs(power - ideal) <= ideal * CONFIG.POWER_TOLERANCE;
}
