// Enhanced Web Audio API Soundscape & Procedural Ambient Music Engine
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.musicGain = null;
    this.isMuted = false;
    this.isMusicEnabled = true;

    this.windNode = null;
    this.rainNode = null;
    this.campfireNode = null;

    this.isAudioStarted = false;
    this.musicInterval = null;
    this.currentChordIndex = 0;
    this.droneNodes = [];

    this.chords = [
      [172.8, 216.0, 259.2, 324.0], // Fmaj9
      [129.6, 162.0, 194.4, 243.0], // Cmaj7
      [194.4, 216.0, 291.6, 388.8], // Gsus4
      [108.0, 162.0, 216.0, 259.2]  // Am7
    ];

    this.scale = [259.2, 291.6, 324.0, 388.8, 432.0, 518.4, 583.2, 648.0];
  }

  init() {
    if (this.isAudioStarted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.isAudioStarted = true;
    } catch (e) {}
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (!this.masterGain) return;
    this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.7, this.ctx.currentTime, 0.1);
  }

  setMusicEnabled(enabled) {
    this.isMusicEnabled = enabled;
    if (!this.musicGain) return;
    this.musicGain.gain.setTargetAtTime(enabled ? 0.3 : 0.0, this.ctx.currentTime, 0.5);
  }

  startAmbientMusic() {
    if (!this.ctx || this.musicInterval) return;
    this.playNextChord();
    
    this.musicInterval = setInterval(() => {
      if (this.isMusicEnabled && !this.isMuted) {
        this.playNextChord();
      }
    }, 12000);

    const scheduleNextBell = () => {
      const delay = 3200 + Math.random() * 4500;
      setTimeout(() => {
        if (this.isMusicEnabled && !this.isMuted) {
          this.playCelestialNote();
        }
        scheduleNextBell();
      }, delay);
    };
    scheduleNextBell();
  }

  playNextChord() {
    if (!this.ctx || !this.isMusicEnabled) return;
    const now = this.ctx.currentTime;
    const chord = this.chords[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;

    const oldDrones = [...this.droneNodes];
    this.droneNodes = [];
    oldDrones.forEach(d => {
      try {
        d.gain.gain.linearRampToValueAtTime(0.0001, now + 5.0);
        setTimeout(() => { try { d.osc.stop(); } catch(e){} }, 5500);
      } catch (e) {}
    });

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380 + idx * 40, now);

      const targetGain = 0.045 / (idx * 0.3 + 1);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(targetGain, now + 4.0);
      gain.gain.setValueAtTime(targetGain, now + 10.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      this.droneNodes.push({ osc, gain });
    });
  }

  playCelestialNote() {
    if (!this.ctx || !this.isMusicEnabled) return;
    const now = this.ctx.currentTime;
    const freq = this.scale[Math.floor(Math.random() * this.scale.length)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + 4.0);
  }

  startCampfireAudio() {
    if (!this.ctx || this.campfireNode) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.08;

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.16, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      noise.start();
      this.campfireNode = { noise, gain };

      const cracklePop = () => {
        if (!this.isMuted && this.ctx) {
          const now = this.ctx.currentTime;
          const popOsc = this.ctx.createOscillator();
          const popGain = this.ctx.createGain();
          popOsc.type = 'square';
          popOsc.frequency.setValueAtTime(600 + Math.random() * 800, now);
          popGain.gain.setValueAtTime(0.035, now);
          popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
          popOsc.connect(popGain);
          popGain.connect(this.ambientGain);
          popOsc.start(now);
          popOsc.stop(now + 0.05);
        }
        setTimeout(cracklePop, 800 + Math.random() * 2200);
      };
      cracklePop();
    } catch (e) {}
  }

  playSingingBowl(freq = 288) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(2.5, now);
    lfoGain.gain.setValueAtTime(1.8, now);
    lfo.connect(osc1.frequency);
    lfo.start(now);
    lfo.stop(now + 4.5);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.76, now);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.45, now + 0.08);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 5.0);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.16, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 5.2);
    osc2.stop(now + 3.6);
  }

  playWaterDrop() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = 850 + Math.random() * 350;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.45, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  playPetChirp() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.linearRampToValueAtTime(740, now + 0.08);
    osc.frequency.linearRampToValueAtTime(920, now + 0.18);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  // Feeding munch / affectionate purr when long-pressing pet
  playFeedingNibble() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // 3 rhythmic cute nibble crunch clicks
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.14;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450 + (i % 2) * 80, now + delay);
      osc.frequency.exponentialRampToValueAtTime(220, now + delay + 0.06);

      gain.gain.setValueAtTime(0.18, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + delay);
      osc.stop(now + delay + 0.09);
    }

    // Followed by a warm, joyful bell shimmer
    setTimeout(() => {
      this.playPetChirp();
    }, 450);
  }

  playInsightChime() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [349.23, 440.00, 523.25, 659.25, 783.99, 1046.50];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const delay = idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.22 / (idx * 0.2 + 1), now + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 2.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + delay);
      osc.stop(now + delay + 3.0);
    });
  }

  startBreezeLoop() {
    if (!this.ctx || this.windNode) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      whiteNoise.start();
      this.windNode = { whiteNoise, gain };
    } catch (e) {}
  }

  toggleRain(enable) {
    this.ensureContext();
    if (!this.ctx) return;

    if (enable && !this.rainNode) {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.11;

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1100, this.ctx.currentTime);
      bandpass.Q.setValueAtTime(0.7, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 1.2);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.ambientGain);

      noise.start();
      this.rainNode = { noise, gain };
    } else if (!enable && this.rainNode) {
      const node = this.rainNode;
      node.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
      setTimeout(() => {
        try { node.noise.stop(); } catch(e) {}
      }, 900);
      this.rainNode = null;
    }
  }
}

export const sound = new SoundEngine();
