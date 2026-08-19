export type GamePhase = 'idle' | 'charging' | 'flying' | 'scored' | 'missed' | 'gameover';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Ball {
  pos: Vec2;
  vel: Vec2;
  radius: number;
  rotation: number;
}

export interface Hoop {
  backboardX: number;
  backboardTop: number;
  backboardBottom: number;
  rimY: number;
  rimLeftX: number;
  rimRightX: number;
  rimRadius: number;
  netBottom: number;
}

export interface Player {
  x: number;
  y: number;
  baseX: number;
}

export interface GameState {
  phase: GamePhase;
  ball: Ball;
  hoop: Hoop;
  player: Player;
  score: number;
  streak: number;
  multiplier: number;
  currency: number;
  chargePower: number;
  shotTimer: number;
  wind: number;
  canvasW: number;
  canvasH: number;
  feedbackTimer: number;
  feedbackType: 'score' | 'miss' | null;
}

export interface GameCallbacks {
  onStateChange: (s: GameState) => void;
}
