import { BackgroundId } from '../types/game';
import { getAudioContext } from './audio';
import { isMusicMuted } from '../utils/audioSettings';

interface TrackSpec {
  bpm: number;
  bars: number;
  root: number;
  scale: number[];
  bassWave: OscillatorType;
  leadWave: OscillatorType;
  filterHz: number;
  swing: number;
  drums: boolean;
  pad: boolean;
  tension: number;
}

const TRACKS: Record<BackgroundId, TrackSpec> = {
  stadium: { bpm: 100, bars: 4, root: 55, scale: [0, 3, 5, 7, 10], bassWave: 'square', leadWave: 'sawtooth', filterHz: 1400, swing: 0.08, drums: true, pad: true, tension: 0.7 },
  park: { bpm: 108, bars: 4, root: 60, scale: [0, 2, 4, 7, 9], bassWave: 'triangle', leadWave: 'sine', filterHz: 1800, swing: 0.04, drums: true, pad: false, tension: 0.45 },
  farm: { bpm: 86, bars: 4, root: 57, scale: [0, 2, 4, 7, 11], bassWave: 'triangle', leadWave: 'triangle', filterHz: 1200, swing: 0.12, drums: false, pad: true, tension: 0.35 },
  desert: { bpm: 76, bars: 4, root: 58, scale: [0, 2, 3, 7, 9], bassWave: 'sine', leadWave: 'sine', filterHz: 900, swing: 0, drums: false, pad: true, tension: 0.55 },
  pirate: { bpm: 102, bars: 4, root: 50, scale: [0, 3, 5, 7, 10], bassWave: 'square', leadWave: 'triangle', filterHz: 1100, swing: 0.1, drums: true, pad: false, tension: 0.65 },
  amazon: { bpm: 114, bars: 4, root: 53, scale: [0, 2, 5, 7, 10], bassWave: 'triangle', leadWave: 'sawtooth', filterHz: 1600, swing: 0.06, drums: true, pad: true, tension: 0.6 },
  rooftop: { bpm: 94, bars: 4, root: 48, scale: [0, 3, 5, 7, 10], bassWave: 'square', leadWave: 'sawtooth', filterHz: 1300, swing: 0.14, drums: true, pad: true, tension: 0.75 },
  space: { bpm: 68, bars: 4, root: 46, scale: [0, 2, 4, 7, 11], bassWave: 'sine', leadWave: 'sine', filterHz: 700, swing: 0, drums: false, pad: true, tension: 0.85 },
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
  const beats = spec.bars * 4;
  const seconds = (beats * 60) / spec.bpm;
  return Math.min(25, seconds);
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
  osc.frequency.setValueAtTime(freq, time);
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), time + Math.min(0.03, dur * 0.2));
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(g).connect(dest);
  osc.start(time);
  osc.stop(time + dur + 0.02);
}

function addNoiseHit(ctx: BaseAudioContext, dest: AudioNode, time: number, dur: number, freq: number, gain: number): void {
  const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
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

  const beat = 60 / spec.bpm;
  const steps = spec.bars * 16;
  const duration = loopDuration(spec);

  for (let i = 0; i < steps; i++) {
    const swing = i % 2 === 1 ? spec.swing * beat : 0;
    const t = Math.min(duration - 0.05, (i / 4) * beat + swing);
    const stepInBar = i % 16;
    const degree = spec.scale[i % spec.scale.length];
    const octave = i % 32 < 16 ? 0 : 12;

    if (spec.drums) {
      if (stepInBar === 0 || stepInBar === 8) {
        scheduleTone(ctx, master, t, 0.18, 70 + spec.tension * 20, 'sine', 0.55);
      }
      if (stepInBar === 4 || stepInBar === 12) {
        addNoiseHit(ctx, master, t, 0.08, 1800, 0.12);
      }
      if (stepInBar % 2 === 0) {
        addNoiseHit(ctx, master, t, 0.03, 6000, 0.05);
      }
    }

    if (stepInBar === 0 || stepInBar === 8) {
      const bass = midiToFreq(spec.root + spec.scale[0] - 12);
      scheduleTone(ctx, master, t, beat * 1.6, bass, spec.bassWave, 0.28);
    } else if (stepInBar === 4 || stepInBar === 12) {
      const bass2 = midiToFreq(spec.root + spec.scale[2 % spec.scale.length] - 12);
      scheduleTone(ctx, master, t, beat * 1.1, bass2, spec.bassWave, 0.2);
    }

    if (i % 2 === 0) {
      const lead = midiToFreq(spec.root + degree + octave);
      scheduleTone(ctx, master, t, beat * 0.45, lead, spec.leadWave, 0.09 + spec.tension * 0.06);
    }
  }

  if (spec.pad) {
    const padFreq = midiToFreq(spec.root + spec.scale[2] + 12);
    scheduleTone(ctx, master, 0.01, duration - 0.05, padFreq, 'sine', 0.07 + spec.tension * 0.04);
    scheduleTone(ctx, master, 0.01, duration - 0.05, midiToFreq(spec.root), 'triangle', 0.05);
  }
}

async function getBuffer(id: BackgroundId): Promise<AudioBuffer | null> {
  const cached = bufferCache.get(id);
  if (cached) return cached;
  const live = getAudioContext();
  if (!live) return null;
  const spec = TRACKS[id];
  const duration = loopDuration(spec);
  const Offline = window.OfflineAudioContext || (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
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
    } catch {}
    try {
      sourceNode.disconnect();
    } catch {}
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
