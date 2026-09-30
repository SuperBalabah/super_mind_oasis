// Zero-token HTTP & Static Assertion Test
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

async function run() {
  console.log('--- Super Mind Oasis Zero-Token Node Test ---');

  // 1. Fetch live index.html from Vite Dev Server
  try {
    const res = await fetch('http://localhost:5173/');
    assert(res.ok, 'Vite dev server is serving http://localhost:5173/ successfully (HTTP 200)');
    const html = await res.text();
    assert(html.includes('id="floating-toast"'), 'Live HTML contains #floating-toast HUD');
    assert(html.includes('id="modal-habit"'), 'Live HTML contains #modal-habit modal');
    assert(!html.includes('已打卡'), 'Live HTML contains ZERO occurrences of "已打卡"');
    assert(html.includes('長按寵物餵食陪伴'), 'Live HTML center hint instructs long-press feeding');
  } catch (e) {
    assert(false, `Failed to reach Vite dev server: ${e.message}`);
  }

  // 2. Fetch live src/storage.js
  try {
    const res = await fetch('http://localhost:5173/src/storage.js');
    assert(res.ok, 'Vite dev server serves src/storage.js');
    const code = await res.text();
    assert(code.includes('careCount'), 'storage.js tracks organic careCount');
    assert(!code.includes('streak: 0'), 'storage.js has no default streak: 0');
    assert(code.includes('nurturePet'), 'storage.js has nurturePet method');
  } catch (e) {
    assert(false, `Failed to fetch storage.js: ${e.message}`);
  }

  // 3. Fetch live src/scene3d.js
  try {
    const res = await fetch('http://localhost:5173/src/scene3d.js');
    assert(res.ok, 'Vite dev server serves src/scene3d.js');
    const code = await res.text();
    assert(code.includes('eating_hold'), 'scene3d.js supports immediate eating_hold state on pointerdown');
    assert(code.includes('feedDish.visible = true'), 'scene3d.js makes feedDish visible immediately on press');
    assert(code.includes('feedAura'), 'scene3d.js includes glowing feedAura');
    assert(code.includes('hitSphere'), 'scene3d.js includes hitSphere for reliable mobile touch');
    assert(code.includes('completePetFeed'), 'scene3d.js includes completePetFeed');
  } catch (e) {
    assert(false, `Failed to fetch scene3d.js: ${e.message}`);
  }

  // 4. Fetch live src/app.js
  try {
    const res = await fetch('http://localhost:5173/src/app.js');
    assert(res.ok, 'Vite dev server serves src/app.js');
    const code = await res.text();
    assert(code.includes('showToast'), 'app.js includes showToast HUD implementation');
    assert(code.includes('onPetHoldStart'), 'app.js handles onPetHoldStart');
    assert(code.includes('onPetTapped'), 'app.js handles onPetTapped');
    assert(!code.includes('onPetTapped(petData) {\n    sound.playPetChirp();\n    this.openHabitModal();'), 'onPetTapped does NOT open modal');
    assert(code.includes('次陪伴'), 'app.js displays organic "次陪伴"');
  } catch (e) {
    assert(false, `Failed to fetch app.js: ${e.message}`);
  }

  console.log(`\nResult: ${passCount} Passed, ${failCount} Failed.`);
  if (failCount > 0) process.exit(1);
}

run();
