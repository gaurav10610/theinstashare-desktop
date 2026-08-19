import { ipcMain, app, shell } from 'electron';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

export interface AppVersionInfo {
  version: string;
  channel: 'stable' | 'beta' | 'nightly';
  platform: string;
  arch: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  v8Version: string;
}

export interface ReleaseUpdateInfo {
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

export function registerReleaseIPC(): void {
  ipcMain.handle('release:get-version-info', (): AppVersionInfo => {
    return {
      version: app.getVersion(),
      channel: (process.env.APP_CHANNEL as any) || 'stable',
      platform: process.platform,
      arch: process.arch,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      nodeVersion: process.versions.node,
      v8Version: process.versions.v8
    };
  });

  ipcMain.handle('release:check-updates', async (_, customServerUrl?: string): Promise<ReleaseUpdateInfo> => {
    const currentVersion = app.getVersion();
    const manifestUrl = customServerUrl || process.env.UPDATE_SERVER_URL || 'https://api.github.com/repos/gaurav10610/theinstashare-desktop/releases/latest';

    // 1. Check local release/version.json if available
    const localManifestPath = path.join(app.getAppPath(), 'release', 'version.json');
    if (fs.existsSync(localManifestPath)) {
      try {
        const localManifest = JSON.parse(fs.readFileSync(localManifestPath, 'utf8'));
        const hasUpdate = isNewerVersion(currentVersion, localManifest.version);
        if (hasUpdate) {
          return {
            hasUpdate: true,
            currentVersion,
            latestVersion: localManifest.version,
            releaseName: localManifest.releaseName || `v${localManifest.version}`,
            releaseNotes: localManifest.releaseNotes || 'New local build available.',
            publishedAt: localManifest.releaseDate || new Date().toISOString(),
            downloadUrl: path.join(app.getAppPath(), 'release')
          };
        }
      } catch {}
    }

    // 2. Query HTTP/HTTPS static manifest URL
    return new Promise((resolve) => {
      const client = manifestUrl.startsWith('https') ? https : http;

      const req = client.get(
        manifestUrl,
        {
          headers: {
            'User-Agent': `InstaShare-Desktop/${currentVersion}`
          },
          timeout: 4000
        },
        (res) => {
          if (res.statusCode !== 200) {
            resolve({
              hasUpdate: false,
              currentVersion,
              latestVersion: currentVersion,
              releaseName: `v${currentVersion}`,
              releaseNotes: 'You are on the latest release.',
              publishedAt: new Date().toISOString(),
              downloadUrl: ''
            });
            return;
          }

          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const release = JSON.parse(data);
              const latestTag = (release.tag_name || release.version || '').replace(/^v/, '');
              const hasUpdate = isNewerVersion(currentVersion, latestTag);

              const platformSuffix = process.platform === 'darwin' ? (process.arch === 'arm64' ? 'arm64.dmg' : 'x64.dmg') : (process.platform === 'win32' ? '.exe' : '.AppImage');
              const matchedAsset = (release.assets || []).find((a: any) => a.name && a.name.includes(platformSuffix));

              resolve({
                hasUpdate,
                currentVersion,
                latestVersion: latestTag || currentVersion,
                releaseName: release.name || release.releaseName || `v${latestTag}`,
                releaseNotes: release.body || release.releaseNotes || 'No changelog provided.',
                publishedAt: release.published_at || release.releaseDate || new Date().toISOString(),
                downloadUrl: matchedAsset ? matchedAsset.browser_download_url : (release.html_url || release.downloadUrl || ''),
                assetName: matchedAsset?.name,
                assetSize: matchedAsset?.size
              });
            } catch {
              resolve({
                hasUpdate: false,
                currentVersion,
                latestVersion: currentVersion,
                releaseName: `v${currentVersion}`,
                releaseNotes: 'Up to date.',
                publishedAt: new Date().toISOString(),
                downloadUrl: ''
              });
            }
          });
        }
      );

      req.on('error', () => {
        resolve({
          hasUpdate: false,
          currentVersion,
          latestVersion: currentVersion,
          releaseName: `v${currentVersion}`,
          releaseNotes: 'Offline or self-hosted release server unreachable.',
          publishedAt: new Date().toISOString(),
          downloadUrl: ''
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          hasUpdate: false,
          currentVersion,
          latestVersion: currentVersion,
          releaseName: `v${currentVersion}`,
          releaseNotes: 'Update check timed out.',
          publishedAt: new Date().toISOString(),
          downloadUrl: ''
        });
      });
    });
  });

  ipcMain.handle('release:open-download-page', (_, url: string) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    } else if (fs.existsSync(url)) {
      shell.showItemInFolder(url);
    }
    return true;
  });
}

export function isNewerVersion(current: string, latest: string): boolean {
  if (!latest || current === latest) return false;

  const currentParts = current.split('.').map((p) => parseInt(p, 10) || 0);
  const latestParts = latest.split('.').map((p) => parseInt(p, 10) || 0);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const c = currentParts[i] || 0;
    const l = latestParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }

  return false;
}
