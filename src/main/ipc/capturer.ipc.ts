import { ipcMain, desktopCapturer } from 'electron';

export interface ScreenSource {
  id: string;
  name: string;
  thumbnail: string;
  appIcon?: string;
  display_id?: string;
}

export function registerCapturerIPC(): void {
  ipcMain.handle('capturer:get-sources', async (_, types: ('window' | 'screen')[] = ['screen', 'window']): Promise<ScreenSource[]> => {
    try {
      const sources = await desktopCapturer.getSources({
        types,
        thumbnailSize: { width: 320, height: 180 },
        fetchWindowIcons: true
      });

      return sources.map((source) => ({
        id: source.id,
        name: source.name,
        thumbnail: source.thumbnail.toDataURL(),
        appIcon: source.appIcon ? source.appIcon.toDataURL() : undefined,
        display_id: source.display_id
      }));
    } catch (err) {
      console.error('[Capturer IPC] Failed to fetch desktop sources:', err);
      return [];
    }
  });
}
