// Headless verification test for Super Mind Oasis
import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

console.log('--- Super Mind Oasis Zero-Token Verification ---');

// 1. Check PWA Manifest
try {
  const manifestRaw = fs.readFileSync('public/manifest.json', 'utf-8');
  const manifest = JSON.parse(manifestRaw);
  assert(manifest.display === 'standalone', 'Manifest has standalone display for PWA');
  assert(manifest.orientation === 'portrait', 'Manifest is locked to portrait for phone hand-feel');
  assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'Manifest defines required icon sizes');
} catch (e) {
  assert(false, `Manifest error: ${e.message}`);
}

// 2. Check Service Worker
assert(fs.existsSync('public/sw.js'), 'Service worker sw.js exists for offline caching');
const swContent = fs.readFileSync('public/sw.js', 'utf-8');
assert(swContent.includes('caches.open') && swContent.includes('fetch'), 'Service worker has cache & fetch strategy');

// 3. Check Icons
assert(fs.existsSync('public/icon-192.png'), 'Icon 192x192 exists');
assert(fs.existsSync('public/icon-512.png'), 'Icon 512x512 exists');
assert(fs.existsSync('public/apple-touch-icon.png'), 'iOS Apple Touch Icon exists');

// 4. Check index.html iOS meta tags
const htmlContent = fs.readFileSync('index.html', 'utf-8');
assert(htmlContent.includes('apple-mobile-web-app-capable'), 'HTML includes apple-mobile-web-app-capable');
assert(htmlContent.includes('viewport-fit=cover'), 'HTML includes viewport-fit=cover for iPhone notch');
assert(htmlContent.includes('apple-touch-icon'), 'HTML links apple-touch-icon');
assert(htmlContent.includes('manifest.json'), 'HTML links manifest.json');

// 5. Check Dist Build output
assert(fs.existsSync('dist/index.html'), 'Dist build output exists');

console.log(`\nVerification Result: ${passCount} Passed, ${failCount} Failed.`);
if (failCount > 0) process.exit(1);
