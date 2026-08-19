import { GameState, Vec2 } from '../types/game';

const GRAVITY = 980;
const RESTITUTION = 0.55;

export function launchBall(state: GameState): void {
  const power = state.chargePower;
  const dx = state.hoop.rimLeftX + 20 - state.ball.pos.x;
  const dy = state.hoop.rimY - state.ball.pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const idealSpeed = dist * 1.35;
  const speed = idealSpeed * (0.5 + power * 0.7);

  const idealAngle = Math.atan2(dy - dist * 0.55, dx);
  const angle = idealAngle + (power - 0.72) * 0.4;

  state.ball.vel.x = Math.cos(angle) * speed;
  state.ball.vel.y = Math.sin(angle) * speed;
  state.phase = 'flying';
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
  const inRimX = ball.pos.x > hoop.rimLeftX + 8 && ball.pos.x < hoop.rimRightX - 8;
  const crossedRimY = ball.pos.y > hoop.rimY && ball.pos.y < hoop.rimY + 15;
  const goingDown = ball.vel.y > 0;

  if (inRimX && crossedRimY && goingDown) {
    state.score += state.multiplier;
    state.streak += 1;
    state.multiplier = Math.min(10, state.streak + 1);
    state.currency += state.multiplier;
    state.phase = 'scored';
    state.feedbackType = 'score';
    state.feedbackTimer = 1.2;

    const shift = Math.min(state.streak * 8, state.canvasW * 0.15);
    state.player.x = state.player.baseX + shift;
  }
}

function checkOutOfBounds(state: GameState): void {
  const { ball, canvasW, canvasH } = state;
  const groundY = canvasH * 0.82;

  if (ball.pos.y > groundY + 30 || ball.pos.x > canvasW + 50 || ball.pos.x < -50) {
    if (state.phase === 'flying') {
      state.phase = 'missed';
      state.streak = 0;
      state.multiplier = 1;
      state.feedbackType = 'miss';
      state.feedbackTimer = 1.2;
      state.player.x = state.player.baseX;
    }
  }
}

export function computeIdealPower(state: GameState): number {
  return 0.72;
}

export function isWithinTolerance(power: number, ideal: number): boolean {
  return Math.abs(power - ideal) <= ideal * 0.03;
}
