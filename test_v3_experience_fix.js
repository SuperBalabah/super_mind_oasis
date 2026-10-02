// Automated Node.js Zero-Token Test for 心靈島 (Mind Island) Full Experience Refactor
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

console.log('=== 心靈島 (Mind Island) - Full Experience Verification ===\n');

// 1. Rebranding
const html = fs.readFileSync('index.html', 'utf-8');
const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf-8'));
const readme = fs.readFileSync('README.md', 'utf-8');

assert(html.includes('<title>心靈島 · 課題之森</title>'), 'index.html has title "心靈島 · 課題之森"');
assert(html.includes('<meta name="apple-mobile-web-app-title" content="心靈島">'), 'index.html has apple-mobile-web-app-title "心靈島"');
assert(manifest.short_name === '心靈島', 'manifest.json has short_name "心靈島"');
assert(manifest.name === '心靈島 - 課題之森', 'manifest.json has name "心靈島 - 課題之森"');
assert(readme.startsWith('# 心靈島 (Mind Island · 課題之森)'), 'README.md begins with "# 心靈島 (Mind Island · 課題之森)"');

// 2. Full-screen Viewport & Uniform Modal Overlay (No 100dvh cutoff, No bottom black band)
const sceneCode = fs.readFileSync('src/scene3d.js', 'utf-8');
const css = fs.readFileSync('styles.css', 'utf-8');

assert(css.includes('#app {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  width: 100vw;\n  height: 100%;'), '#app uses seamless 100% full-screen fixed positioning');
assert(!css.includes('#app {\n  position: fixed;\n  inset: 0;\n  width: 100vw;\n  height: 100vh;\n  height: 100dvh;'), '#app no longer uses height: 100dvh cutoff');
assert(css.includes('.modal-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  width: 100vw;\n  height: 100%;'), '.modal-overlay covers 100% full-screen seamlessly');
assert(sceneCode.includes('document.body.style.backgroundColor = skyHex;'), 'scene3d.js syncs body background with skyHex for full-screen edge-to-edge color');

// 3. Audio & SFX Decoupling (Sound FX does not kill background music)
const audioCode = fs.readFileSync('src/audio.js', 'utf-8');
const appCode = fs.readFileSync('src/app.js', 'utf-8');

assert(audioCode.includes('this.isSoundFxEnabled = true;'), 'audio.js has isSoundFxEnabled state');
assert(audioCode.includes('setSoundFxEnabled(enabled)'), 'audio.js implements setSoundFxEnabled method');
assert(appCode.includes('sound.setSoundFxEnabled(this.settings.soundEnabled);'), 'app.js btnSound toggles sound.setSoundFxEnabled instead of setMuted');
assert(!appCode.includes('sound.setMuted(!this.settings.soundEnabled);'), 'app.js no longer calls setMuted when toggling soundEnabled');
assert(audioCode.includes('if (!this.isSoundFxEnabled || this.isMuted) return;'), 'audio.js guards SFX with isSoundFxEnabled');

// 4. Button Color Consistency (Pure 2-state: bright white and soft gray, no sticky hover)
assert(css.includes('color: rgba(255, 255, 255, 0.85);'), 'styles.css uses standard bright white for normal state');
assert(css.includes('.icon-btn-pure.muted {\n  color: rgba(255, 255, 255, 0.35) !important;'), 'styles.css uses soft gray for muted state');
assert(!css.includes('.icon-btn-pure:hover, .icon-btn-pure:active {\n  color: #ffffff;'), 'styles.css does not change color on hover to avoid sticky mobile hover');
assert(!css.includes('.nav-pure-icon-btn:hover {\n  color: #ffffff;'), 'styles.css bottom nav does not change color on hover to avoid sticky mobile hover');

// 5. Missing SFX & Page Turn Sound
assert(audioCode.includes('playPageTurn()'), 'audio.js implements procedural playPageTurn() for archive close');
assert(appCode.includes('this.dom.btnSync.addEventListener(\'click\', () => {\n        sound.playPetChirp();'), 'app.js btnSync plays chirp sound');
assert(appCode.includes('this.dom.btnPlantOpen.addEventListener(\'click\', () => {\n      sound.playPetChirp();'), 'app.js btnPlantOpen plays chirp sound');
assert(appCode.includes('this.dom.btnArchiveOpen.addEventListener(\'click\', () => {\n      sound.playPetChirp();'), 'app.js btnArchiveOpen plays chirp sound');
assert(appCode.includes('this.dom.btnHabitOpen.addEventListener(\'click\', () => {\n      sound.playPetChirp();'), 'app.js btnHabitOpen plays chirp sound');
assert(appCode.includes('this.dom.btnArchiveClose.addEventListener(\'click\', () => {\n      sound.playPageTurn();'), 'app.js btnArchiveClose plays page turn sound');
assert(appCode.includes('this.dom.btnPlantCancel.addEventListener(\'click\', () => {\n      sound.playWaterDrop();'), 'app.js btnPlantCancel plays water drop sound');
assert(appCode.includes('this.dom.btnHarvestCancel.addEventListener(\'click\', () => {\n      sound.playWaterDrop();'), 'app.js btnHarvestCancel plays water drop sound');
assert(appCode.includes('this.dom.btnNoteCancel.addEventListener(\'click\', () => {\n      sound.playWaterDrop();'), 'app.js btnNoteCancel plays water drop sound');

// 6. Complete Elimination of Blocking confirm() and alert()
assert(!appCode.includes('confirm('), 'app.js has ZERO blocking confirm() calls');
assert(!appCode.includes('alert('), 'app.js has ZERO blocking alert() calls');
assert(appCode.includes("btn.textContent = '確定剷除？再次點擊確認';"), 'app.js implements inline two-step confirmation for tree deletion');
assert(appCode.includes("btn.textContent = '確定放生？再次點擊確認';"), 'app.js implements inline two-step confirmation for pet release');
assert(appCode.includes("deleteRingBtn.textContent = '確定？';"), 'app.js implements inline two-step confirmation for archive ring deletion');

// 7. Pet Interaction Decoupling
assert(sceneCode.includes('petHoldThresholdTimer'), 'scene3d.js implements petHoldThresholdTimer for threshold separation');
assert(sceneCode.includes('PET_HOLD_THRESHOLD = 260'), 'scene3d.js uses 260ms threshold to decouple tap from hold');
assert(audioCode.includes('playPetVoice(species)'), 'audio.js implements playPetVoice for species-specific vocalization');
assert(appCode.includes('sound.playPetVoice(petData.species)'), 'app.js calls sound.playPetVoice(petData.species) on short tap');

console.log(`\nVerification Complete: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) process.exit(1);
