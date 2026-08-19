import { GameState, Hoop, Difficulty, DifficultyConfig } from '../types/game';
import { CONFIG } from './config';
import { getActiveBackground } from '../utils/shopData';
import { DIFFICULTY_CONFIGS } from '../utils/difficultyData';

function createHoop(canvasW: number, canvasH: number, dc: DifficultyConfig): Hoop {
  const groundY = canvasH * CONFIG.GROUND_Y_RATIO;
  const rimY = groundY - canvasH * 0.38;
  const backboardX = canvasW * dc.hoopXRatio;
  return {
    backboardX,
    backboardTop: rimY - dc.backboardExtendTop,
    backboardBottom: rimY + 15,
    rimY,
    rimLeftX: backboardX - dc.rimWidth,
    rimRightX: backboardX - 4,
    rimRadius: CONFIG.RIM_RADIUS,
    netBottom: rimY + 45,
  };
}

export function createInitialState(canvasW: number, canvasH: number, difficulty: Difficulty = 'medium'): GameState {
  const dc = DIFFICULTY_CONFIGS[difficulty];
  const groundY = canvasH * CONFIG.GROUND_Y_RATIO;
  const playerX = canvasW * dc.playerXRatio;
  const hoop = createHoop(canvasW, canvasH, dc);
  return {
    phase: 'idle',
    ball: {
      pos: { x: playerX + 20, y: groundY - 80 },
      vel: { x: 0, y: 0 },
      radius: CONFIG.BALL_RADIUS,
      rotation: 0,
    },
    hoop,
    player: { x: playerX, y: groundY, baseX: playerX },
    score: 0,
    streak: 0,
    multiplier: 1,
    currency: 0,
    chargePower: 0,
    shotTimer: CONFIG.SHOT_TIMER,
    wind: 0,
    canvasW,
    canvasH,
    feedbackTimer: 0,
    feedbackType: null,
    activeBackground: getActiveBackground(),
    bounceCount: 0,
    difficulty,
    difficultyConfig: dc,
  };
}

export function resetBall(state: GameState): void {
  const groundY = state.canvasH * CONFIG.GROUND_Y_RATIO;
  state.ball.pos.x = state.player.x + 20;
  state.ball.pos.y = groundY - 80;
  state.ball.vel.x = 0;
  state.ball.vel.y = 0;
  state.ball.rotation = 0;
  state.chargePower = 0;
  state.shotTimer = CONFIG.SHOT_TIMER;
  state.wind = (Math.random() - 0.5) * state.difficultyConfig.windRange * 2;
  state.bounceCount = 0;
  state.phase = 'idle';
}

export function getHighScore(): number {
  try {
    return parseInt(localStorage.getItem('ftf_highscore') || '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(score: number): void {
  try {
    const current = getHighScore();
    if (score > current) localStorage.setItem('ftf_highscore', String(score));
  } catch {}
}
