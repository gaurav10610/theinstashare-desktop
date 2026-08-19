#!/usr/bin/env node

/**
 * 100% Local Release Builder & Packager for InstaShare Next
 * No GitHub Actions or 3rd party CI/CD required.
 * 
 * Usage:
 *   node scripts/build-release.js [mac|win|linux|all] [patch|minor|major|<version>]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const targetPlatform = process.argv[2] || 'mac';
const bumpType = process.argv[3] || 'none';

const rootDir = path.join(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');
const releaseDir = path.join(rootDir, 'release');
const changelogPath = path.join(rootDir, 'CHANGELOG.md');

console.log('═══════════════════════════════════════════════════════════');
console.log(' 🚀 InstaShare Next - Local Release Packager');
console.log('═══════════════════════════════════════════════════════════');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// 1. Optional Version Bumping
if (bumpType !== 'none') {
  const parts = pkg.version.split('.').map((p) => parseInt(p, 10));
  let nextVersion = pkg.version;

  if (bumpType === 'major') nextVersion = `${parts[0] + 1}.0.0`;
  else if (bumpType === 'minor') nextVersion = `${parts[0]}.${parts[1] + 1}.0`;
  else if (bumpType === 'patch') nextVersion = `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  else if (/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/.test(bumpType)) nextVersion = bumpType;

  console.log(`\n📌 Bumping version: v${pkg.version} -> v${nextVersion}`);
  pkg.version = nextVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

console.log(`\n📦 Active Version: v${pkg.version}`);

// 2. Run Typecheck & Tests Locally
console.log('\n🔍 Running TypeScript Typecheck...');
execSync('npm run typecheck', { stdio: 'inherit', cwd: rootDir });

console.log('\n🧪 Running Exhaustive Test Suite...');
execSync('npm test', { stdio: 'inherit', cwd: rootDir });

// 3. Compile Production Bundle
console.log('\n⚡ Compiling Production Assets (electron-vite)...');
execSync('npm run build', { stdio: 'inherit', cwd: rootDir });

// 4. Run electron-builder locally
console.log(`\n🔨 Packaging Standalone Desktop Executables (${targetPlatform})...`);
let builderFlag = '--mac';
if (targetPlatform === 'win') builderFlag = '--win';
else if (targetPlatform === 'linux') builderFlag = '--linux';
else if (targetPlatform === 'all') builderFlag = '-mwl';

execSync(`npx electron-builder ${builderFlag}`, { stdio: 'inherit', cwd: rootDir });

// 5. Generate SHA-256 Checksums and version.json manifest
console.log('\n🔐 Generating SHA-256 Checksums and Manifest...');
if (fs.existsSync(releaseDir)) {
  const files = fs.readdirSync(releaseDir).filter((f) => {
    return f.endsWith('.dmg') || f.endsWith('.zip') || f.endsWith('.exe') || f.endsWith('.AppImage') || f.endsWith('.deb');
  });

  const checksumLines = [];
  const assets = [];

  files.forEach((file) => {
    const filePath = path.join(releaseDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const stats = fs.statSync(filePath);

    checksumLines.push(`${hash}  ${file}`);
    assets.push({
      name: file,
      size: stats.size,
      sha256: hash
    });
  });

  fs.writeFileSync(path.join(releaseDir, 'SHA256SUMS.txt'), checksumLines.join('\n') + '\n');

  // Self-hosted version.json manifest (can be served on any local or remote server)
  const manifest = {
    version: pkg.version,
    releaseDate: new Date().toISOString(),
    releaseName: `InstaShare Next v${pkg.version}`,
    releaseNotes: `Release build v${pkg.version} generated locally.`,
    assets
  };

  fs.writeFileSync(path.join(releaseDir, 'version.json'), JSON.stringify(manifest, null, 2) + '\n');

  console.log(`✅ Generated release/SHA256SUMS.txt and release/version.json`);
  console.log(`✨ Packaged ${files.length} release files in ${releaseDir}`);
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log(` 🎉 Local Release v${pkg.version} Complete!`);
console.log('═══════════════════════════════════════════════════════════\n');
