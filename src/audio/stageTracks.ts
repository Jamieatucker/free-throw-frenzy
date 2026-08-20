import { BackgroundId } from '../types/game';

/** Generated looping stage themes (each ≤ 25s). Rendered at runtime in `engine/music.ts`. */
export const STAGE_TRACKS: Record<BackgroundId, { title: string; vibe: string }> = {
  stadium: { title: 'Arena Pulse', vibe: 'crowd-ready organ stabs and a ticking shot-clock beat' },
  park: { title: 'Open Gym', vibe: 'bright outdoor bounce, light and hopeful' },
  farm: { title: 'Barn Court', vibe: 'slower folk bounce under open sky' },
  desert: { title: 'Heat Haze', vibe: 'sparse pentatonic tension in dry air' },
  pirate: { title: 'Crow\'s Nest', vibe: 'minor-key shanty pulse on the water' },
  amazon: { title: 'Canopy Drive', vibe: 'percussion-forward jungle suspense' },
  rooftop: { title: 'Night Game', vibe: 'urban night beat over the skyline' },
  space: { title: 'Zero-G', vibe: 'slow sci-fi pad and distant pulse' },
};
