// Web Audio API Synthesizer for Retro Game Sound Effects
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play a retro laser shooting sound (frequency sweep down)
export const playShoot = () => {
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'triangle'; // triangle gives a cool 8-bit laser feel
    osc.frequency.setValueAtTime(880, time); // start high
    osc.frequency.exponentialRampToValueAtTime(150, time + 0.12); // sweep down fast
    
    gainNode.gain.setValueAtTime(0.15, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.12); // fade out
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.12);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
};

// Play an explosion sound (white noise filtered sweep)
export const playExplosion = () => {
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    
    // Create white noise buffer
    const bufferSize = ctx.sampleRate * 0.35; // 0.35 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, time);
    filter.frequency.exponentialRampToValueAtTime(50, time + 0.35); // crush cutoff
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.25, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.35); // fade out
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start(time);
    noiseSource.stop(time + 0.35);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
};

// Play a damage/hit rumble (low saw wave pitch slide)
export const playHit = () => {
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.linearRampToValueAtTime(30, time + 0.25); // slide down into rumble
    
    gainNode.gain.setValueAtTime(0.25, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.25);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
};

// Play a boss incoming siren alert (alternating frequencies)
export const playBossAlert = () => {
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    
    const duration = 1.6; // 1.6s of siren
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, time);
    
    // Create alternating alarm pattern
    for (let i = 0; i < 4; i++) {
      const step = i * 0.4;
      osc.frequency.setValueAtTime(400, time + step);
      osc.frequency.linearRampToValueAtTime(800, time + step + 0.2);
      osc.frequency.setValueAtTime(800, time + step + 0.2);
      osc.frequency.linearRampToValueAtTime(400, time + step + 0.4);
    }
    
    gainNode.gain.setValueAtTime(0.12, time);
    gainNode.gain.setValueAtTime(0.12, time + duration - 0.2);
    gainNode.gain.linearRampToValueAtTime(0.001, time + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + duration);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
};

// Play a tragic game over tune (minor chord arpeggio decay)
export const playGameOver = () => {
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    
    // Play a descending minor progression
    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.linearRampToValueAtTime(freq / 2, startTime + duration); // pitch drop
      
      gainNode.gain.setValueAtTime(0.1, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // A minor arpeggio descending: A3 (220Hz), C3 (130Hz), E2 (82Hz), A1 (55Hz)
    playTone(220, time, 0.4);
    playTone(165, time + 0.3, 0.4);
    playTone(130, time + 0.6, 0.4);
    playTone(110, time + 0.9, 0.8);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
};
