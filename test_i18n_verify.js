import { TRANSLATIONS, I18N_STORAGE_KEY, i18n } from './src/i18n.js';
import { readFileSync } from 'fs';
import assert from 'assert';

console.log('--- 1. Testing Translation Key Symmetry ---');
const zhKeys = Object.keys(TRANSLATIONS.zh).sort();
const enKeys = Object.keys(TRANSLATIONS.en).sort();

assert.strictEqual(zhKeys.length, enKeys.length, `Key counts must match: zh=${zhKeys.length}, en=${enKeys.length}`);

for (const key of zhKeys) {
  assert(key in TRANSLATIONS.en, `Missing key in en: ${key}`);
  assert(TRANSLATIONS.zh[key].length > 0, `Empty zh value for ${key}`);
  assert(TRANSLATIONS.en[key].length > 0, `Empty en value for ${key}`);
}
console.log(`✅ All ${zhKeys.length} translation keys are symmetrical and populated!`);

console.log('--- 2. Checking Storage Safety & LocalStorage Key Isolation ---');
const storageContent = readFileSync('./src/storage.js', 'utf-8');
assert(storageContent.includes("'super_mind_oasis_trees_v3'"), 'Must preserve trees_v3 key');
assert(storageContent.includes("'super_mind_oasis_rings_v3'"), 'Must preserve rings_v3 key');
assert(storageContent.includes("'super_mind_oasis_settings_v3'"), 'Must preserve settings_v3 key');
assert(storageContent.includes("'super_mind_oasis_pets_v3'"), 'Must preserve pets_v3 key');
assert(storageContent.includes("'super_mind_oasis_sync_v1'"), 'Must preserve sync_v1 key');
assert.strictEqual(I18N_STORAGE_KEY, 'super_mind_oasis_lang_v1', 'Must use isolated lang key');
console.log('✅ Storage keys are strictly preserved and isolated!');

console.log('--- 3. Verifying index.html and styles.css ---');
const htmlContent = readFileSync('./index.html', 'utf-8');
assert(htmlContent.includes('id="btn-lang"'), 'index.html must have btn-lang');
assert(htmlContent.includes('id="lang-indicator"'), 'index.html must have lang-indicator');

const cssContent = readFileSync('./styles.css', 'utf-8');
assert(cssContent.includes('.lang-text-badge'), 'styles.css must have .lang-text-badge');
console.log('✅ HTML & CSS markup verified!');

console.log('--- 4. Testing Tree & Ring Localization in English and Chinese ---');
i18n.currentLang = 'en';
// Harvested initial tree in rings
const harvestedTreeRing = { id: 'ring_999', treeId: 'seed_init_01', title: '學會給自己喘息的空間' };
const locHarvested = i18n.getLocalizedRing(harvestedTreeRing);
assert.strictEqual(locHarvested.title, 'Giving Myself Space to Breathe', 'Harvested initial tree ring must be translated to English');

// Initial ring
const initialRing = { id: 'ring_init_01', title: '直面未知的焦慮' };
const locRing = i18n.getLocalizedRing(initialRing);
assert.strictEqual(locRing.title, 'Embracing the Unknown', 'Initial ring must be translated to English');

// Initial active tree
const initialTree = { id: 'seed_init_01', title: '學會給自己喘息的空間' };
const locTree = i18n.getLocalizedTree(initialTree);
assert.strictEqual(locTree.title, 'Giving Myself Space to Breathe', 'Initial active tree must be translated to English');

// Chinese mode preservation test
i18n.currentLang = 'zh';
assert.strictEqual(i18n.getLocalizedRing(harvestedTreeRing).title, '學會給自己喘息的空間', 'Chinese mode must keep original Chinese title');
assert.strictEqual(i18n.getLocalizedRing(initialRing).title, '直面未知的焦慮', 'Chinese mode must keep original Chinese title');
assert.strictEqual(i18n.getLocalizedTree(initialTree).title, '學會給自己喘息的空間', 'Chinese mode must keep original Chinese title');
console.log('✅ Tree & Ring localization passed for both active and harvested states!');

console.log('🎉 ALL i18n VERIFICATION TESTS PASSED!');

