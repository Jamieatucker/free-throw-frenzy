import { BackgroundId } from '../types/game';
import { MusicTheme } from '../engine/music';

/** Generated looping stage themes (each ≤ 25s). Rendered at runtime in `engine/music.ts`. */
export const STAGE_TRACKS: Record<BackgroundId, { title: string; vibe: string; theme: MusicTheme }> = {
  stadium: { title: 'Arena Pulse', vibe: 'organ stabs, shot-clock hats, and a four-on-the-floor kick', theme: 'arena' },
  park: { title: 'Open Gym', vibe: 'major-key bounce with high bird-like chirps', theme: 'pastoral' },
  farm: { title: 'Barn Court', vibe: 'slow folk fifths, no drums, harmonica-like lead', theme: 'folk' },
  desert: { title: 'Heat Haze', vibe: 'sparse hijaz melody over a dry wind drone', theme: 'arid' },
  pirate: { title: "Crow's Nest", vibe: '6/8 shanty kick and a climbing minor-key horn line', theme: 'shanty' },
  amazon: { title: 'Canopy Drive', vibe: 'syncopated jungle percussion and short canopy leads', theme: 'jungle' },
  rooftop: { title: 'Night Game', vibe: 'dark urban boom-bap with offbeat bass', theme: 'urban' },
  space: { title: 'Zero-G', vibe: 'lydian pads, drones, and distant signal blips — no drums', theme: 'ambient' },
};
