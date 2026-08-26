import { ShopItem, BackgroundId } from '../types/game';
import { clearJerseyProgress } from './jerseyData';

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'park', name: 'Basketball Park', price: 50, description: 'Outdoor courts under blue skies' },
  { id: 'farm', name: 'Farm', price: 100, description: 'Shoot hoops by the barn' },
  { id: 'desert', name: 'Desert', price: 150, description: 'Dusty courts under blazing sun' },
  { id: 'pirate', name: 'Pirate Ship', price: 200, description: 'Swish shots on the high seas' },
  { id: 'amazon', name: 'Amazon Jungle', price: 250, description: 'Deep in the rainforest canopy' },
  { id: 'rooftop', name: 'NYC Rooftop', price: 300, description: 'City lights and skyline views' },
  { id: 'space', name: 'Outer Space', price: 500, description: 'Zero-gravity free throws' },
];

const STORAGE_KEY = 'ftf_unlocked_bgs';
const ACTIVE_BG_KEY = 'ftf_active_bg';
const COINS_KEY = 'ftf_coins';

export function getUnlockedBackgrounds(): BackgroundId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: BackgroundId[] = raw ? JSON.parse(raw) : [];
    if (!parsed.includes('stadium')) parsed.unshift('stadium');
    return parsed;
  } catch {
    return ['stadium'];
  }
}

export function unlockBackground(id: BackgroundId): void {
  try {
    const unlocked = getUnlockedBackgrounds();
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
    }
  } catch {}
}

export function getActiveBackground(): BackgroundId {
  try {
    return (localStorage.getItem(ACTIVE_BG_KEY) as BackgroundId) || 'stadium';
  } catch {
    return 'stadium';
  }
}

export function setActiveBackground(id: BackgroundId): void {
  try {
    localStorage.setItem(ACTIVE_BG_KEY, id);
  } catch {}
}

export function getSavedCoins(): number {
  try {
    return parseInt(localStorage.getItem(COINS_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function saveCoins(coins: number): void {
  try {
    localStorage.setItem(COINS_KEY, String(coins));
  } catch {}
}

export function purchaseBackground(id: BackgroundId, currentCoins: number): { success: boolean; remainingCoins: number } {
  const item = SHOP_ITEMS.find(i => i.id === id);
  if (!item) return { success: false, remainingCoins: currentCoins };
  const unlocked = getUnlockedBackgrounds();
  if (unlocked.includes(id)) return { success: false, remainingCoins: currentCoins };
  if (currentCoins < item.price) return { success: false, remainingCoins: currentCoins };
  const remaining = currentCoins - item.price;
  unlockBackground(id);
  saveCoins(remaining);
  return { success: true, remainingCoins: remaining };
}

/** Wipe coins + courts + jerseys. High score is preserved. */
export function resetEconomyAndUnlocks(): void {
  try {
    localStorage.removeItem(COINS_KEY);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(ACTIVE_BG_KEY, 'stadium');
  } catch {}
  clearJerseyProgress();
}
