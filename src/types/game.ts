export type GamePhase = 'idle' | 'charging' | 'flying' | 'falling_through' | 'scored' | 'missed' | 'gameover';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  label: string;
  description: string;
  color: string;
  // Layout
  playerXRatio: number;
  hoopXRatio: number;
  rimWidth: number;
  backboardExtendTop: number;
  // Shot window
  idealPower: number;
  powerTolerance: number;
  // Physics
  gravity: number;
  restitution: number;
  windRange: number;
  chargeDuration: number;
  groundRestitution: number;
}

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

export type BackgroundId =
  | 'stadium'
  | 'park'
  | 'farm'
  | 'desert'
  | 'pirate'
  | 'amazon'
  | 'rooftop'
  | 'space';

export interface ShopItem {
  id: BackgroundId;
  name: string;
  price: number;
  description: string;
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
  activeBackground: BackgroundId;
  bounceCount: number;
  difficulty: Difficulty;
  difficultyConfig: DifficultyConfig;
}

export interface GameCallbacks {
  onStateChange: (s: GameState) => void;
}
