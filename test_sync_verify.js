// Automated Node.js Zero-Token Test for Super Mind Oasis Gist Cloud Sync
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

console.log('=== Super Mind Oasis - Gist Cloud Sync Verification ===');

// 1. Verify index.html UI
const html = fs.readFileSync('index.html', 'utf-8');
assert(html.includes('id="btn-sync"'), 'index.html contains #btn-sync in top controls');
assert(html.includes('id="icon-sync-svg"'), 'index.html contains SVG cloud icon');
assert(html.includes('id="modal-sync"'), 'index.html contains #modal-sync modal dialog');
assert(html.includes('id="sync-auto-toggle"'), 'index.html contains #sync-auto-toggle for auto sync');
assert(html.includes('id="sync-token-input"'), 'index.html contains #sync-token-input');
assert(html.includes('id="sync-gist-id-input"'), 'index.html contains #sync-gist-id-input');
assert(html.includes('id="btn-create-gist"'), 'index.html contains #btn-create-gist button');
assert(html.includes('id="btn-manual-push"'), 'index.html contains #btn-manual-push button');
assert(html.includes('id="btn-manual-pull"'), 'index.html contains #btn-manual-pull button');
assert(html.includes('id="sync-last-time-text"'), 'index.html contains #sync-last-time-text display');

// Verify old backup buttons are removed from modal-archive
assert(!html.includes('id="btn-export-backup"'), 'Old #btn-export-backup has been removed');
assert(!html.includes('id="input-import-backup"'), 'Old #input-import-backup has been removed');

// Verify ZERO ugly emojis in sync modal
const syncModalBlock = html.slice(html.indexOf('id="modal-sync"'), html.indexOf('</div>\n  </div>\n\n  <script'));
assert(!/[\u{1F300}-\u{1F9FF}]/u.test(syncModalBlock), 'Sync modal contains ZERO emojis (clean vector SVGs only)');

// 2. Verify styles.css
const css = fs.readFileSync('styles.css', 'utf-8');
assert(css.includes('.icon-btn-pure.syncing svg'), 'styles.css has syncing cloud breathing glow animation');
assert(css.includes('.sync-modal-header'), 'styles.css has .sync-modal-header style');
assert(css.includes('.toggle-switch'), 'styles.css has iOS-style .toggle-switch');
assert(css.includes('.sync-btn-outline'), 'styles.css has .sync-btn-outline for push/pull buttons');

// 3. Verify src/storage.js
const storageCode = fs.readFileSync('src/storage.js', 'utf-8');
assert(storageCode.includes('STORAGE_KEY_SYNC'), 'storage.js defines STORAGE_KEY_SYNC');
assert(storageCode.includes('getSyncConfig'), 'storage.js has getSyncConfig method');
assert(storageCode.includes('saveSyncConfig'), 'storage.js has saveSyncConfig method');
assert(storageCode.includes('applySyncedData'), 'storage.js has applySyncedData method');
assert(storageCode.includes('exportAllDataPayload'), 'storage.js has exportAllDataPayload method');
assert(storageCode.includes('export const GistSync'), 'storage.js exports GistSync');
assert(storageCode.includes('createGist('), 'GistSync has createGist method');
assert(storageCode.includes('pushToGist('), 'GistSync has pushToGist method');
assert(storageCode.includes('pullFromGist('), 'GistSync has pullFromGist method');

// 4. Verify src/app.js
const appCode = fs.readFileSync('src/app.js', 'utf-8');
assert(appCode.includes('GistSync'), 'app.js imports GistSync');
assert(appCode.includes('this.scheduleCloudPush()'), 'app.js has scheduleCloudPush calls');
assert(appCode.includes('this.checkRemoteSyncOnLaunch()'), 'app.js has checkRemoteSyncOnLaunch in init()');
assert(appCode.includes('openSyncModal()'), 'app.js has openSyncModal method');
assert(appCode.includes('onSaveSyncSettings('), 'app.js has onSaveSyncSettings method');
assert(appCode.includes('onCreateGist('), 'app.js has onCreateGist method');
assert(appCode.includes('performCloudPush('), 'app.js has performCloudPush method');
assert(appCode.includes('performCloudPull('), 'app.js has performCloudPull method');

// 5. Aesthetic Refinement Assertions
assert(!css.includes('.icon-btn-pure.connected {'), 'Cloud button does NOT have permanent golden .connected style (stays white when idle)');
assert(!css.includes('.nav-pure-icon-btn.primary svg {\n  stroke: var(--accent-gold);'), 'Plant button is NOT forced golden (now matches white minimal style)');
assert(!css.includes('border: 1px solid rgba(237, 210, 133, 0.35);'), 'Toast does NOT have greasy golden border (now clean frosted glass)');

// Verify ZERO emojis in all showToast invocations in app.js
const toastCalls = [...appCode.matchAll(/this\.showToast\((.*?)\)/g)].map(m => m[1]);
const hasEmojiInToast = toastCalls.some(str => /[\u{1F300}-\u{1F9FF}]/u.test(str));
assert(!hasEmojiInToast, 'All showToast invocations contain ZERO emojis');

console.log(`\n=== Cloud Sync Test Summary: ${passCount} Passed, ${failCount} Failed ===`);
if (failCount > 0) process.exit(1);

