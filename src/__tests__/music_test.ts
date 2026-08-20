import { STAGE_TRACKS } from '../audio/stageTracks';
import {
  STAGE_THEMES,
  arrangementFingerprint,
  buildArrangement,
  countEventType,
  getStageTheme,
  getTrackDuration,
  getTrackSpec,
} from '../engine/music';
import { BackgroundId } from '../types/game';

const BACKGROUNDS: BackgroundId[] = [
  'stadium', 'park', 'farm', 'desert', 'pirate', 'amazon', 'rooftop', 'space',
];

describe('Stage music themes', () => {
  it('maps every stage to a unique theme', () => {
    const themes = BACKGROUNDS.map((id) => getStageTheme(id));
    expect(new Set(themes).size).toBe(BACKGROUNDS.length);
    expect(STAGE_THEMES.stadium).toBe('arena');
    expect(STAGE_THEMES.park).toBe('pastoral');
    expect(STAGE_THEMES.farm).toBe('folk');
    expect(STAGE_THEMES.desert).toBe('arid');
    expect(STAGE_THEMES.pirate).toBe('shanty');
    expect(STAGE_THEMES.amazon).toBe('jungle');
    expect(STAGE_THEMES.rooftop).toBe('urban');
    expect(STAGE_THEMES.space).toBe('ambient');
  });

  it('keeps catalog titles unique and aligned with engine themes', () => {
    const titles = BACKGROUNDS.map((id) => STAGE_TRACKS[id].title);
    expect(new Set(titles).size).toBe(BACKGROUNDS.length);
    for (const id of BACKGROUNDS) {
      expect(STAGE_TRACKS[id].theme).toBe(getTrackSpec(id).theme);
      expect(getTrackSpec(id).theme).toBe(getStageTheme(id));
    }
  });

  it('each loop is longer than 4s and at most 25s', () => {
    for (const id of BACKGROUNDS) {
      expect(getTrackDuration(id)).toBeGreaterThan(4);
      expect(getTrackDuration(id)).toBeLessThanOrEqual(25);
    }
  });

  it('produces a different arrangement fingerprint per stage', () => {
    const prints = BACKGROUNDS.map((id) => arrangementFingerprint(getTrackSpec(id)));
    expect(new Set(prints).size).toBe(BACKGROUNDS.length);
  });

  it('stadium (arena) has organ stabs and a regular kick', () => {
    const spec = getTrackSpec('stadium');
    expect(spec.theme).toBe('arena');
    expect(countEventType(spec, 'stab')).toBeGreaterThan(0);
    expect(countEventType(spec, 'kick')).toBeGreaterThan(0);
    expect(spec.drums).toBe(true);
  });

  it('park (pastoral) is major-key with bird-like blips and light kick', () => {
    const spec = getTrackSpec('park');
    expect(spec.theme).toBe('pastoral');
    expect(spec.scale).toEqual([0, 2, 4, 7, 9]);
    expect(countEventType(spec, 'blip')).toBeGreaterThan(0);
    expect(countEventType(spec, 'kick')).toBeGreaterThan(0);
    expect(countEventType(spec, 'perc')).toBe(0);
  });

  it('farm (folk) has no drums and uses open-fifth style leads', () => {
    const spec = getTrackSpec('farm');
    expect(spec.theme).toBe('folk');
    expect(spec.drums).toBe(false);
    expect(countEventType(spec, 'kick')).toBe(0);
    expect(countEventType(spec, 'snare')).toBe(0);
    expect(countEventType(spec, 'lead')).toBeGreaterThan(0);
    expect(countEventType(spec, 'pad')).toBeGreaterThan(0);
  });

  it('desert (arid) is sparse with wind and drone, no percussion kit', () => {
    const spec = getTrackSpec('desert');
    expect(spec.theme).toBe('arid');
    expect(spec.drums).toBe(false);
    expect(countEventType(spec, 'wind')).toBeGreaterThan(0);
    expect(countEventType(spec, 'drone')).toBeGreaterThan(0);
    expect(countEventType(spec, 'kick')).toBe(0);
    const desertLeads = countEventType(spec, 'lead');
    const parkLeads = countEventType(getTrackSpec('park'), 'lead');
    expect(desertLeads).toBeLessThan(parkLeads);
  });

  it('pirate (shanty) uses a 12-step bar and dotted kick pattern', () => {
    const spec = getTrackSpec('pirate');
    expect(spec.theme).toBe('shanty');
    expect(spec.stepsPerBar).toBe(12);
    const kicks = buildArrangement(spec).filter((e) => e.type === 'kick');
    const kickSteps = new Set(kicks.map((e) => e.step % 12));
    expect(kickSteps.has(0)).toBe(true);
    expect(kickSteps.has(6)).toBe(true);
    expect(kickSteps.has(4)).toBe(false);
  });

  it('amazon (jungle) is percussion-forward compared with the farm', () => {
    const jungle = getTrackSpec('amazon');
    const farm = getTrackSpec('farm');
    expect(jungle.theme).toBe('jungle');
    expect(countEventType(jungle, 'perc')).toBeGreaterThan(0);
    expect(countEventType(jungle, 'hat')).toBeGreaterThan(countEventType(farm, 'hat'));
    expect(countEventType(jungle, 'kick')).toBeGreaterThan(0);
  });

  it('rooftop (urban) uses boom-bap kick/snare and offbeat bass', () => {
    const spec = getTrackSpec('rooftop');
    expect(spec.theme).toBe('urban');
    expect(countEventType(spec, 'kick')).toBeGreaterThan(0);
    expect(countEventType(spec, 'snare')).toBeGreaterThan(0);
    const bass = buildArrangement(spec).filter((e) => e.type === 'bass');
    expect(bass.some((e) => e.step % 16 === 7)).toBe(true);
  });

  it('space (ambient) has drones/pads and no drum kit', () => {
    const spec = getTrackSpec('space');
    expect(spec.theme).toBe('ambient');
    expect(spec.drums).toBe(false);
    expect(spec.scale).toEqual([0, 2, 6, 7, 11]);
    expect(countEventType(spec, 'drone')).toBeGreaterThan(0);
    expect(countEventType(spec, 'pad')).toBeGreaterThan(0);
    expect(countEventType(spec, 'kick')).toBe(0);
    expect(countEventType(spec, 'snare')).toBe(0);
    expect(countEventType(spec, 'blip')).toBeGreaterThan(0);
  });

  it('every arrangement contains at least one pitched event', () => {
    for (const id of BACKGROUNDS) {
      const pitched = buildArrangement(getTrackSpec(id)).filter((e) => e.midi !== undefined);
      expect(pitched.length).toBeGreaterThan(0);
    }
  });
});
