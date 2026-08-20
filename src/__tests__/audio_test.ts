import {
  isSfxMuted,
  isMusicMuted,
  setSfxMuted,
  setMusicMuted,
  toggleSfxMuted,
  toggleMusicMuted,
} from '../utils/audioSettings';
import { STAGE_TRACKS } from '../audio/stageTracks';
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

describe('Stage music catalog', () => {
  it('should define a unique looping track for every stage', () => {
    const titles = BACKGROUNDS.map((id) => STAGE_TRACKS[id].title);
    expect(new Set(titles).size).toBe(BACKGROUNDS.length);
  });
});
