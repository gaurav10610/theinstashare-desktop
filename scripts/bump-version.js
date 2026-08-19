#!/usr/bin/env node

/**
 * Version Bumper & Release Orchestrator for InstaShare Next
 * Usage: node scripts/bump-version.js [patch|minor|major|<version>]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = process.argv[2] || 'patch';
const pkgPath = path.join(__dirname, '../package.json');
const changelogPath = path.join(__dirname, '../CHANGELOG.md');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const currentVersion = pkg.version;

function calculateNextVersion(current, bumpType) {
  const parts = current.split('.').map((p) => parseInt(p, 10));
  if (bumpType === 'major') {
    return `${parts[0] + 1}.0.0`;
  } else if (bumpType === 'minor') {
    return `${parts[0]}.${parts[1] + 1}.0`;
  } else if (bumpType === 'patch') {
    return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  } else if (/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/.test(bumpType)) {
    return bumpType;
  }
  throw new Error(`Invalid bump type or version: ${bumpType}`);
}

const nextVersion = calculateNextVersion(currentVersion, target);

console.log(`🚀 Bumping InstaShare Next from v${currentVersion} -> v${nextVersion}`);

// Update package.json
pkg.version = nextVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// Append to CHANGELOG.md
const dateStr = new Date().toISOString().split('T')[0];
const changelogEntry = `
## [${nextVersion}] - ${dateStr}
### Highlights & Changes
- Automated release build for v${nextVersion}
- Cross-platform binaries compiled for macOS (Apple Silicon/Intel), Windows (x64/arm64), and Linux.
`;

let changelogContent = '';
if (fs.existsSync(changelogPath)) {
  changelogContent = fs.readFileSync(changelogPath, 'utf8');
} else {
  changelogContent = '# Changelog - InstaShare Next\n';
}

fs.writeFileSync(changelogPath, changelogContent + changelogEntry);

console.log(`✅ Updated package.json and CHANGELOG.md`);
console.log(`✨ Next step: git tag v${nextVersion} && npm run package`);
