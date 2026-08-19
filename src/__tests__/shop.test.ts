import {
  getUnlockedBackgrounds,
  unlockBackground,
  purchaseBackground,
  getSavedCoins,
  saveCoins,
  getActiveBackground,
  setActiveBackground,
} from '../utils/shopData';

describe('Shop System', () => {
  beforeEach(() => localStorage.clear());

  it('should start with only stadium unlocked', () => {
    const unlocked = getUnlockedBackgrounds();
    expect(unlocked).toContain('stadium');
    expect(unlocked.length).toBe(1);
  });

  it('should unlock a new background', () => {
    unlockBackground('park');
    const unlocked = getUnlockedBackgrounds();
    expect(unlocked).toContain('park');
    expect(unlocked).toContain('stadium');
  });

  it('should not duplicate unlocks', () => {
    unlockBackground('park');
    unlockBackground('park');
    const unlocked = getUnlockedBackgrounds();
    expect(unlocked.filter(b => b === 'park').length).toBe(1);
  });

  it('should purchase a background and deduct coins', () => {
    const result = purchaseBackground('park', 100);
    expect(result.success).toBe(true);
    expect(result.remainingCoins).toBe(50);
    expect(getUnlockedBackgrounds()).toContain('park');
  });

  it('should reject purchase with insufficient coins', () => {
    const result = purchaseBackground('park', 10);
    expect(result.success).toBe(false);
    expect(result.remainingCoins).toBe(10);
  });

  it('should reject purchase of already owned background', () => {
    purchaseBackground('park', 100);
    const result = purchaseBackground('park', 100);
    expect(result.success).toBe(false);
  });

  it('should persist and retrieve coins', () => {
    saveCoins(500);
    expect(getSavedCoins()).toBe(500);
  });

  it('should persist active background', () => {
    setActiveBackground('desert');
    expect(getActiveBackground()).toBe('desert');
  });
});
