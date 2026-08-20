const SFX_KEY = 'ftf_sfx_muted';
const MUSIC_KEY = 'ftf_music_muted';

function readFlag(key: string, fallback = false): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === '1' || raw === 'true';
  } catch {
    return fallback;
  }
}

function writeFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {}
}

export function isSfxMuted(): boolean {
  return readFlag(SFX_KEY);
}

export function isMusicMuted(): boolean {
  return readFlag(MUSIC_KEY);
}

export function setSfxMuted(muted: boolean): void {
  writeFlag(SFX_KEY, muted);
}

export function setMusicMuted(muted: boolean): void {
  writeFlag(MUSIC_KEY, muted);
}

export function toggleSfxMuted(): boolean {
  const next = !isSfxMuted();
  setSfxMuted(next);
  return next;
}

export function toggleMusicMuted(): boolean {
  const next = !isMusicMuted();
  setMusicMuted(next);
  return next;
}
