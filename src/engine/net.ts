import { GameState } from '../types/game';
import { CONFIG } from './config';
import { clamp } from '../utils/math';

export type NetLayer = 'back' | 'front';

export interface NetCord {
  topX: number;
  topY: number;
  midX: number;
  midY: number;
  bottomX: number;
  bottomY: number;
  layer: NetLayer;
}

export interface NetBand {
  y: number;
  leftX: number;
  rightX: number;
  gapLeftX: number | null;
  gapRightX: number | null;
  layer: NetLayer;
}

export function isBallPassingThroughNet(state: GameState): boolean {
  if (state.phase !== 'falling_through' && state.netSwish < 0.55) return false;
  const { ball, hoop } = state;
  return (
    ball.pos.x + ball.radius > hoop.rimLeftX - 8 &&
    ball.pos.x - ball.radius < hoop.rimRightX + 8 &&
    ball.pos.y + ball.radius > hoop.rimY - 4 &&
    ball.pos.y - ball.radius < hoop.netBottom + 40
  );
}

export function getNetStretch(state: GameState): number {
  if (!isBallPassingThroughNet(state)) {
    return 10 * state.netSwish * Math.sin((1 - state.netSwish) * Math.PI * 7);
  }
  const { ball, hoop } = state;
  const protrusion = ball.pos.y + ball.radius - hoop.netBottom;
  return clamp(protrusion + 12, 6, 34);
}

export function computeNetCords(state: GameState, nowMs = 0): NetCord[] {
  const { hoop, ball } = state;
  const count = CONFIG.NET_CORD_COUNT;
  const topY = hoop.rimY + 3;
  const restBottomY = hoop.netBottom;
  const stretch = getNetStretch(state);
  const wrapping = isBallPassingThroughNet(state);
  const cords: NetCord[] = [];

  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const topX = hoop.rimLeftX + t * (hoop.rimRightX - hoop.rimLeftX);
    const idleSway = wrapping ? 0 : Math.sin(nowMs / 400 + i) * 2;
    const swishSway = state.netSwish * Math.sin((1 - state.netSwish) * 16 + i) * 7 * (t - 0.5);
    let bottomX =
      hoop.rimLeftX + 12 + t * (hoop.rimRightX - hoop.rimLeftX - 24) + idleSway + swishSway;
    let bottomY = restBottomY + stretch * (0.45 + 0.55 * (1 - Math.abs(t - 0.5) * 1.4));

    const restMidX = (topX + bottomX) / 2;
    const restMidY = (topY + bottomY) / 2 + 5;
    let midX = restMidX + idleSway;
    let midY = restMidY;

    const layer: NetLayer = i % 2 === 0 ? 'back' : 'front';

    if (wrapping) {
      const pad = CONFIG.NET_WRAP_PADDING;
      const preferRight = t >= 0.5;
      const closest = closestPointOnSegment(topX, topY, bottomX, bottomY, ball.pos.x, ball.pos.y);
      const wrapped = wrapAroundBall(
        closest.x,
        closest.y,
        ball.pos.x,
        ball.pos.y,
        ball.radius + pad,
        preferRight,
        layer
      );
      midX = wrapped.x;
      midY = wrapped.y;
      if (ball.pos.y + ball.radius > restBottomY - 8) {
        const bottomWrapped = wrapAroundBall(
          bottomX,
          bottomY,
          ball.pos.x,
          ball.pos.y,
          ball.radius + pad * 0.6,
          preferRight,
          layer
        );
        bottomX = bottomWrapped.x;
        bottomY = Math.max(bottomY, bottomWrapped.y);
      }
    }

    cords.push({ topX, topY, midX, midY, bottomX, bottomY, layer });
  }
  return cords;
}

export function computeNetBands(state: GameState): NetBand[] {
  const { hoop, ball } = state;
  const stretch = getNetStretch(state);
  const wrapping = isBallPassingThroughNet(state);
  const bands: NetBand[] = [];

  for (let row = 1; row <= 3; row++) {
    const t = row / 4;
    const y = hoop.rimY + 3 + t * (hoop.netBottom - hoop.rimY - 3) + stretch * t;
    const inset = t * 12;
    const leftX = hoop.rimLeftX + inset;
    const rightX = hoop.rimRightX - inset;
    let gapLeftX: number | null = null;
    let gapRightX: number | null = null;

    if (wrapping) {
      const dy = y - ball.pos.y;
      const r = ball.radius + CONFIG.NET_WRAP_PADDING;
      if (Math.abs(dy) < r) {
        const half = Math.sqrt(Math.max(0, r * r - dy * dy));
        gapLeftX = ball.pos.x - half;
        gapRightX = ball.pos.x + half;
      }
    }

    bands.push({ y, leftX, rightX, gapLeftX, gapRightX, layer: 'back' });
    if (gapLeftX !== null) {
      bands.push({ y, leftX, rightX, gapLeftX, gapRightX, layer: 'front' });
    }
  }
  return bands;
}

function closestPointOnSegment(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  px: number,
  py: number
): { x: number; y: number } {
  const abx = bx - ax;
  const aby = by - ay;
  const denom = abx * abx + aby * aby;
  const t = denom === 0 ? 0 : clamp(((px - ax) * abx + (py - ay) * aby) / denom, 0, 1);
  return { x: ax + t * abx, y: ay + t * aby };
}

function wrapAroundBall(
  x: number,
  y: number,
  bx: number,
  by: number,
  minDist: number,
  preferRight: boolean,
  layer: NetLayer
): { x: number; y: number } {
  const dx = x - bx;
  const dy = y - by;
  const dist = Math.hypot(dx, dy);
  const frontBias = layer === 'front' ? 0.4 : -0.25;

  if (dist < 0.001) {
    const side = preferRight ? 1 : -1;
    return { x: bx + side * minDist, y: by + frontBias * minDist };
  }
  if (dist >= minDist) {
    return { x, y };
  }
  let nx = dx / dist;
  let ny = dy / dist;
  if (Math.abs(nx) < 0.2) {
    nx = preferRight ? 0.6 : -0.6;
    const len = Math.hypot(nx, ny);
    nx /= len;
    ny /= len;
  }
  ny += frontBias;
  const len = Math.hypot(nx, ny) || 1;
  return {
    x: bx + (nx / len) * minDist,
    y: by + (ny / len) * minDist,
  };
}
