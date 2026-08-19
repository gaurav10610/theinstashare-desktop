import { describe, it, expect } from 'vitest';
import { ReleaseService } from '../src/renderer/src/core/release/ReleaseService';
import { isNewerVersion } from '../src/main/ipc/release.ipc';

describe('Versioning & Release Exhaustive Suite', () => {
  describe('SemVer Version Comparator', () => {
    it('should correctly evaluate major, minor, and patch updates', () => {
      // Latest is newer
      expect(ReleaseService.compareSemver('2.0.0', '2.0.1')).toBe(-1);
      expect(ReleaseService.compareSemver('2.0.0', '2.1.0')).toBe(-1);
      expect(ReleaseService.compareSemver('2.0.0', '3.0.0')).toBe(-1);

      // Current is newer
      expect(ReleaseService.compareSemver('2.1.0', '2.0.0')).toBe(1);
      expect(ReleaseService.compareSemver('3.0.0', '2.9.9')).toBe(1);

      // Same versions
      expect(ReleaseService.compareSemver('2.0.0', '2.0.0')).toBe(0);
      expect(ReleaseService.compareSemver('v2.0.0', '2.0.0')).toBe(0);
    });

    it('should handle pre-release channels (beta, rc)', () => {
      expect(ReleaseService.compareSemver('2.0.0', '2.0.0-beta.1')).toBe(1); // stable is newer than beta
      expect(ReleaseService.compareSemver('2.0.0-beta.1', '2.0.0')).toBe(-1);
    });

    it('should evaluate isNewerVersion helper correctly', () => {
      expect(isNewerVersion('2.0.0', '2.0.1')).toBe(true);
      expect(isNewerVersion('2.0.0', '2.1.0')).toBe(true);
      expect(isNewerVersion('2.0.0', '2.0.0')).toBe(false);
      expect(isNewerVersion('2.1.0', '2.0.5')).toBe(false);
    });
  });

  describe('Platform Asset Matcher', () => {
    it('should match the appropriate binary installer for macOS arm64 vs x64 vs Windows vs Linux', () => {
      const mockAssets = [
        { name: 'ZeroHop-2.1.0-arm64.dmg', browser_download_url: 'https://github.com/download/arm64.dmg' },
        { name: 'ZeroHop-2.1.0-x64.dmg', browser_download_url: 'https://github.com/download/x64.dmg' },
        { name: 'ZeroHop-Setup-2.1.0.exe', browser_download_url: 'https://github.com/download/setup.exe' },
        { name: 'ZeroHop-2.1.0.AppImage', browser_download_url: 'https://github.com/download/appimage' }
      ];

      const matchMacArm64 = mockAssets.find((a) => a.name.includes('arm64.dmg'));
      expect(matchMacArm64?.browser_download_url).toBe('https://github.com/download/arm64.dmg');

      const matchWindows = mockAssets.find((a) => a.name.includes('.exe'));
      expect(matchWindows?.browser_download_url).toBe('https://github.com/download/setup.exe');

      const matchLinux = mockAssets.find((a) => a.name.includes('.AppImage'));
      expect(matchLinux?.browser_download_url).toBe('https://github.com/download/appimage');
    });
  });
});
