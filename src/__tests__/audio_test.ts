import {
  isSfxMuted,
  isMusicMuted,
  setSfxMuted,
  setMusicMuted,
  toggleSfxMuted,
  toggleMusicMuted,
} from '../utils/audioSettings';
import { STAGE_TRACKS } from '../audio/stageTracks';
import { getTrackDuration, getTrackSpec } from '../engine/music';
import { BackgroundId } from '../types/game';

const BACKGROUNDS: BackgroundId[] = [
  'stadium', 'park', 'farm', 'desert', 'pirate', 'amazon', 'rooftop', 'space',
];

describe('Audio settings', () => {
  beforeEach(() => localStorage.clear());

  it('should default to unmuted sfx and music', () => {
    expect(isSfxMuted()).toBe(false);
    expect(isMusicMuted()).toBe(false);
  });

  it('should persist sfx mute', () => {
    setSfxMuted(true);
    expect(isSfxMuted()).toBe(true);
    expect(toggleSfxMuted()).toBe(false);
    expect(isSfxMuted()).toBe(false);
  });

  it('should persist music mute', () => {
    setMusicMuted(true);
    expect(isMusicMuted()).toBe(true);
    expect(toggleMusicMuted()).toBe(false);
  });
});

describe('Stage music', () => {
  it('should define a unique looping track for every stage', () => {
    const titles = BACKGROUNDS.map((id) => STAGE_TRACKS[id].title);
    expect(new Set(titles).size).toBe(BACKGROUNDS.length);
  });

  it('each generated loop should be at most 25 seconds', () => {
    for (const id of BACKGROUNDS) {
      expect(getTrackDuration(id)).toBeGreaterThan(4);
      expect(getTrackDuration(id)).toBeLessThanOrEqual(25);
    }
  });

  it('each stage should use a distinct musical recipe', () => {
    const signatures = BACKGROUNDS.map((id) => {
      const t = getTrackSpec(id);
      return `${t.bpm}:${t.root}:${t.leadWave}:${t.filterHz}:${t.drums}:${t.pad}`;
    });
    expect(new Set(signatures).size).toBe(BACKGROUNDS.length);
  });
});
