// Automated Node.js Zero-Token Test for 心靈島 (Mind Island) 6 UX & Audio Fixes
import fs from 'fs';

let passCount = 0;
let failCount = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`[PASS] ${msg}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${msg}`);
    failCount++;
  }
}

console.log('=== 心靈島 (Mind Island) - 6 UX & Audio Fixes Verification ===\n');

// 1. Rebranding
const html = fs.readFileSync('index.html', 'utf-8');
const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf-8'));
const readme = fs.readFileSync('README.md', 'utf-8');

assert(html.includes('<title>心靈島 · 課題之森</title>'), 'index.html has title "心靈島 · 課題之森"');
assert(html.includes('<meta name="apple-mobile-web-app-title" content="心靈島">'), 'index.html has apple-mobile-web-app-title "心靈島"');
assert(manifest.short_name === '心靈島', 'manifest.json has short_name "心靈島"');
assert(manifest.name === '心靈島 - 課題之森', 'manifest.json has name "心靈島 - 課題之森"');
assert(readme.startsWith('# 心靈島 (Mind Island · 課題之森)'), 'README.md begins with "# 心靈島 (Mind Island · 課題之森)"');

// 2. Issue 1: Bottom red band leak prevention
const sceneCode = fs.readFileSync('src/scene3d.js', 'utf-8');
const css = fs.readFileSync('styles.css', 'utf-8');

assert(sceneCode.includes("document.body.style.backgroundColor = '#0e1419';"), 'scene3d.js locks body background to deep dark #0e1419');
assert(!sceneCode.includes("document.body.style.backgroundColor = skyHex;"), 'scene3d.js no longer assigns sunset #281924 to body');
assert(css.includes('height: 100dvh;'), 'styles.css uses height: 100dvh for mobile dynamic viewport');
assert(css.includes('min-height: -webkit-fill-available;'), 'styles.css supports iOS -webkit-fill-available');
assert(css.includes('inset: 0;'), 'styles.css uses inset: 0 for fixed overlays');

// 3. Issue 2 & 3: Background music boost, no electronic square wave clicks, balanced SFX
const audioCode = fs.readFileSync('src/audio.js', 'utf-8');

assert(audioCode.includes('this.musicGain.gain.setValueAtTime(0.85'), 'audio.js boosts musicGain to 0.85 for headphone clarity');
assert(audioCode.includes('this.ambientGain.gain.setValueAtTime(0.0'), 'audio.js silences ambientGain by default so background purely plays music');
assert(!audioCode.includes("popOsc.type = 'square'"), 'audio.js eliminated square-wave cracklePop electronic beeping');
assert(audioCode.includes('this.playNextChord(true);'), 'audio.js launches first chord immediately');
assert(audioCode.includes('isImmediate ? 0.5 : 3.0'), 'audio.js fast attacks first chord in 0.5s');

// 4. Issue 4: Pet interaction decoupling (Short tap vs Long press)
assert(sceneCode.includes('petHoldThresholdTimer'), 'scene3d.js implements petHoldThresholdTimer for threshold separation');
assert(sceneCode.includes('PET_HOLD_THRESHOLD = 260'), 'scene3d.js uses 260ms threshold to decouple tap from hold');
assert(!sceneCode.includes("hitObj.userData.feedDish.visible = true;\n\n          if (this.onPetHoldStart) this.onPetHoldStart(petData);"), 'scene3d.js does not immediately show dish on pointerdown');
assert(sceneCode.includes("petObj.userData.aiState.state = 'looking_up';"), 'scene3d.js plays looking_up curiosity animation on short tap');
assert(audioCode.includes('playPetVoice(species)'), 'audio.js implements playPetVoice for species-specific vocalization');
assert(audioCode.includes('playSheepBleat()'), 'audio.js implements sheep bleat ("咩~")');
assert(audioCode.includes('playFoxChirp()'), 'audio.js implements fox chirp ("kik-yup!")');
assert(audioCode.includes('playShibaBark()'), 'audio.js implements shiba bark ("汪!")');
assert(audioCode.includes('playCatMeow()'), 'audio.js implements cat meow ("喵~")');
assert(audioCode.includes('playDeerWhistle()'), 'audio.js implements deer whistle');

const appCode = fs.readFileSync('src/app.js', 'utf-8');
assert(appCode.includes('sound.playPetVoice(petData.species)'), 'app.js calls sound.playPetVoice(petData.species) on short tap');

// 5. Issue 5: iOS callout / text selection suppression
assert(css.includes('-webkit-touch-callout: none !important;'), 'styles.css disables iOS touch callout menu');
assert(css.includes('-webkit-user-select: none !important;'), 'styles.css disables text selection');
assert(sceneCode.includes("el.addEventListener('contextmenu'"), 'scene3d.js suppresses contextmenu on 3D canvas');
assert(appCode.includes("window.addEventListener('contextmenu'"), 'app.js suppresses contextmenu across document except inputs');

// 6. Issue 6 & Question 7: Optimistic audio auto launch & 0ms latency unlock
assert(audioCode.includes('tryOptimisticAutoStart(musicEnabled = true)'), 'audio.js implements tryOptimisticAutoStart');
assert(appCode.includes('sound.tryOptimisticAutoStart(this.settings.musicEnabled);'), 'app.js calls tryOptimisticAutoStart on page init');
assert(appCode.includes("window.addEventListener('pointerdown', unlockAudio, { capture: true });"), 'app.js unlocks audio in capture phase on first touch');

console.log(`\nVerification Complete: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) process.exit(1);
