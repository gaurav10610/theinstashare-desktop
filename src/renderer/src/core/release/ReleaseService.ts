export interface AppVersionData {
  version: string;
  channel: string;
  platform: string;
  arch: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  publishedAt: string;
  downloadUrl: string;
  assetName?: string;
  assetSize?: number;
}

export class ReleaseService {
  public static compareSemver(v1: string, v2: string): number {
    const clean1 = (v1 || '').replace(/^v/, '').split('-');
    const clean2 = (v2 || '').replace(/^v/, '').split('-');

    const parts1 = clean1[0].split('.').map((p) => parseInt(p, 10) || 0);
    const parts2 = clean2[0].split('.').map((p) => parseInt(p, 10) || 0);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const a = parts1[i] || 0;
      const b = parts2[i] || 0;
      if (a > b) return 1;
      if (a < b) return -1;
    }

    // Check pre-release tags (e.g. -beta.1)
    if (!clean1[1] && clean2[1]) return 1; // standard release is newer than pre-release of same version
    if (clean1[1] && !clean2[1]) return -1;

    return 0;
  }

  public static async checkForUpdates(): Promise<UpdateCheckResult> {
    if (!window.api?.checkUpdates) {
      return {
        hasUpdate: false,
        currentVersion: '2.0.0',
        latestVersion: '2.0.0',
        releaseName: 'v2.0.0',
        releaseNotes: 'Offline development mode',
        publishedAt: new Date().toISOString(),
        downloadUrl: 'https://github.com/gaurav10610/zerohop-desktop/releases'
      };
    }
    return window.api.checkUpdates();
  }

  public static async getVersionInfo(): Promise<AppVersionData> {
    if (!window.api?.getVersionInfo) {
      return {
        version: '2.0.0',
        channel: 'stable',
        platform: 'mac',
        arch: 'arm64',
        electronVersion: '34.2.0',
        chromeVersion: '132.0',
        nodeVersion: '22.13.0'
      };
    }
    return window.api.getVersionInfo();
  }
}
