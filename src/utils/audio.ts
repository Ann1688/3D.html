// Procedural Web Audio API sound effects for wooden stamp and UI

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Procedural Wooden Mallet / Seal Impact Sound:
 * Realistic dual-component sound with:
 * 1. Resonant low-frequency wooden block thump (pitch decay)
 * 2. High-frequency crisp friction / ink-press impact snap
 * 3. Subtle hollow chamber resonance
 */
export function playWoodStampSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Component 1: Heavy wooden mass thud (low-mid sine sweep)
    const osc1 = ctx.createOscillator();
    const oscGain1 = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    oscGain1.gain.setValueAtTime(0.85, now);
    oscGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(oscGain1);
    oscGain1.connect(ctx.destination);

    // Component 2: Hollow wooden body resonance (bandpass filtered noise burst)
    const bufferSize = ctx.sampleRate * 0.1;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(4, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // Component 3: Secondary subtle mechanical table rebound
    const reboundOsc = ctx.createOscillator();
    const reboundGain = ctx.createGain();
    reboundOsc.type = 'sine';
    reboundOsc.frequency.setValueAtTime(95, now + 0.04);
    reboundOsc.frequency.exponentialRampToValueAtTime(30, now + 0.18);
    reboundGain.gain.setValueAtTime(0.001, now);
    reboundGain.gain.setValueAtTime(0.35, now + 0.04);
    reboundGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    reboundOsc.connect(reboundGain);
    reboundGain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.3);
    whiteNoise.start(now);
    whiteNoise.stop(now + 0.1);
    reboundOsc.start(now + 0.04);
    reboundOsc.stop(now + 0.25);
  } catch (err) {
    console.warn('Web Audio playback error:', err);
  }
}

/**
 * Stamp Reset Sound: light paper brush / click
 */
export function playStampResetSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch {
    // Ignore audio errors
  }
}

/**
 * Celebratory fanfare / harmonic chime when milestone reached
 */
export function playMilestoneChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    });
  } catch {
    // Ignore audio errors
  }
}
