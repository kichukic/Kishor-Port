let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function resumeContext() {
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();
}

// ─── DYNAMIC SYNTHESIZER ENGINE ──────────────────────────────────────

function playSpaceSynth({
  frequencies = [220],
  type = 'sine',
  duration = 0.5,
  volume = 0.3,
  attack = 0.05,
  decay = 0.3,
  sustain = 0.5,
  release = 0.1,
  filterType = 'lowpass',
  filterStartFreq = 1000,
  filterEndFreq = 300,
  filterQ = 1.0,
  filterAttack = 0.05,
  delayTime = 0,
  delayFeedback = 0.3
}) {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    
    const now = ctx.currentTime;
    
    // Main volume gain node with ADSR envelope
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    
    // Attack
    gainNode.gain.linearRampToValueAtTime(volume, now + attack);
    
    // Decay to sustain
    const sustainVal = volume * sustain;
    gainNode.gain.linearRampToValueAtTime(sustainVal, now + attack + decay);
    
    // Release
    const releaseStart = Math.max(now + attack + decay, now + duration - release);
    gainNode.gain.setValueAtTime(sustainVal, releaseStart);
    gainNode.gain.linearRampToValueAtTime(0.0001, now + duration);

    // Filter with envelope
    const filterNode = ctx.createBiquadFilter();
    filterNode.type = filterType;
    filterNode.Q.setValueAtTime(filterQ, now);
    filterNode.frequency.setValueAtTime(filterStartFreq, now);
    filterNode.frequency.exponentialRampToValueAtTime(filterEndFreq, now + Math.min(duration, filterAttack));

    // Connect components
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Delay effect (Cinematic space echo)
    let delayNode = null;
    let feedbackGain = null;
    if (delayTime > 0) {
      delayNode = ctx.createDelay();
      delayNode.delayTime.setValueAtTime(delayTime, now);
      feedbackGain = ctx.createGain();
      feedbackGain.gain.setValueAtTime(delayFeedback, now);

      filterNode.connect(delayNode);
      delayNode.connect(feedbackGain);
      feedbackGain.connect(delayNode); // feedback loop
      feedbackGain.connect(gainNode); // connect to main output gain
    }

    // Create oscillators
    const oscs = frequencies.map(freq => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(filterNode);
      osc.start(now);
      osc.stop(now + duration);
      return osc;
    });

    // Cleanup
    setTimeout(() => {
      try {
        oscs.forEach(o => {
          o.stop();
          o.disconnect();
        });
        if (delayNode) {
          delayNode.disconnect();
          feedbackGain.disconnect();
        }
        filterNode.disconnect();
        gainNode.disconnect();
      } catch (e) {}
    }, (duration + delayTime * 5) * 1000 + 200);
  } catch (e) {
    // Fail silently
  }
}

function playSpaceWind({
  duration = 1.0,
  volume = 0.1,
  attack = 0.3,
  release = 0.5,
  filterStartFreq = 800,
  filterEndFreq = 200,
  filterQ = 2.0
}) {
  try {
    const ctx = getCtx();
    if (!ctx || ctx.state === 'suspended') return;
    
    const now = ctx.currentTime;
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attack);
    gainNode.gain.setValueAtTime(volume, now + duration - release);
    gainNode.gain.linearRampToValueAtTime(0.0001, now + duration);
    
    const filterNode = ctx.createBiquadFilter();
    filterNode.type = 'bandpass';
    filterNode.Q.setValueAtTime(filterQ, now);
    filterNode.frequency.setValueAtTime(filterStartFreq, now);
    filterNode.frequency.exponentialRampToValueAtTime(filterEndFreq, now + duration);
    
    noiseSource.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start(now);
    noiseSource.stop(now + duration);
    
    setTimeout(() => {
      try {
        noiseSource.stop();
        noiseSource.disconnect();
        filterNode.disconnect();
        gainNode.disconnect();
      } catch (e) {}
    }, duration * 1000 + 200);
  } catch (e) {
    // Fail silently
  }
}

// ─── SOUND DEFINITIONS ───────────────────────────────────────────────

const sounds = {
  // ── UI Interaction ──
  click: (vol) => playSpaceSynth({
    frequencies: [130.81, 261.63, 392.00],
    type: 'sine',
    duration: 0.12,
    volume: vol * 0.45,
    attack: 0.005,
    decay: 0.06,
    sustain: 0.1,
    release: 0.05,
    filterType: 'lowpass',
    filterStartFreq: 450,
    filterEndFreq: 180,
    filterQ: 0.6
  }),

  hover: (vol) => playSpaceSynth({
    frequencies: [220],
    type: 'sine',
    duration: 0.25,
    volume: vol * 0.35,
    attack: 0.05,
    decay: 0.15,
    sustain: 0.2,
    release: 0.05,
    filterType: 'lowpass',
    filterStartFreq: 300,
    filterEndFreq: 150,
    filterQ: 0.5
  }),

  hoverDeep: (vol) => playSpaceSynth({
    frequencies: [164.81, 220.00, 329.63],
    type: 'triangle',
    duration: 0.4,
    volume: vol * 0.3,
    attack: 0.08,
    decay: 0.2,
    sustain: 0.4,
    release: 0.1,
    filterType: 'lowpass',
    filterStartFreq: 350,
    filterEndFreq: 150,
    filterQ: 1.0
  }),

  toggle: (vol) => playSpaceSynth({
    frequencies: [150, 225],
    type: 'sine',
    duration: 0.3,
    volume: vol * 0.4,
    attack: 0.03,
    decay: 0.15,
    sustain: 0.3,
    release: 0.08,
    filterType: 'lowpass',
    filterStartFreq: 300,
    filterEndFreq: 450,
    filterQ: 1.0
  }),

  toggleClose: (vol) => playSpaceSynth({
    frequencies: [225, 150],
    type: 'sine',
    duration: 0.3,
    volume: vol * 0.4,
    attack: 0.03,
    decay: 0.15,
    sustain: 0.3,
    release: 0.08,
    filterType: 'lowpass',
    filterStartFreq: 450,
    filterEndFreq: 300,
    filterQ: 1.0
  }),

  copy: (vol) => playSpaceSynth({
    frequencies: [523.25, 659.25, 783.99],
    type: 'sine',
    duration: 0.45,
    volume: vol * 0.25,
    attack: 0.05,
    decay: 0.15,
    sustain: 0.3,
    release: 0.15,
    filterType: 'lowpass',
    filterStartFreq: 800,
    filterEndFreq: 400,
    filterQ: 0.8,
    delayTime: 0.15,
    delayFeedback: 0.25
  }),

  scrollTop: (vol) => playSpaceSynth({
    frequencies: [110, 220, 330],
    type: 'sine',
    duration: 0.8,
    volume: vol * 0.25,
    attack: 0.2,
    decay: 0.4,
    sustain: 0.5,
    release: 0.2,
    filterType: 'lowpass',
    filterStartFreq: 150,
    filterEndFreq: 800,
    filterQ: 1.0,
    delayTime: 0.2,
    delayFeedback: 0.3
  }),

  // ── Text Effects ──
  scramble: (vol) => playSpaceWind({
    duration: 0.2,
    volume: vol * 0.12,
    attack: 0.02,
    release: 0.1,
    filterStartFreq: 300,
    filterEndFreq: 100,
    filterQ: 1.5
  }),

  // ── Section Transitions ──
  sectionEnter: (vol) => playSpaceSynth({
    frequencies: [55, 110, 165],
    type: 'triangle',
    duration: 1.5,
    volume: vol * 0.35,
    attack: 0.15,
    decay: 0.6,
    sustain: 0.4,
    release: 0.5,
    filterType: 'lowpass',
    filterStartFreq: 220,
    filterEndFreq: 85,
    filterQ: 1.5,
    delayTime: 0.25,
    delayFeedback: 0.35
  }),

  cardReveal: (vol) => playSpaceSynth({
    frequencies: [196.00, 246.94, 293.66, 369.99],
    type: 'sine',
    duration: 0.85,
    volume: vol * 0.3,
    attack: 0.12,
    decay: 0.35,
    sustain: 0.5,
    release: 0.25,
    filterType: 'lowpass',
    filterStartFreq: 400,
    filterEndFreq: 250,
    filterQ: 1.2,
    delayTime: 0.2,
    delayFeedback: 0.3
  }),

  // ── Skills ──
  progressFill: (vol) => playSpaceSynth({
    frequencies: [130.81, 196.00],
    type: 'sine',
    duration: 0.6,
    volume: vol * 0.2,
    attack: 0.08,
    decay: 0.3,
    sustain: 0.6,
    release: 0.15,
    filterType: 'lowpass',
    filterStartFreq: 150,
    filterEndFreq: 300,
    filterQ: 0.8
  }),

  skillNodePing: (vol) => playSpaceSynth({
    frequencies: [880.00, 1318.51],
    type: 'sine',
    duration: 0.9,
    volume: vol * 0.2,
    attack: 0.01,
    decay: 0.3,
    sustain: 0.2,
    release: 0.4,
    filterType: 'lowpass',
    filterStartFreq: 1200,
    filterEndFreq: 600,
    filterQ: 2.0,
    delayTime: 0.18,
    delayFeedback: 0.4
  }),

  skillNodeClick: (vol) => playSpaceSynth({
    frequencies: [220, 440],
    type: 'triangle',
    duration: 0.45,
    volume: vol * 0.3,
    attack: 0.005,
    decay: 0.15,
    sustain: 0.3,
    release: 0.2,
    filterType: 'lowpass',
    filterStartFreq: 500,
    filterEndFreq: 200,
    filterQ: 1.2,
    delayTime: 0.12,
    delayFeedback: 0.25
  }),

  nodeFly: (vol) => playSpaceWind({
    duration: 0.55,
    volume: vol * 0.15,
    attack: 0.1,
    release: 0.25,
    filterStartFreq: 600,
    filterEndFreq: 200,
    filterQ: 2.5
  }),

  nodeArrive: (vol) => playSpaceSynth({
    frequencies: [220.00, 277.18, 329.63],
    type: 'sine',
    duration: 1.0,
    volume: vol * 0.25,
    attack: 0.08,
    decay: 0.3,
    sustain: 0.5,
    release: 0.4,
    filterType: 'lowpass',
    filterStartFreq: 350,
    filterEndFreq: 200,
    filterQ: 1.0,
    delayTime: 0.22,
    delayFeedback: 0.3
  }),

  // ── Experience ──
  timelinePulse: (vol) => {
    // Cinematic double heartbeat: "lub-dub" - optimized for laptop speakers
    const lubTime = 0.12;
    playSpaceSynth({
      frequencies: [80, 160],
      type: 'sine',
      duration: 0.3,
      volume: vol * 0.45,
      attack: 0.01,
      decay: 0.1,
      sustain: 0.1,
      release: 0.08,
      filterType: 'lowpass',
      filterStartFreq: 180,
      filterEndFreq: 70,
      filterQ: 1.0
    });
    setTimeout(() => {
      playSpaceSynth({
        frequencies: [80, 155],
        type: 'sine',
        duration: 0.3,
        volume: vol * 0.35,
        attack: 0.01,
        decay: 0.1,
        sustain: 0.1,
        release: 0.08,
        filterType: 'lowpass',
        filterStartFreq: 160,
        filterEndFreq: 70,
        filterQ: 1.0
      });
    }, lubTime * 1000);
  },

  databaseSync: (vol) => playSpaceSynth({
    frequencies: [150, 300],
    type: 'sine',
    duration: 0.15,
    volume: vol * 0.25,
    attack: 0.005,
    decay: 0.08,
    sustain: 0.1,
    release: 0.05,
    filterType: 'lowpass',
    filterStartFreq: 250,
    filterEndFreq: 150,
    filterQ: 0.5
  }),

  // ── Terminal ──
  terminalType: (vol) => playSpaceSynth({
    frequencies: [120, 160],
    type: 'sine',
    duration: 0.04,
    volume: vol * 0.2,
    attack: 0.001,
    decay: 0.01,
    sustain: 0.1,
    release: 0.01,
    filterType: 'lowpass',
    filterStartFreq: 200,
    filterEndFreq: 100,
    filterQ: 0.3
  }),

  terminalDone: (vol) => playSpaceSynth({
    frequencies: [261.63, 329.63, 392.00, 523.25],
    type: 'sine',
    duration: 1.2,
    volume: vol * 0.35,
    attack: 0.1,
    decay: 0.4,
    sustain: 0.5,
    release: 0.5,
    filterType: 'lowpass',
    filterStartFreq: 600,
    filterEndFreq: 300,
    filterQ: 1.2,
    delayTime: 0.2,
    delayFeedback: 0.3
  }),

  // ── Boot Sequence ──
  bootPhase: (vol) => playSpaceSynth({
    frequencies: [130.81, 261.63, 392.00],
    type: 'triangle',
    duration: 1.2,
    volume: vol * 0.35,
    attack: 0.15,
    decay: 0.4,
    sustain: 0.5,
    release: 0.3,
    filterType: 'lowpass',
    filterStartFreq: 400,
    filterEndFreq: 150,
    filterQ: 1.0
  }),

  bootComplete: (vol) => playSpaceSynth({
    frequencies: [65.41, 130.81, 196.00, 261.63, 329.63, 392.00],
    type: 'triangle',
    duration: 3.6,
    volume: vol * 0.45,
    attack: 0.8,
    decay: 1.0,
    sustain: 0.6,
    release: 1.2,
    filterType: 'lowpass',
    filterStartFreq: 180,
    filterEndFreq: 800,
    filterQ: 2.0,
    delayTime: 0.28,
    delayFeedback: 0.4
  }),

  // ── Easter Egg ──
  achievement: (vol) => {
    const notes = [261.63, 329.63, 392.00, 493.88, 587.33]; // Cmaj9: C4, E4, G4, B4, D5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playSpaceSynth({
          frequencies: [freq],
          type: 'sine',
          duration: 1.2,
          volume: vol * 0.25,
          attack: 0.08,
          decay: 0.3,
          sustain: 0.4,
          release: 0.5,
          filterType: 'lowpass',
          filterStartFreq: 500,
          filterEndFreq: 250,
          filterQ: 1.0,
          delayTime: 0.2,
          delayFeedback: 0.35
        });
      }, idx * 120);
    });
  },

  konamiKey: (vol) => playSpaceSynth({
    frequencies: [440, 554.37, 659.25],
    type: 'sine',
    duration: 0.55,
    volume: vol * 0.25,
    attack: 0.03,
    decay: 0.15,
    sustain: 0.4,
    release: 0.2,
    filterType: 'lowpass',
    filterStartFreq: 800,
    filterEndFreq: 300,
    filterQ: 1.0
  }),

  konamiFail: (vol) => playSpaceSynth({
    frequencies: [110.00, 130.81, 155.56],
    type: 'triangle',
    duration: 1.6,
    volume: vol * 0.35,
    attack: 0.15,
    decay: 0.5,
    sustain: 0.3,
    release: 0.6,
    filterType: 'lowpass',
    filterStartFreq: 220,
    filterEndFreq: 80,
    filterQ: 1.2,
    delayTime: 0.22,
    delayFeedback: 0.3
  }),

  // ── Contact ──
  contactSend: (vol) => {
    playSpaceWind({
      duration: 2.2,
      volume: vol * 0.25,
      attack: 0.4,
      release: 0.8,
      filterStartFreq: 1200,
      filterEndFreq: 150,
      filterQ: 1.5
    });
    playSpaceSynth({
      frequencies: [65.41, 98.00],
      type: 'triangle',
      duration: 2.2,
      volume: vol * 0.3,
      attack: 0.3,
      decay: 0.8,
      sustain: 0.4,
      release: 0.8,
      filterType: 'lowpass',
      filterStartFreq: 180,
      filterEndFreq: 60,
      filterQ: 1.0,
      delayTime: 0.25,
      delayFeedback: 0.3
    });
  },

  socialHover: (vol) => playSpaceSynth({
    frequencies: [987.77, 1318.51],
    type: 'sine',
    duration: 0.35,
    volume: vol * 0.15,
    attack: 0.02,
    decay: 0.1,
    sustain: 0.2,
    release: 0.15,
    filterType: 'lowpass',
    filterStartFreq: 1500,
    filterEndFreq: 800,
    filterQ: 1.2
  }),

  // ── Ambient ──
  portalHum: (vol) => playSpaceSynth({
    frequencies: [73.42, 110.00],
    type: 'triangle',
    duration: 2.0,
    volume: vol * 0.25,
    attack: 0.3,
    decay: 0.8,
    sustain: 0.6,
    release: 0.6,
    filterType: 'lowpass',
    filterStartFreq: 120,
    filterEndFreq: 70,
    filterQ: 1.5
  }),

  // ── Parallax ──
  parallaxSwoosh: (vol) => playSpaceWind({
    duration: 0.65,
    volume: vol * 0.12,
    attack: 0.15,
    release: 0.3,
    filterStartFreq: 800,
    filterEndFreq: 180,
    filterQ: 1.8
  }),
};

// ─── AMBIENT SPACE DRONE SYSTEM ──────────────────────────────────────

let droneOscillators = [];
let droneFilter = null;
let droneGain = null;
let lfoNode = null;
let lfoGain = null;

export function startAmbientDrone() {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (droneGain) return; // already active
    
    const now = ctx.currentTime;
    
    // Master gain node with smooth fade-in
    droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0, now);
    droneGain.gain.linearRampToValueAtTime(0.08, now + 3.0); // 3 seconds fade-in
    
    // Warm lowpass filter - shifted up slightly so laptop speakers can reproduce it
    droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.Q.setValueAtTime(1.5, now);
    droneFilter.frequency.setValueAtTime(280, now);
    
    // Slow breathing filter LFO (8-second cycle)
    lfoNode = ctx.createOscillator();
    lfoNode.type = 'sine';
    lfoNode.frequency.setValueAtTime(0.08, now);
    
    lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(60, now); // modulates filter frequency +/- 60Hz (220Hz to 340Hz)
    
    lfoNode.connect(lfoGain);
    lfoGain.connect(droneFilter.frequency);
    lfoNode.start(now);
    
    // Shifted drone frequencies to include C3, G3, C4, E4, G4 (audible on laptop speakers)
    const freqs = [130.81, 196.00, 261.63, 329.63, 392.00];
    
    droneOscillators = freqs.map((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle'; // Warm organ-like tone
      osc.frequency.setValueAtTime(freq, now);
      
      const voiceGain = ctx.createGain();
      const baseVol = 0.14 / (idx + 1);
      voiceGain.gain.setValueAtTime(baseVol, now);
      
      // Weave volume of each voice slowly in and out
      const volLfo = ctx.createOscillator();
      volLfo.type = 'sine';
      volLfo.frequency.setValueAtTime(0.04 + idx * 0.015, now);
      
      const volLfoGain = ctx.createGain();
      volLfoGain.gain.setValueAtTime(baseVol * 0.4, now);
      
      volLfo.connect(volLfoGain);
      volLfoGain.connect(voiceGain.gain);
      volLfo.start(now);
      
      osc.connect(voiceGain);
      voiceGain.connect(droneFilter);
      
      osc.start(now);
      
      return { osc, voiceGain, volLfo, volLfoGain };
    });
    
    droneFilter.connect(droneGain);
    droneGain.connect(ctx.destination);
  } catch (e) {
    // Fail silently
  }
}

export function stopAmbientDrone() {
  if (!droneGain) return;
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    
    const currentGain = droneGain;
    currentGain.gain.setValueAtTime(currentGain.gain.value, now);
    currentGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5); // Smooth 1.5s fade out
    
    const oscs = droneOscillators;
    const lfo = lfoNode;
    const lfoG = lfoGain;
    
    droneOscillators = [];
    droneFilter = null;
    droneGain = null;
    lfoNode = null;
    lfoGain = null;
    
    setTimeout(() => {
      try {
        oscs.forEach(o => {
          o.osc.stop();
          o.osc.disconnect();
          o.voiceGain.disconnect();
          o.volLfo.stop();
          o.volLfo.disconnect();
          o.volLfoGain.disconnect();
        });
        lfo.stop();
        lfo.disconnect();
        lfoG.disconnect();
        currentGain.disconnect();
      } catch (e) {}
    }, 1600);
  } catch (e) {
    // Fail silently
  }
}

export function updateAmbientDroneSection(sectionId) {
  if (!droneFilter) return;
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    
    let targetFreq = 280;
    let targetQ = 1.5;
    
    switch(sectionId) {
      case 'hero':
        targetFreq = 280; // Warm breathing space hum
        targetQ = 1.5;
        break;
      case 'projects':
        targetFreq = 350; // Brighter resonance
        targetQ = 2.0;
        break;
      case 'experience':
        targetFreq = 310; // Warm nostalgic organ vibe
        targetQ = 1.7;
        break;
      case 'skills':
        targetFreq = 400; // Bright cosmic space pad
        targetQ = 2.2;
        break;
      case 'about':
        targetFreq = 260; // Warm, ultra-smooth pad
        targetQ = 1.2;
        break;
      case 'contact':
        targetFreq = 220; // Deep space pad fadeout
        targetQ = 1.0;
        break;
      default:
        targetFreq = 280;
    }
    
    droneFilter.frequency.exponentialRampToValueAtTime(targetFreq, now + 2.0);
    droneFilter.Q.exponentialRampToValueAtTime(targetQ, now + 2.0);
  } catch (e) {
    // Fail silently
  }
}

// ─── PUBLIC API ──────────────────────────────────────────────────────

export function playSound(name, volume = 0.3) {
  try {
    const fn = sounds[name];
    if (fn) fn(volume);
  } catch (e) {
    // Fail silently
  }
}

export function preloadSounds() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.001);
  } catch (e) {}
}
