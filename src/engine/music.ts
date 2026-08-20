import { BackgroundId } from '../types/game';
import { getAudioContext } from './audio';
import { isMusicMuted } from '../utils/audioSettings';

export type MusicTheme =
  | 'arena'
  | 'pastoral'
  | 'folk'
  | 'arid'
  | 'shanty'
  | 'jungle'
  | 'urban'
  | 'ambient';

export type MusicEventType =
  | 'kick'
  | 'snare'
  | 'hat'
  | 'bass'
  | 'lead'
  | 'pad'
  | 'stab'
  | 'perc'
  | 'blip'
  | 'drone'
  | 'wind';

export interface MusicEvent {
  type: MusicEventType;
  step: number;
  durBeats: number;
  midi?: number;
  gain: number;
}

export interface TrackSpec {
  theme: MusicTheme;
  bpm: number;
  bars: number;
  stepsPerBar: number;
  root: number;
  scale: number[];
  bassWave: OscillatorType;
  leadWave: OscillatorType;
  filterHz: number;
  drums: boolean;
  pad: boolean;
}

export const STAGE_THEMES: Record<BackgroundId, MusicTheme> = {
  stadium: 'arena',
  park: 'pastoral',
  farm: 'folk',
  desert: 'arid',
  pirate: 'shanty',
  amazon: 'jungle',
  rooftop: 'urban',
  space: 'ambient',
};

const TRACKS: Record<BackgroundId, TrackSpec> = {
  stadium: {
    theme: 'arena',
    bpm: 100,
    bars: 4,
    stepsPerBar: 16,
    root: 55,
    scale: [0, 3, 5, 7, 10],
    bassWave: 'square',
    leadWave: 'sawtooth',
    filterHz: 1600,
    drums: true,
    pad: true,
  },
  park: {
    theme: 'pastoral',
    bpm: 112,
    bars: 4,
    stepsPerBar: 16,
    root: 64,
    scale: [0, 2, 4, 7, 9],
    bassWave: 'triangle',
    leadWave: 'sine',
    filterHz: 2200,
    drums: true,
    pad: false,
  },
  farm: {
    theme: 'folk',
    bpm: 84,
    bars: 4,
    stepsPerBar: 16,
    root: 57,
    scale: [0, 2, 4, 7, 11],
    bassWave: 'triangle',
    leadWave: 'triangle',
    filterHz: 1100,
    drums: false,
    pad: true,
  },
  desert: {
    theme: 'arid',
    bpm: 72,
    bars: 4,
    stepsPerBar: 16,
    root: 58,
    scale: [0, 1, 4, 7, 8],
    bassWave: 'sine',
    leadWave: 'sine',
    filterHz: 800,
    drums: false,
    pad: true,
  },
  pirate: {
    theme: 'shanty',
    bpm: 96,
    bars: 4,
    stepsPerBar: 12,
    root: 50,
    scale: [0, 3, 5, 7, 10],
    bassWave: 'square',
    leadWave: 'triangle',
    filterHz: 1050,
    drums: true,
    pad: false,
  },
  amazon: {
    theme: 'jungle',
    bpm: 118,
    bars: 4,
    stepsPerBar: 16,
    root: 53,
    scale: [0, 2, 5, 7, 10],
    bassWave: 'triangle',
    leadWave: 'sawtooth',
    filterHz: 1900,
    drums: true,
    pad: true,
  },
  rooftop: {
    theme: 'urban',
    bpm: 90,
    bars: 4,
    stepsPerBar: 16,
    root: 46,
    scale: [0, 3, 5, 7, 10],
    bassWave: 'square',
    leadWave: 'sawtooth',
    filterHz: 1250,
    drums: true,
    pad: true,
  },
  space: {
    theme: 'ambient',
    bpm: 60,
    bars: 4,
    stepsPerBar: 16,
    root: 45,
    scale: [0, 2, 6, 7, 11],
    bassWave: 'sine',
    leadWave: 'sine',
    filterHz: 620,
    drums: false,
    pad: true,
  },
};

let currentId: BackgroundId | null = null;
let sourceNode: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;
let masterMuted = false;
const bufferCache = new Map<BackgroundId, AudioBuffer>();

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function loopDuration(spec: TrackSpec): number {
  const beatsPerBar = spec.stepsPerBar === 12 ? 3 : 4;
  const seconds = (spec.bars * beatsPerBar * 60) / spec.bpm;
  return Math.min(25, seconds);
}

function push(
  events: MusicEvent[],
  type: MusicEventType,
  step: number,
  durBeats: number,
  midi?: number,
  gain = 0.2
): void {
  events.push({ type, step, durBeats, midi, gain });
}

function degree(spec: TrackSpec, i: number): number {
  return spec.scale[i % spec.scale.length];
}

function buildArena(spec: TrackSpec, total: number): MusicEvent[] {
  const events: MusicEvent[] = [];
  for (let s = 0; s < total; s++) {
    const barStep = s % spec.stepsPerBar;
    if (barStep === 0 || barStep === 8) {
      push(events, 'kick', s, 0.45, undefined, 0.5);
      push(events, 'stab', s, 0.9, spec.root + 7, 0.18);
      push(events, 'stab', s, 0.9, spec.root + 12, 0.12);
    }
    if (barStep === 4 || barStep === 12) push(events, 'snare', s, 0.2, undefined, 0.16);
    if (barStep % 4 === 2) push(events, 'hat', s, 0.08, undefined, 0.06);
    if (barStep === 0) push(events, 'bass', s, 1.5, spec.root - 12, 0.28);
    if (barStep === 8) push(events, 'bass', s, 1.2, spec.root + degree(spec, 2) - 12, 0.22);
  }
  push(events, 'pad', 0, spec.bars * 4, spec.root + 3, 0.06);
  return events;
}

function buildPastoral(spec: TrackSpec, total: number): MusicEvent[] {
  const events: MusicEvent[] = [];
  for (let s = 0; s < total; s++) {
    const barStep = s % spec.stepsPerBar;
    if (barStep === 0) push(events, 'kick', s, 0.3, undefined, 0.32);
    if (barStep === 8) push(events, 'hat', s, 0.1, undefined, 0.07);
    if (barStep === 0 || barStep === 6 || barStep === 10) {
      push(events, 'lead', s, 0.55, spec.root + degree(spec, s) + 12, 0.14);
    }
    if (barStep === 4) push(events, 'blip', s, 0.12, spec.root + 24 + degree(spec, s), 0.08);
    if (barStep === 0) push(events, 'bass', s, 1.8, spec.root - 12, 0.18);
  }
  return events;
}

function buildFolk(spec: TrackSpec, total: number): MusicEvent[] {
  const events: MusicEvent[] = [];
  for (let s = 0; s < total; s++) {
    const barStep = s % spec.stepsPerBar;
    if (barStep === 0) {
      push(events, 'bass', s, 2, spec.root - 12, 0.2);
      push(events, 'lead', s, 1.4, spec.root + 7, 0.12);
    }
    if (barStep === 8) push(events, 'lead', s, 1.1, spec.root + degree(spec, 2), 0.11);
    if (barStep === 4 || barStep === 12) push(events, 'lead', s, 0.7, spec.root + degree(spec, s), 0.1);
  }
  push(events, 'pad', 0, spec.bars * 4, spec.root + 4, 0.05);
  return events;
}

function buildArid(spec: TrackSpec, total: number): MusicEvent[] {
  const events: MusicEvent[] = [];
  push(events, 'wind', 0, spec.bars * 4, undefined, 0.05);
  push(events, 'drone', 0, spec.bars * 4, spec.root - 12, 0.08);
  for (let s = 0; s < total; s++) {
    const barStep = s % spec.stepsPerBar;
    if (barStep === 0 && s % 32 === 0) {
      push(events, 'lead', s, 3.2, spec.root + 12 + degree(spec, 0), 0.1);
    }
    if (barStep === 10 && s % 32 === 10) {
      push(events, 'lead', s, 2.4, spec.root + 7, 0.08);
    }
  }
  push(events, 'pad', 0, spec.bars * 4, spec.root + 1, 0.04);
  return events;
}

function buildShanty(spec: TrackSpec, total: number): MusicEvent[] {
  const events: MusicEvent[] = [];
  for (let s = 0; s < total; s++) {
    const barStep = s % spec.stepsPerBar;
    if (barStep === 0 || barStep === 6) push(events, 'kick', s, 0.35, undefined, 0.42);
    if (barStep === 3 || barStep === 9) push(events, 'snare', s, 0.18, undefined, 0.14);
    if (barStep % 3 === 0) push(events, 'hat', s, 0.07, undefined, 0.05);
    if (barStep === 0) push(events, 'bass', s, 1.4, spec.root - 12, 0.26);
    if (barStep === 4) push(events, 'lead', s, 0.6, spec.root + 7, 0.13);
    if (barStep === 6) push(events, 'lead', s, 0.5, spec.root + 10, 0.12);
    if (barStep === 8) push(events, 'lead', s, 0.9, spec.root + 12, 0.14);
  }
  return events;
}

function buildJungle(spec: TrackSpec, total: number): MusicEvent[] {
  const events: MusicEvent[] = [];
  for (let s = 0; s < total; s++) {
    const barStep = s % spec.stepsPerBar;
    if (barStep === 0 || barStep === 3 || barStep === 6 || barStep === 10) {
      push(events, 'perc', s, 0.12, spec.root - 24 + (barStep % 5), 0.16);
    }
    if (barStep === 0 || barStep === 8) push(events, 'kick', s, 0.28, undefined, 0.4);
    if (barStep === 4 || barStep === 11) push(events, 'snare', s, 0.14, undefined, 0.12);
    if (barStep % 2 === 1) push(events, 'hat', s, 0.06, undefined, 0.05);
    if (barStep === 0) push(events, 'bass', s, 0.9, spec.root - 12, 0.22);
    if (barStep === 5) push(events, 'lead', s, 0.35, spec.root + degree(spec, s) + 12, 0.11);
  }
  push(events, 'pad', 0, spec.bars * 4, spec.root + 10, 0.05);
  return events;
}

function buildUrban(spec: TrackSpec, total: number): MusicEvent[] {
  const events: MusicEvent[] = [];
  for (let s = 0; s < total; s++) {
    const barStep = s % spec.stepsPerBar;
    if (barStep === 0 || barStep === 10) push(events, 'kick', s, 0.4, undefined, 0.48);
    if (barStep === 4 || barStep === 12) push(events, 'snare', s, 0.22, undefined, 0.18);
    if (barStep === 2 || barStep === 6 || barStep === 14) push(events, 'hat', s, 0.08, undefined, 0.07);
    if (barStep === 0 || barStep === 7) push(events, 'bass', s, 0.85, spec.root + degree(spec, barStep === 7 ? 3 : 0) - 12, 0.3);
    if (barStep === 8) push(events, 'lead', s, 0.7, spec.root + 15, 0.1);
  }
  push(events, 'pad', 0, spec.bars * 4, spec.root + 3, 0.07);
  return events;
}

function buildAmbient(spec: TrackSpec, total: number): MusicEvent[] {
  const events: MusicEvent[] = [];
  push(events, 'drone', 0, spec.bars * 4, spec.root - 12, 0.1);
  push(events, 'pad', 0, spec.bars * 4, spec.root + 6, 0.08);
  push(events, 'pad', 0, spec.bars * 4, spec.root + 11, 0.05);
  for (let s = 0; s < total; s++) {
    const barStep = s % spec.stepsPerBar;
    if (barStep === 0 && s % 16 === 0) {
      push(events, 'blip', s, 0.4, spec.root + 24 + degree(spec, s / 16), 0.07);
    }
    if (barStep === 12 && s % 32 === 12) {
      push(events, 'lead', s, 2.8, spec.root + 12 + 6, 0.06);
    }
  }
  return events;
}

const ARRANGERS: Record<MusicTheme, (spec: TrackSpec, total: number) => MusicEvent[]> = {
  arena: buildArena,
  pastoral: buildPastoral,
  folk: buildFolk,
  arid: buildArid,
  shanty: buildShanty,
  jungle: buildJungle,
  urban: buildUrban,
  ambient: buildAmbient,
};

export function buildArrangement(spec: TrackSpec): MusicEvent[] {
  const total = spec.bars * spec.stepsPerBar;
  return ARRANGERS[spec.theme](spec, total);
}

export function arrangementFingerprint(spec: TrackSpec): string {
  return buildArrangement(spec)
    .map((e) => `${e.type}:${e.step}:${e.midi ?? ''}:${e.durBeats}`)
    .join('|');
}

function scheduleTone(
  ctx: BaseAudioContext,
  dest: AudioNode,
  time: number,
  dur: number,
  freq: number,
  type: OscillatorType,
  gain: number
): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(20, freq), time);
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), time + Math.min(0.04, dur * 0.2));
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(g).connect(dest);
  osc.start(time);
  osc.stop(time + dur + 0.03);
}

function addNoiseHit(
  ctx: BaseAudioContext,
  dest: AudioNode,
  time: number,
  dur: number,
  freq: number,
  gain: number,
  type: BiquadFilterType = 'bandpass'
): void {
  const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, time);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  src.connect(filter).connect(g).connect(dest);
  src.start(time);
  src.stop(time + dur + 0.01);
}

export function renderTrackBuffer(ctx: OfflineAudioContext, spec: TrackSpec): void {
  const master = ctx.createGain();
  master.gain.value = 0.22;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = spec.filterHz;
  master.connect(filter).connect(ctx.destination);

  const stepSec = loopDuration(spec) / (spec.bars * spec.stepsPerBar);
  const duration = loopDuration(spec);

  for (const ev of buildArrangement(spec)) {
    const t = Math.min(duration - 0.06, ev.step * stepSec);
    const dur = Math.min(duration - t - 0.02, ev.durBeats * (60 / spec.bpm));
    const freq = ev.midi !== undefined ? midiToFreq(ev.midi) : 80;
    switch (ev.type) {
      case 'kick':
        scheduleTone(ctx, master, t, dur, 68, 'sine', ev.gain);
        break;
      case 'snare':
        addNoiseHit(ctx, master, t, dur, 1800, ev.gain);
        break;
      case 'hat':
        addNoiseHit(ctx, master, t, dur, 7000, ev.gain, 'highpass');
        break;
      case 'perc':
        addNoiseHit(ctx, master, t, dur, 420 + (ev.midi ?? 0) * 8, ev.gain);
        scheduleTone(ctx, master, t, dur * 0.7, freq, 'triangle', ev.gain * 0.5);
        break;
      case 'wind':
        addNoiseHit(ctx, master, t, dur, 900, ev.gain, 'lowpass');
        break;
      case 'stab':
        scheduleTone(ctx, master, t, dur, freq, 'sawtooth', ev.gain);
        break;
      case 'bass':
        scheduleTone(ctx, master, t, dur, freq, spec.bassWave, ev.gain);
        break;
      case 'lead':
      case 'blip':
        scheduleTone(ctx, master, t, dur, freq, spec.leadWave, ev.gain);
        break;
      case 'pad':
      case 'drone':
        scheduleTone(ctx, master, t, dur, freq, 'sine', ev.gain);
        break;
    }
  }
}

async function getBuffer(id: BackgroundId): Promise<AudioBuffer | null> {
  const cached = bufferCache.get(id);
  if (cached) return cached;
  const live = getAudioContext();
  if (!live) return null;
  const spec = TRACKS[id];
  const duration = loopDuration(spec);
  const Offline =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  if (!Offline) return null;
  const offline = new Offline(2, Math.floor(live.sampleRate * duration), live.sampleRate);
  renderTrackBuffer(offline, spec);
  const buffer = await offline.startRendering();
  bufferCache.set(id, buffer);
  return buffer;
}

function stopSource(): void {
  if (sourceNode) {
    try {
      sourceNode.stop();
    } catch {
      /* already stopped */
    }
    try {
      sourceNode.disconnect();
    } catch {
      /* already disconnected */
    }
    sourceNode = null;
  }
}

export async function startMusic(id: BackgroundId): Promise<void> {
  masterMuted = isMusicMuted();
  if (currentId === id && sourceNode) {
    applyMute();
    return;
  }
  const ctx = getAudioContext();
  if (!ctx) return;
  const buffer = await getBuffer(id);
  if (!buffer) return;
  stopSource();
  if (!gainNode) {
    gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.connect(gainNode);
  src.start(0);
  sourceNode = src;
  currentId = id;
  applyMute();
}

export function stopMusic(): void {
  stopSource();
  currentId = null;
}

export function applyMute(): void {
  if (!gainNode) return;
  const ctx = getAudioContext();
  const now = ctx ? ctx.currentTime : 0;
  const target = masterMuted ? 0 : 0.9;
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setTargetAtTime(target, now, 0.05);
}

export function setMusicPlayingMuted(muted: boolean): void {
  masterMuted = muted;
  applyMute();
}

export function getCurrentTrackId(): BackgroundId | null {
  return currentId;
}

export function getTrackDuration(id: BackgroundId): number {
  return loopDuration(TRACKS[id]);
}

export function getTrackSpec(id: BackgroundId): TrackSpec {
  return TRACKS[id];
}

export function getStageTheme(id: BackgroundId): MusicTheme {
  return STAGE_THEMES[id];
}

export function countEventType(spec: TrackSpec, type: MusicEventType): number {
  return buildArrangement(spec).filter((e) => e.type === type).length;
}
