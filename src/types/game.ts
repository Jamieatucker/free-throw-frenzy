export type GamePhase = 'idle' | 'charging' | 'flying' | 'falling_through' | 'scored' | 'missed' | 'gameover';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  label: string;
  description: string;
  color: string;
  playerXRatio: number;
  hoopXRatio: number;
  rimWidth: number;
  backboardExtendTop: number;
  idealPower: number;
  powerTolerance: number;
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
  prevY: number;
  opacity: number;
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

export interface Camera {
  x: number;
  y: number;
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

export type JerseyId =
  | 'atl' | 'bos' | 'bkn' | 'cha' | 'chi' | 'cle' | 'dal' | 'den' | 'det' | 'gsw'
  | 'hou' | 'ind' | 'lac' | 'lal' | 'mem' | 'mia' | 'mil' | 'min' | 'nop' | 'nyk'
  | 'okc' | 'orl' | 'phi' | 'phx' | 'por' | 'sac' | 'sas' | 'tor' | 'uta' | 'was';

export interface ShopItem {
  id: BackgroundId;
  name: string;
  price: number;
  description: string;
}

export interface JerseyItem {
  id: JerseyId;
  name: string;
  primary: string;
  secondary: string;
  price: number;
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
  activeJersey: JerseyId;
  /** Ideal charge power for the current free throw (re-rolled each reset). */
  shotIdealPower: number;
  bounceCount: number;
  difficulty: Difficulty;
  difficultyConfig: DifficultyConfig;
  camera: Camera;
  netSwish: number;
  passedAboveRim: boolean;
  paused: boolean;
}

export interface GameCallbacks {
  onStateChange: (s: GameState) => void;
}
