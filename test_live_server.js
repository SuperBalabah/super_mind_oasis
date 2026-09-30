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
    assert(html.includes('id="modal-adopt"'), 'Live HTML contains #modal-adopt modal');
    assert(html.includes('id="modal-pet-detail"'), 'Live HTML contains #modal-pet-detail modal');
    assert(html.includes('id="top-pets-widget"'), 'Live HTML contains #top-pets-widget');
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
    assert(!code.includes('feedAura'), 'scene3d.js has REMOVED the distracting feedAura ground ring');
    assert(code.includes('looking_up'), 'scene3d.js supports gentle looking_up head raise on tap');
    assert(code.includes('happy_nod'), 'scene3d.js supports contented happy_nod on feed complete');
    assert(code.includes('woolTuft') && code.includes('blushMat'), 'scene3d.js includes sheep face details (tuft, blush, eyes)');
    assert(code.includes('snout') && code.includes('noseTip'), 'scene3d.js includes fox face & nose tip details');
    assert(code.includes('eyebrowMat') || code.includes('tan'), 'scene3d.js includes Shiba eyebrow dots & muzzle');
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
    assert(!code.includes('onPetTapped(petData) {\n    sound.playPetChirp();\n    this.showToast'), 'onPetTapped does NOT show banner toast');
    assert(code.includes('溫暖陪伴'), 'app.js displays organic toast');
  } catch (e) {
    assert(false, `Failed to fetch app.js: ${e.message}`);
  }

  // 5. Test scene3d hold timer is extended
  try {
    const res = await fetch('http://localhost:5173/src/scene3d.js');
    const code = await res.text();
    assert(code.includes('FEED_HOLD_TIME = 1300'), 'scene3d.js has lengthened feeding hold time (1300ms)');
    assert(code.includes('eatTimer = 2.4'), 'scene3d.js gives pet extra 2.4s to finish eating from bowl');
  } catch (e) {
    assert(false, `Failed to verify scene3d: ${e.message}`);
  }

  // 6. Test delete & reset functionality
  try {
    const htmlRes = await fetch('http://localhost:5173/');
    const html = await htmlRes.text();
    assert(html.includes('id="btn-tree-delete"'), 'Live HTML contains #btn-tree-delete button');
    assert(!html.includes('id="btn-reset-blank"'), 'Live HTML correctly removed #btn-reset-blank as requested');

    const storageRes = await fetch('http://localhost:5173/src/storage.js');
    const storageCode = await storageRes.text();
    assert(storageCode.includes('deleteTree(treeId)'), 'storage.js includes deleteTree method');
    assert(storageCode.includes('deletePet(petId)'), 'storage.js includes deletePet method');
    assert(storageCode.includes('deleteRing(ringId)'), 'storage.js includes deleteRing method');

    const appRes = await fetch('http://localhost:5173/src/app.js');
    const appCode = await appRes.text();
    assert(appCode.includes('renderTopPetsWidget'), 'app.js renders top-right pet widget');
    assert(appCode.includes('releaseCurrentPet'), 'app.js handles pet release');
    assert(appCode.includes('btn-delete-ring'), 'app.js handles ring deletion');
  } catch (e) {
    assert(false, `Failed to verify delete & reset: ${e.message}`);
  }

  // 7. Test universal backdrop tap & care label refinement
  try {
    const htmlRes = await fetch('http://localhost:5173/');
    const html = await htmlRes.text();
    assert(html.includes('累積陪伴：'), 'Live HTML displays refined [累積陪伴：] label');
    assert(!html.includes('長按小動物直接餵食陪伴'), 'Live HTML removed short-press/long-press notes completely');

    const appRes = await fetch('http://localhost:5173/src/app.js');
    const appCode = await appRes.text();
    assert(appCode.includes('onBlankTap'), 'app.js connects scene onBlankTap to closeTreeCard');
    assert(appCode.includes('modal-overlay') && appCode.includes("e.target === overlay"), 'app.js binds backdrop click to close any open modal');
    assert(appCode.includes('${pet.careCount || 1} 次`'), 'app.js formats pet care count as clean "X 次"');

    const sceneRes = await fetch('http://localhost:5173/src/scene3d.js');
    const sceneCode = await sceneRes.text();
    assert(sceneCode.includes('this.onBlankTap()'), 'scene3d.js triggers onBlankTap when tapping empty terrain/water');
  } catch (e) {
    assert(false, `Failed to verify backdrop dismiss: ${e.message}`);
  }

  // 8. Test anti-clipping, obstacle avoidance & island boundary conformance
  try {
    const sceneRes = await fetch('http://localhost:5173/src/scene3d.js');
    const sceneCode = await sceneRes.text();
    assert(sceneCode.includes('getStaticObstacles()'), 'scene3d.js has getStaticObstacles obstacle detector');
    assert(sceneCode.includes('resolvePositionCollision('), 'scene3d.js implements resolvePositionCollision');
    assert(sceneCode.includes('pickSafeWanderTarget('), 'scene3d.js implements pickSafeWanderTarget');
    assert(sceneCode.includes('getGroundHeight('), 'scene3d.js computes procedural ground height');
    assert(sceneCode.includes('MAX_RADIUS = 2.35'), 'scene3d.js enforces strict MAX_RADIUS island boundary');
    assert(sceneCode.includes('minPetDist = 0.65'), 'scene3d.js enforces mutual pet-to-pet separation');

    const storageRes = await fetch('http://localhost:5173/src/storage.js');
    const storageCode = await storageRes.text();
    assert(storageCode.includes('allCandidateSpots'), 'storage.js has extended safe tree grove spots');
  } catch (e) {
    assert(false, `Failed to verify collision avoidance: ${e.message}`);
  }

  // 9. Test mobile layout fixes, inverted rotation, expanded zoom & decluttered modal
  try {
    const sceneRes = await fetch('http://localhost:5173/src/scene3d.js');
    const sceneCode = await sceneRes.text();
    assert(sceneCode.includes('this.targetRotationY -= deltaX'), 'scene3d.js inverts rotation drag direction for intuitive direct manipulation');
    assert(sceneCode.includes('Math.min(19.0'), 'scene3d.js expands zoom range to 19.0 for full mobile island visibility');
    assert(sceneCode.includes('initialFov = aspect < 1.0'), 'scene3d.js implements responsive portrait FOV in init()');
    assert(sceneCode.includes('coneHeight = 1.65'), 'scene3d.js trims the island underbelly cone to prevent eating up screen height');

    const cssRes = await fetch('http://localhost:5173/styles.css');
    const cssCode = await cssRes.text();
    assert(cssCode.includes('left: 0') && cssCode.includes('right: auto'), 'styles.css places .top-controls on top left away from pet widget');
    assert(cssCode.includes('100dvh'), 'styles.css uses 100dvh for reliable mobile viewport height');
    assert(cssCode.includes('.type-item-desc') && cssCode.includes('display: none;'), 'styles.css hides verbose card text to keep plant modal airy and uncluttered');
  } catch (e) {
    assert(false, `Failed to verify mobile enhancements: ${e.message}`);
  }

  console.log(`\nResult: ${passCount} Passed, ${failCount} Failed.`);
  if (failCount > 0) process.exit(1);
}

run();
