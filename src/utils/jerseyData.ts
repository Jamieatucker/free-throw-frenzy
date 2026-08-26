import { JerseyId, JerseyItem } from '../types/game';

/** All 30 current NBA teams — colors only (no logos). Inspired by public jersey history refs. */
export const JERSEY_ITEMS: JerseyItem[] = [
  { id: 'atl', name: 'Atlanta Hawks', primary: '#E03A3E', secondary: '#C1D32F', price: 60 },
  { id: 'bos', name: 'Boston Celtics', primary: '#007A33', secondary: '#BA9653', price: 80 },
  { id: 'bkn', name: 'Brooklyn Nets', primary: '#000000', secondary: '#FFFFFF', price: 50 },
  { id: 'cha', name: 'Charlotte Hornets', primary: '#1D1160', secondary: '#00788C', price: 55 },
  { id: 'chi', name: 'Chicago Bulls', primary: '#CE1141', secondary: '#000000', price: 90 },
  { id: 'cle', name: 'Cleveland Cavaliers', primary: '#860038', secondary: '#FDBB30', price: 70 },
  { id: 'dal', name: 'Dallas Mavericks', primary: '#00538C', secondary: '#B8C4CA', price: 65 },
  { id: 'den', name: 'Denver Nuggets', primary: '#0E2240', secondary: '#FEC524', price: 75 },
  { id: 'det', name: 'Detroit Pistons', primary: '#1D428A', secondary: '#C8102E', price: 0 },
  { id: 'gsw', name: 'Golden State Warriors', primary: '#1D428A', secondary: '#FFC72C', price: 100 },
  { id: 'hou', name: 'Houston Rockets', primary: '#CE1141', secondary: '#000000', price: 60 },
  { id: 'ind', name: 'Indiana Pacers', primary: '#002D62', secondary: '#FDBB30', price: 55 },
  { id: 'lac', name: 'LA Clippers', primary: '#C8102E', secondary: '#1D428A', price: 70 },
  { id: 'lal', name: 'Los Angeles Lakers', primary: '#552583', secondary: '#FDB927', price: 110 },
  { id: 'mem', name: 'Memphis Grizzlies', primary: '#5D76A9', secondary: '#12173F', price: 50 },
  { id: 'mia', name: 'Miami Heat', primary: '#98002E', secondary: '#F9A01B', price: 85 },
  { id: 'mil', name: 'Milwaukee Bucks', primary: '#00471B', secondary: '#EEE1C6', price: 80 },
  { id: 'min', name: 'Minnesota Timberwolves', primary: '#0C2340', secondary: '#236192', price: 50 },
  { id: 'nop', name: 'New Orleans Pelicans', primary: '#0C2340', secondary: '#C8102E', price: 55 },
  { id: 'nyk', name: 'New York Knicks', primary: '#006BB6', secondary: '#F58426', price: 95 },
  { id: 'okc', name: 'Oklahoma City Thunder', primary: '#007AC1', secondary: '#EF3B24', price: 65 },
  { id: 'orl', name: 'Orlando Magic', primary: '#0077C0', secondary: '#C4CED4', price: 50 },
  { id: 'phi', name: 'Philadelphia 76ers', primary: '#006BB6', secondary: '#ED174C', price: 75 },
  { id: 'phx', name: 'Phoenix Suns', primary: '#1D1160', secondary: '#E56020', price: 70 },
  { id: 'por', name: 'Portland Trail Blazers', primary: '#E03A3E', secondary: '#000000', price: 60 },
  { id: 'sac', name: 'Sacramento Kings', primary: '#5A2D81', secondary: '#63727A', price: 50 },
  { id: 'sas', name: 'San Antonio Spurs', primary: '#C4CED4', secondary: '#000000', price: 65 },
  { id: 'tor', name: 'Toronto Raptors', primary: '#CE1141', secondary: '#000000', price: 80 },
  { id: 'uta', name: 'Utah Jazz', primary: '#002B5C', secondary: '#00471B', price: 55 },
  { id: 'was', name: 'Washington Wizards', primary: '#002B5C', secondary: '#E31837', price: 55 },
];

const DEFAULT_JERSEY: JerseyId = 'det';
const UNLOCKED_KEY = 'ftf_unlocked_jerseys';
const ACTIVE_KEY = 'ftf_active_jersey';

export function getJerseyById(id: JerseyId): JerseyItem {
  return JERSEY_ITEMS.find((j) => j.id === id) ?? JERSEY_ITEMS.find((j) => j.id === DEFAULT_JERSEY)!;
}

export function getUnlockedJerseys(): JerseyId[] {
  try {
    const raw = localStorage.getItem(UNLOCKED_KEY);
    const parsed: JerseyId[] = raw ? JSON.parse(raw) : [];
    if (!parsed.includes(DEFAULT_JERSEY)) parsed.unshift(DEFAULT_JERSEY);
    return parsed;
  } catch {
    return [DEFAULT_JERSEY];
  }
}

export function unlockJersey(id: JerseyId): void {
  try {
    const unlocked = getUnlockedJerseys();
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
    }
  } catch {}
}

export function getActiveJersey(): JerseyId {
  try {
    const id = localStorage.getItem(ACTIVE_KEY) as JerseyId | null;
    if (id && JERSEY_ITEMS.some((j) => j.id === id)) return id;
    return DEFAULT_JERSEY;
  } catch {
    return DEFAULT_JERSEY;
  }
}

export function setActiveJersey(id: JerseyId): void {
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {}
}

export function purchaseJersey(
  id: JerseyId,
  currentCoins: number
): { success: boolean; remainingCoins: number } {
  const item = getJerseyById(id);
  const unlocked = getUnlockedJerseys();
  if (unlocked.includes(id)) return { success: false, remainingCoins: currentCoins };
  if (currentCoins < item.price) return { success: false, remainingCoins: currentCoins };
  const remaining = currentCoins - item.price;
  unlockJersey(id);
  try {
    localStorage.setItem('ftf_coins', String(remaining));
  } catch {}
  setActiveJersey(id);
  return { success: true, remainingCoins: remaining };
}

export function clearJerseyProgress(): void {
  try {
    localStorage.removeItem(UNLOCKED_KEY);
    localStorage.setItem(ACTIVE_KEY, DEFAULT_JERSEY);
  } catch {}
}

/** Cel-shade helpers from a hex primary. */
export function shadeHex(hex: string, amount: number): string {
  const n = hex.replace('#', '');
  const num = parseInt(n.length === 3 ? n.split('').map((c) => c + c).join('') : n, 16);
  if (Number.isNaN(num)) return hex;
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
