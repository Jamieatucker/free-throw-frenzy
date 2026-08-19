type SoundName = 'shoot' | 'score' | 'miss' | 'bounce';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType, gain: number, ramp = true) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  if (ramp) g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(g).connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, gain: number) {
  const ctx = getCtx();
  if (!ctx) return;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  src.connect(filter).connect(g).connect(ctx.destination);
  src.start();
}

export function playSound(name: SoundName): void {
  switch (name) {
    case 'shoot':
      playNoise(0.15, 0.25);
      playTone(220, 0.12, 'triangle', 0.15);
      break;
    case 'score':
      playTone(523, 0.1, 'sine', 0.3);
      setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 80);
      setTimeout(() => playTone(784, 0.15, 'sine', 0.25), 160);
      break;
    case 'miss':
      playTone(200, 0.3, 'sawtooth', 0.15);
      break;
    case 'bounce':
      playTone(300, 0.08, 'square', 0.1);
      break;
  }
}
