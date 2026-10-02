// Enhanced Web Audio API Soundscape & Procedural Ambient Music Engine for 心靈島 (Mind Island)
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.musicGain = null;
    this.isMuted = false;
    this.isMusicEnabled = true;
    this.isSoundFxEnabled = true;

    this.windNode = null;
    this.rainNode = null;
    this.campfireNode = null;

    this.isAudioStarted = false;
    this.musicInterval = null;
    this.currentChordIndex = 0;
    this.droneNodes = [];

    // Soothing Lydian / Pentatonic Chords (432Hz natural harmonic tuning)
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

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Ambient gain: Set to 0.0 by default - Background ONLY plays music!
      // No campfire square-wave crackles or electronic beeps!
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // Music gain: Boosted so users can comfortably hear the soothing chords without maxing headphone volume
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.isAudioStarted = true;
    } catch (e) {}
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        this.ctx.resume();
      } catch (e) {}
    }
  }

  // Attempt optimistic background audio launch without waiting for touch (works on desktop and enabled PWA containers)
  tryOptimisticAutoStart(musicEnabled = true) {
    try {
      this.ensureContext();
      if (this.ctx && this.ctx.state === 'running') {
        if (musicEnabled && this.isMusicEnabled) {
          this.startAmbientMusic();
        }
      }
    } catch (e) {}
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.85, this.ctx.currentTime, 0.1);
  }

  setMusicEnabled(enabled) {
    this.isMusicEnabled = enabled;
    if (!this.musicGain || !this.ctx) return;
    this.musicGain.gain.setTargetAtTime(enabled ? 0.85 : 0.0, this.ctx.currentTime, 0.4);
    if (enabled && !this.musicInterval) {
      this.startAmbientMusic();
    }
  }

  setSoundFxEnabled(enabled) {
    this.isSoundFxEnabled = enabled;
  }

  startAmbientMusic() {
    if (!this.ctx || this.musicInterval) return;
    // Play first chord immediately with fast 0.5s attack ramp (no waiting 4s in silence!)
    this.playNextChord(true);

    // Play an immediate subtle celestial note within 150ms for instant auditory feedback
    setTimeout(() => {
      if (this.isMusicEnabled && !this.isMuted) {
        this.playCelestialNote();
      }
    }, 150);

    // Cycle chords every 11 seconds
    this.musicInterval = setInterval(() => {
      if (this.isMusicEnabled && !this.isMuted) {
        this.playNextChord(false);
      }
    }, 11000);

    // Floating bell drops
    const scheduleNextBell = () => {
      const delay = 3500 + Math.random() * 4200;
      setTimeout(() => {
        if (this.isMusicEnabled && !this.isMuted) {
          this.playCelestialNote();
        }
        scheduleNextBell();
      }, delay);
    };
    scheduleNextBell();
  }

  playNextChord(isImmediate = false) {
    if (!this.ctx || !this.isMusicEnabled) return;
    const now = this.ctx.currentTime;
    const chord = this.chords[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;

    // Smoothly dissolve previous drone chord
    const oldDrones = [...this.droneNodes];
    this.droneNodes = [];
    oldDrones.forEach(d => {
      try {
        d.gain.gain.linearRampToValueAtTime(0.0001, now + (isImmediate ? 1.0 : 4.5));
        setTimeout(() => { try { d.osc.stop(); } catch(e){} }, isImmediate ? 1200 : 5000);
      } catch (e) {}
    });

    // Spawn new chord oscillators
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420 + idx * 45, now);

      // Harmonious, full-bodied presence
      const targetGain = 0.082 / (idx * 0.22 + 1);
      gain.gain.setValueAtTime(0.0001, now);
      // Fast attack if first launch, otherwise gentle breathing swell
      const attackTime = isImmediate ? 0.5 : 3.0;
      gain.gain.linearRampToValueAtTime(targetGain, now + attackTime);
      gain.gain.setValueAtTime(targetGain, now + 9.5);

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
    gain.gain.linearRampToValueAtTime(0.13, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + 3.8);
  }

  // Pure music background: Campfire audio is silenced to eliminate any background crackle/clicking
  startCampfireAudio() {
    // Disabled by design: Background purely plays peaceful music.
  }

  startBreezeLoop() {
    // Disabled by design: Clean audio background without static noise.
  }

  // --- INTERACTION SOUND EFFECTS (Softened & Balanced with Music) ---

  // Water droplet sound on pond tap or UI confirmations (Softened: gain 0.10)
  playWaterDrop() {
    if (!this.isSoundFxEnabled || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = 820 + Math.random() * 300;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.45, now + 0.12);

    gain.gain.setValueAtTime(0.10, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  // Tibetan singing bowl on tree planting or milestones (Softened: gain1 0.20, gain2 0.07)
  playSingingBowl(freq = 288) {
    if (!this.isSoundFxEnabled || this.isMuted) return;
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
    gain1.gain.linearRampToValueAtTime(0.20, now + 0.08);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 4.8);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.07, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 5.0);
    osc2.stop(now + 3.4);
  }

  // Gentle insight wind chime for harvest or sync success (Balanced: gain 0.12)
  playInsightChime() {
    if (!this.isSoundFxEnabled || this.isMuted) return;
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
      gain.gain.linearRampToValueAtTime(0.12 / (idx * 0.2 + 1), now + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 2.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + delay);
      osc.stop(now + delay + 2.8);
    });
  }

  // --- ANIMAL SPECIES VOICES (SHORT-TAP INTERACTION) ---
  // Purely synthesized Web Audio voices: 100% offline, zero latency, tailored for 5 species
  playPetVoice(species) {
    if (!this.isSoundFxEnabled || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    switch (species) {
      case 'sheep':
        this.playSheepBleat();
        break;
      case 'fox':
        this.playFoxChirp();
        break;
      case 'shiba':
        this.playShibaBark();
        break;
      case 'cat':
        this.playCatMeow();
        break;
      case 'deer':
        this.playDeerWhistle();
        break;
      default:
        this.playPetChirp();
        break;
    }
  }

  // 1. 雲朵綿羊 (sheep): 溫柔綿長的綿羊叫聲 ("咩~~")
  playSheepBleat() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Sheep vocal cord: rich sawtooth with nasal vowel formant
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(245, now);
    osc.frequency.linearRampToValueAtTime(215, now + 0.52);

    // Sheep bleat throat formant filter (Q=2.6 around 700Hz)
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(720, now);
    filter.Q.setValueAtTime(2.6, now);

    // Natural 5.8Hz vibrato LFO for sheep "b-a-a-a-h"
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(5.8, now);
    lfoGain.gain.setValueAtTime(14, now);
    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.06);
    gain.gain.setValueAtTime(0.12, now + 0.36);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.54);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.55);
    osc.stop(now + 0.55);
  }

  // 2. 星光靈狐 (fox): 機敏靈動的雙音叫聲 ("kik-yup!")
  playFoxChirp() {
    const now = this.ctx.currentTime;

    // First quick playful yip
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(940, now);
    osc1.frequency.exponentialRampToValueAtTime(1380, now + 0.08);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.11, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.1);

    // Second cheerful rising-falling gekkering tail
    const t2 = now + 0.11;
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1120, t2);
    osc2.frequency.linearRampToValueAtTime(1620, t2 + 0.07);
    osc2.frequency.exponentialRampToValueAtTime(840, t2 + 0.16);

    gain2.gain.setValueAtTime(0.001, t2);
    gain2.gain.linearRampToValueAtTime(0.13, t2 + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.17);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(t2);
    osc2.stop(t2 + 0.18);
  }

  // 3. 暖陽柴犬 (shiba): 溫暖忠誠的短吠 ("汪!")
  playShibaBark() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Warm puppy woof: triangle wave gliding 540Hz -> 230Hz
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.16);

    // Canine throat resonance
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(460, now);
    filter.Q.setValueAtTime(2.0, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // 4. 玄夜靈貓 (cat): 柔和曼妙的貓咪叫聲 ("喵~")
  playCatMeow() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Vowel glide: 420Hz -> 640Hz -> 380Hz
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.linearRampToValueAtTime(640, now + 0.16);
    osc.frequency.linearRampToValueAtTime(370, now + 0.44);

    // Mouth opening from "m" to "ee" to "ow"
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(1450, now + 0.16);
    filter.frequency.linearRampToValueAtTime(680, now + 0.44);
    filter.Q.setValueAtTime(2.4, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.13, now + 0.08);
    gain.gain.setValueAtTime(0.11, now + 0.28);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.48);
  }

  // 5. 森林小鹿 (deer): 空靈純淨的林間短鳴/微笛聲
  playDeerWhistle() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1160, now);
    osc.frequency.linearRampToValueAtTime(1280, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(1020, now + 0.36);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Fallback gentle chirp
  playPetChirp() {
    if (!this.isSoundFxEnabled || this.isMuted) return;
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
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Shared pet feeding eating motion & chewing munch sound (when long-pressing pet)
  playFeedingNibble() {
    if (!this.isSoundFxEnabled || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // 4 gentle rhythmic munch bites (Softened: gain 0.08)
    for (let i = 0; i < 4; i++) {
      const delay = i * 0.24;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420 + (i % 2) * 50, now + delay);
      osc.frequency.exponentialRampToValueAtTime(200, now + delay + 0.06);

      gain.gain.setValueAtTime(0.08, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + delay);
      osc.stop(now + delay + 0.09);
    }
  }

  // Organic tactile paper rustle & gentle book closing sound for 合上典籍
  playPageTurn() {
    if (!this.isSoundFxEnabled || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Gentle paper friction flutter (filtered noise)
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.22);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.2);
      filter.Q.setValueAtTime(1.8, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.07, now + 0.04);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + 0.22);
    } catch (e) {}

    // 2. Soft acoustic book cover thump
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(120, now + 0.06);
    thudOsc.frequency.exponentialRampToValueAtTime(65, now + 0.20);

    thudGain.gain.setValueAtTime(0.001, now);
    thudGain.gain.setValueAtTime(0.06, now + 0.07);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    thudOsc.connect(thudGain);
    thudGain.connect(this.masterGain);

    thudOsc.start(now + 0.06);
    thudOsc.stop(now + 0.23);
  }

  toggleRain(enable) {
    this.ensureContext();
    if (!this.ctx) return;

    if (enable && !this.rainNode) {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.08;

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1100, this.ctx.currentTime);
      bandpass.Q.setValueAtTime(0.7, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 1.2);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.masterGain);

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
