import { GameState, Hoop } from '../types/game';

export function createHoop(canvasW: number, canvasH: number): Hoop {
  const groundY = canvasH * 0.82;
  const rimY = groundY - canvasH * 0.38;
  const backboardX = canvasW * 0.78;
  const rimWidth = 50;
  return {
    backboardX,
    backboardTop: rimY - 60,
    backboardBottom: rimY + 10,
    rimY,
    rimLeftX: backboardX - rimWidth,
    rimRightX: backboardX - 4,
    rimRadius: 5,
    netBottom: rimY + 45,
  };
}

export function createInitialState(canvasW: number, canvasH: number): GameState {
  const groundY = canvasH * 0.82;
  const playerX = canvasW * 0.18;
  const hoop = createHoop(canvasW, canvasH);
  return {
    phase: 'idle',
    ball: {
      pos: { x: playerX + 20, y: groundY - 80 },
      vel: { x: 0, y: 0 },
      radius: 14,
      rotation: 0,
    },
    hoop,
    player: { x: playerX, y: groundY, baseX: playerX },
    score: 0,
    streak: 0,
    multiplier: 1,
    currency: 0,
    chargePower: 0,
    shotTimer: 10,
    wind: 0,
    canvasW,
    canvasH,
    feedbackTimer: 0,
    feedbackType: null,
  };
}

export function resetBall(state: GameState): void {
  const groundY = state.canvasH * 0.82;
  state.ball.pos.x = state.player.x + 20;
  state.ball.pos.y = groundY - 80;
  state.ball.vel.x = 0;
  state.ball.vel.y = 0;
  state.ball.rotation = 0;
  state.chargePower = 0;
  state.shotTimer = 10;
  state.wind = (Math.random() - 0.5) * 40;
  state.phase = 'idle';
}
