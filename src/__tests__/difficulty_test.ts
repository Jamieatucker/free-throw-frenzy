import { DIFFICULTY_CONFIGS, DIFFICULTIES } from '../utils/difficultyData';
import { Difficulty } from '../types/game';

describe('DifficultyData', () => {
  it('should define configs for all three difficulties', () => {
    expect(DIFFICULTIES).toEqual(['easy', 'medium', 'hard']);
    for (const d of DIFFICULTIES) {
      expect(DIFFICULTY_CONFIGS[d]).toBeDefined();
    }
  });

  it('easy should be most forgiving across all axes', () => {
    const e = DIFFICULTY_CONFIGS.easy;
    const m = DIFFICULTY_CONFIGS.medium;
    const h = DIFFICULTY_CONFIGS.hard;

    // Rim width: easy > medium > hard
    expect(e.rimWidth).toBeGreaterThan(m.rimWidth);
    expect(m.rimWidth).toBeGreaterThan(h.rimWidth);

    // Gravity: easy < medium < hard
    expect(e.gravity).toBeLessThan(m.gravity);
    expect(m.gravity).toBeLessThan(h.gravity);

    // Wind range: easy < medium < hard
    expect(e.windRange).toBeLessThan(m.windRange);
    expect(m.windRange).toBeLessThan(h.windRange);

    // Power tolerance: easy > medium > hard (larger = more forgiving)
    expect(e.powerTolerance).toBeGreaterThan(m.powerTolerance);
    expect(m.powerTolerance).toBeGreaterThan(h.powerTolerance);

    // Charge duration: easy > medium > hard (more time = easier)
    expect(e.chargeDuration).toBeGreaterThan(m.chargeDuration);
    expect(m.chargeDuration).toBeGreaterThan(h.chargeDuration);
  });

  it('each config should have a label, description, and color', () => {
    for (const d of DIFFICULTIES) {
      const cfg = DIFFICULTY_CONFIGS[d as Difficulty];
      expect(cfg.label.length).toBeGreaterThan(0);
      expect(cfg.description.length).toBeGreaterThan(0);
      expect(cfg.color).toMatch(/^#/);
    }
  });

  it('player should be further on harder difficulties', () => {
    const e = DIFFICULTY_CONFIGS.easy;
    const m = DIFFICULTY_CONFIGS.medium;
    const h = DIFFICULTY_CONFIGS.hard;
    // Larger hoopXRatio and smaller playerXRatio = more distance
    expect(h.hoopXRatio).toBeGreaterThan(m.hoopXRatio);
    expect(h.playerXRatio).toBeLessThan(m.playerXRatio);
    expect(m.playerXRatio).toBeLessThan(e.playerXRatio);
  });

  it('backboard should be taller on harder difficulties', () => {
    const e = DIFFICULTY_CONFIGS.easy;
    const h = DIFFICULTY_CONFIGS.hard;
    expect(h.backboardExtendTop).toBeGreaterThan(e.backboardExtendTop);
  });
});
