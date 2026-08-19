import { Difficulty, DifficultyConfig } from '../types/game';

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'Easy',
    description: 'Close to the hoop, wide rim, forgiving timing.',
    color: '#4caf50',
    // Layout — player closer, hoop closer & wider
    playerXRatio: 0.30,
    hoopXRatio: 0.68,
    rimWidth: 80,
    backboardExtendTop: 80,
    // Shot window — very forgiving
    idealPower: 0.50,
    powerTolerance: 0.06,
    // Physics — lighter gravity, shorter charge, calm wind
    gravity: 560,
    restitution: 0.45,
    windRange: 15,
    chargeDuration: 1.8,
    groundRestitution: 0.55,
  },
  medium: {
    label: 'Medium',
    description: 'Standard free-throw distance and conditions.',
    color: '#ffeb3b',
    // Layout — standard distances
    playerXRatio: 0.22,
    hoopXRatio: 0.72,
    rimWidth: 60,
    backboardExtendTop: 95,
    // Shot window — default
    idealPower: 0.55,
    powerTolerance: 0.03,
    // Physics — standard
    gravity: 680,
    restitution: 0.50,
    windRange: 30,
    chargeDuration: 1.5,
    groundRestitution: 0.65,
  },
  hard: {
    label: 'Hard',
    description: 'Long range, narrow rim, gusty winds, fast meter.',
    color: '#f44336',
    // Layout — player far, hoop farther, narrow rim
    playerXRatio: 0.15,
    hoopXRatio: 0.76,
    rimWidth: 44,
    backboardExtendTop: 110,
    // Shot window — very tight
    idealPower: 0.60,
    powerTolerance: 0.015,
    // Physics — heavier gravity, faster charge, strong wind
    gravity: 820,
    restitution: 0.55,
    windRange: 55,
    chargeDuration: 1.1,
    groundRestitution: 0.72,
  },
};

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
