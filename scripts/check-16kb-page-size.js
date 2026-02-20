#!/usr/bin/env node
/**
 * Check that native .so libraries are aligned for 16 KB page size (Align >= 0x4000).
 * Required for Google Play on devices with 16 KB memory pages.
 * Run after: cd android && ./gradlew assembleRelease
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const MIN_ALIGN = 0x4000; // 16 KB
const ROOT = path.resolve(__dirname, '..');
const APP_BUILD = path.join(ROOT, 'android', 'app', 'build');
// AGP 8.x may use stripped_native_libs or mergeReleaseNativeLibs
const POSSIBLE_LIB_BASES = [
  path.join(APP_BUILD, 'intermediates', 'stripped_native_libs', 'release', 'out', 'lib'),
  path.join(APP_BUILD, 'intermediates', 'mergeReleaseNativeLibs', 'out', 'lib'),
  path.join(APP_BUILD, 'intermediates', 'stripped_native_libs', 'release', 'stripReleaseDebugSymbols', 'out', 'lib'),
];

function findSoFiles(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) findSoFiles(full, list);
    else if (e.name.endsWith('.so')) list.push(full);
  }
  return list;
}

function findObjdump() {
  const platform = process.platform === 'win32' ? 'windows-x86_64' : process.platform === 'darwin' ? 'darwin-x86_64' : 'linux-x86_64';
  const exe = process.platform === 'win32' ? 'llvm-objdump.exe' : 'llvm-objdump';

  // 1) Explicit NDK env
  const ndkEnv = process.env.ANDROID_NDK_HOME || process.env.ANDROID_NDK_ROOT;
  if (ndkEnv && fs.existsSync(ndkEnv)) {
    const c = path.join(ndkEnv, 'toolchains', 'llvm', 'prebuilt', platform, 'bin', exe);
    if (fs.existsSync(c)) return c;
  }

  // 2) SDK from env
  let sdkRoot = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!sdkRoot && process.env.LOCALAPPDATA) {
    sdkRoot = path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk');
  }

  // 3) SDK and NDK version from project
  const localPropPath = path.join(ROOT, 'android', 'local.properties');
  if (fs.existsSync(localPropPath)) {
    const content = fs.readFileSync(localPropPath, 'utf8');
    const m = content.match(/sdk\.dir=(.+)/);
    if (m) {
      const raw = m[1].trim().replace(/\\\\/g, '\\');
      if (fs.existsSync(raw)) sdkRoot = raw;
    }
  }

  let ndkVersion = null;
  const buildGradlePath = path.join(ROOT, 'android', 'build.gradle');
  if (fs.existsSync(buildGradlePath)) {
    const content = fs.readFileSync(buildGradlePath, 'utf8');
    const m = content.match(/ndkVersion\s*=\s*["']([^"']+)["']/);
    if (m) ndkVersion = m[1];
  }

  if (sdkRoot && fs.existsSync(sdkRoot)) {
    const ndkDir = path.join(sdkRoot, 'ndk');
    if (fs.existsSync(ndkDir)) {
      const versions = ndkVersion ? [ndkVersion] : fs.readdirSync(ndkDir);
      for (const v of versions) {
        const root = path.join(ndkDir, v);
        if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) continue;
        const candidate = path.join(root, 'toolchains', 'llvm', 'prebuilt', platform, 'bin', exe);
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  }

  return null;
}

let cachedObjdump = undefined;
function getObjdump() {
  if (cachedObjdump !== undefined) return cachedObjdump;
  cachedObjdump = findObjdump();
  return cachedObjdump;
}

function getAlign(filePath, objdump) {
  if (!objdump) return null;
  try {
    const result = spawnSync(objdump, ['-x', filePath], {
      encoding: 'utf8',
      maxBuffer: 2 * 1024 * 1024,
      windowsHide: true,
    });
    // LLVM objdump may write headers to stdout or stderr; merge both
    const out = [result.stdout, result.stderr].filter(Boolean).join('\n');
    // Format 1: LOAD line with "align 2**14" (2^14 = 16384) - LLVM/NDK Program Header
    const mAlign2 = out.match(/LOAD[^\n]*align\s+2\*\*(\d+)/i);
    if (mAlign2) return Math.pow(2, parseInt(mAlign2[1], 10));
    // Format 1b: any "align 2**N" (fallback if LOAD is on previous line)
    const mAlign2Any = out.match(/align\s+2\*\*(\d+)/i);
    if (mAlign2Any) return Math.pow(2, parseInt(mAlign2Any[1], 10));
    // Format 2: "Align 0x4000" or "Align 4000"
    const mHex = out.match(/Align\s+(?:0x)?([0-9a-fA-F]+)/i);
    if (mHex) return parseInt(mHex[1], 16);
    return null;
  } catch (_) {
    return null;
  }
}

function main() {
  console.log('Checking 16 KB page size alignment (LOAD segment Align >= 0x4000)...\n');
  let LIB_BASE = null;
  for (const base of POSSIBLE_LIB_BASES) {
    if (fs.existsSync(base)) {
      LIB_BASE = base;
      break;
    }
  }
  if (!LIB_BASE) {
    console.error('Release native libs not found. Build release first:');
    console.error('  cd android && ./gradlew assembleRelease   (or on Windows: gradlew.bat assembleRelease)');
    console.error('Then run: yarn check:16kb');
    process.exit(1);
  }
  const objdump = getObjdump();
  if (!objdump) {
    console.error('Could not find llvm-objdump. Install Android NDK (Android Studio → SDK Manager → SDK Tools → NDK)');
    console.error('and ensure android/local.properties has sdk.dir and android/build.gradle has ndkVersion.');
    process.exit(1);
  }
  const files = findSoFiles(LIB_BASE);
  const REQUIRED_64BIT_ABIS = ['arm64-v8a', 'x86_64'];
  const is64BitRequired = (filePath) => REQUIRED_64BIT_ABIS.some(abi => filePath.includes(abi));
  let ok = 0, fail = 0, skip = 0;
  const fails = [];
  for (const f of files) {
    const rel = path.relative(ROOT, f);
    const align = getAlign(f, objdump);
    const required = is64BitRequired(f);
    if (align === null) {
      if (required) {
        console.log('  ?   ' + rel + ' (could not read)');
        fail++;
        fails.push(rel);
      } else {
        skip++;
      }
      continue;
    }
    const okAlign = align >= MIN_ALIGN;
    if (okAlign) {
      console.log('  OK  ' + rel + ' Align 0x' + align.toString(16) + ' (16 KB)');
      ok++;
    } else if (required) {
      const kb = align === 0x1000 ? '4 KB' : '0x' + align.toString(16);
      console.log('  FAIL ' + rel + ' Align 0x' + align.toString(16) + ' (' + kb + ')');
      fail++;
      fails.push(rel);
    } else {
      console.log('  skip ' + rel + ' (32-bit, 4 KB OK for Play)');
      skip++;
    }
  }
  console.log('\n' + ok + ' OK, ' + fail + ' FAIL (64-bit), ' + skip + ' skipped (32-bit)');
  if (fail > 0) {
    console.log('\n' + fail + ' 64-bit library(ies) are not 16 KB aligned. Google Play requires arm64-v8a/x86_64 to be 16 KB.');
    process.exit(1);
  }
  console.log('\nAll 64-bit native libs are 16 KB aligned (Play compliant).');
}

main();
