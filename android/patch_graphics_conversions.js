// Patch graphicsConversions.h in Gradle cache (NDK has no std::format)
const fs = require('fs');
const path = require('path');

const gradleHome = process.env.GRADLE_USER_HOME || path.join(process.env.USERPROFILE || process.env.HOME, '.gradle');
const cachesDir = path.join(gradleHome, 'caches');
const badLine = 'return std::format("{}%", dimension.value);';
const goodLine = 'return folly::dynamic(std::to_string(dimension.value) + "%");';
const targetName = 'graphicsConversions.h';

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      cb(full, e.name);
      walk(full, cb);
    }
  }
}

let patched = 0;
walk(cachesDir, (dir, name) => {
  if (!name.includes('react-android')) return;
  const prefabFile = path.join(dir, 'prefab', 'modules', 'reactnative', 'include', 'react', 'renderer', 'core', targetName);
  if (!fs.existsSync(prefabFile) || !fs.statSync(prefabFile).isFile()) return;
  let text = fs.readFileSync(prefabFile, 'utf8');
  if (!text.includes(badLine)) return;
  fs.writeFileSync(prefabFile, text.replace(badLine, goodLine), 'utf8');
  console.log('Patched:', prefabFile);
  patched++;
});

if (patched === 0) {
  console.log('No graphicsConversions.h file needed patching (or cache not found).');
} else {
  console.log('Patched', patched, 'file(s).');
}
