import {
  JERSEY_ITEMS,
  getUnlockedJerseys,
  unlockJersey,
  purchaseJersey,
  getActiveJersey,
  setActiveJersey,
  clearJerseyProgress,
  getJerseyById,
} from '../utils/jerseyData';
import { resetEconomyAndUnlocks, getSavedCoins, saveCoins, getUnlockedBackgrounds, unlockBackground } from '../utils/shopData';
import {
  rollShotIdealPower,
  getEffectiveShotTolerance,
  isWithinTolerance,
} from '../engine/physics';
import { createInitialState, resetBall } from '../engine/gameState';
import { CONFIG } from '../engine/config';
import { DIFFICULTY_CONFIGS } from '../utils/difficultyData';

jest.mock('../engine/audio', () => ({
  playSound: jest.fn(),
}));

describe('NBA Jerseys (30 teams)', () => {
  beforeEach(() => localStorage.clear());

  it('should list all 30 current NBA teams', () => {
    expect(JERSEY_ITEMS).toHaveLength(30);
    const ids = new Set(JERSEY_ITEMS.map((j) => j.id));
    expect(ids.size).toBe(30);
  });

  it('should default unlock and active to Pistons', () => {
    expect(getUnlockedJerseys()).toEqual(['det']);
    expect(getActiveJersey()).toBe('det');
    expect(getJerseyById('det').price).toBe(0);
  });

  it('should purchase a jersey and deduct coins', () => {
    saveCoins(200);
    const result = purchaseJersey('lal', 200);
    expect(result.success).toBe(true);
    expect(result.remainingCoins).toBe(200 - getJerseyById('lal').price);
    expect(getUnlockedJerseys()).toContain('lal');
    expect(getActiveJersey()).toBe('lal');
  });

  it('should reject jersey purchase without enough coins', () => {
    const result = purchaseJersey('gsw', 5);
    expect(result.success).toBe(false);
    expect(getUnlockedJerseys()).not.toContain('gsw');
  });
});

describe('Restart economy wipe', () => {
  beforeEach(() => localStorage.clear());

  it('should clear coins, courts, and jerseys but keep high score', () => {
    saveCoins(500);
    unlockBackground('park');
    unlockJersey('lal');
    setActiveJersey('lal');
    localStorage.setItem('ftf_highscore', '42');

    resetEconomyAndUnlocks();

    expect(getSavedCoins()).toBe(0);
    expect(getUnlockedBackgrounds()).toEqual(['stadium']);
    expect(getUnlockedJerseys()).toEqual(['det']);
    expect(getActiveJersey()).toBe('det');
    expect(localStorage.getItem('ftf_highscore')).toBe('42');
  });

  it('clearJerseyProgress resets to default', () => {
    unlockJersey('bos');
    setActiveJersey('bos');
    clearJerseyProgress();
    expect(getUnlockedJerseys()).toEqual(['det']);
    expect(getActiveJersey()).toBe('det');
  });
});

describe('Per-shot ideal + near-ideal bonus', () => {
  it('NEAR_IDEAL_MAKE_BONUS should be 0.04', () => {
    expect(CONFIG.NEAR_IDEAL_MAKE_BONUS).toBe(0.04);
  });

  it('rollShotIdealPower should stay within bounds around baseline', () => {
    const base = DIFFICULTY_CONFIGS.medium.idealPower;
    for (let i = 0; i < 40; i++) {
      const rolled = rollShotIdealPower(base);
      expect(rolled).toBeGreaterThanOrEqual(0.35);
      expect(rolled).toBeLessThanOrEqual(0.85);
      expect(Math.abs(rolled - base)).toBeLessThanOrEqual(CONFIG.SHOT_IDEAL_JITTER + 1e-9);
    }
  });

  it('getEffectiveShotTolerance should widen base zone by 4%', () => {
    const state = createInitialState(CONFIG.CANVAS_W, CONFIG.CANVAS_H, 'medium');
    state.shotIdealPower = 0.55;
    const base = 0.55 * state.difficultyConfig.powerTolerance;
    expect(getEffectiveShotTolerance(state)).toBeCloseTo(base + 0.04, 5);
  });

  it('resetBall should re-roll shotIdealPower', () => {
    const state = createInitialState(CONFIG.CANVAS_W, CONFIG.CANVAS_H, 'medium');
    const samples = new Set<number>();
    for (let i = 0; i < 30; i++) {
      resetBall(state);
      samples.add(Number(state.shotIdealPower.toFixed(5)));
    }
    expect(samples.size).toBeGreaterThan(1);
  });

  it('isWithinTolerance should accept power inside bonus-widened window', () => {
    const ideal = 0.55;
    const baseTol = ideal * 0.03;
    const widened = baseTol + CONFIG.NEAR_IDEAL_MAKE_BONUS;
    const edge = ideal + baseTol + CONFIG.NEAR_IDEAL_MAKE_BONUS * 0.5;
    expect(isWithinTolerance(edge, ideal, widened)).toBe(true);
    expect(isWithinTolerance(edge, ideal, baseTol)).toBe(false);
  });
});
