import { ipcMain, clipboard, screen } from 'electron';

export interface RemoteInputEvent {
  type: 'mouse-move' | 'mouse-down' | 'mouse-up' | 'mouse-click' | 'mouse-dblclick' | 'scroll' | 'key-down' | 'key-up' | 'key-tap' | 'paste-text';
  x?: number;
  y?: number;
  button?: 'left' | 'middle' | 'right';
  deltaX?: number;
  deltaY?: number;
  key?: string;
  modifiers?: string[];
  text?: string;
  normalized?: boolean; // If coordinates are in 0..1 ratio
}

export function registerInputIPC(): void {
  ipcMain.handle('input:simulate', async (_, event: RemoteInputEvent): Promise<boolean> => {
    try {
      const nut = await import('@nut-tree-fork/nut-js').catch(() => null);
      if (!nut) {
        console.warn('[Input IPC] @nut-tree-fork/nut-js not loaded, skipping native hardware injection');
        return false;
      }

      const { mouse, keyboard, Button, Point, Key } = nut;

      // Handle coordinate normalization across DPI / scaling
      let targetX = event.x || 0;
      let targetY = event.y || 0;

      if (event.normalized && event.x !== undefined && event.y !== undefined) {
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.bounds;
        targetX = Math.round(event.x * width);
        targetY = Math.round(event.y * height);
      }

      switch (event.type) {
        case 'mouse-move':
          await mouse.setPosition(new Point(targetX, targetY));
          break;

        case 'mouse-down':
          await mouse.setPosition(new Point(targetX, targetY));
          if (event.button === 'right') await mouse.pressButton(Button.RIGHT);
          else if (event.button === 'middle') await mouse.pressButton(Button.MIDDLE);
          else await mouse.pressButton(Button.LEFT);
          break;

        case 'mouse-up':
          await mouse.setPosition(new Point(targetX, targetY));
          if (event.button === 'right') await mouse.releaseButton(Button.RIGHT);
          else if (event.button === 'middle') await mouse.releaseButton(Button.MIDDLE);
          else await mouse.releaseButton(Button.LEFT);
          break;

        case 'mouse-click':
          await mouse.setPosition(new Point(targetX, targetY));
          if (event.button === 'right') await mouse.click(Button.RIGHT);
          else if (event.button === 'middle') await mouse.click(Button.MIDDLE);
          else await mouse.click(Button.LEFT);
          break;

        case 'mouse-dblclick':
          await mouse.setPosition(new Point(targetX, targetY));
          await mouse.doubleClick(Button.LEFT);
          break;

        case 'scroll':
          if (event.deltaY) {
            if (event.deltaY > 0) await mouse.scrollDown(Math.abs(event.deltaY));
            else await mouse.scrollUp(Math.abs(event.deltaY));
          }
          break;

        case 'paste-text':
          if (event.text) {
            clipboard.writeText(event.text);
            if (process.platform === 'darwin') {
              await keyboard.pressKey(Key.LeftCmd, Key.V);
              await keyboard.releaseKey(Key.LeftCmd, Key.V);
            } else {
              await keyboard.pressKey(Key.LeftControl, Key.V);
              await keyboard.releaseKey(Key.LeftControl, Key.V);
            }
          }
          break;

        case 'key-tap':
          if (event.text) {
            await keyboard.type(event.text);
          }
          break;
      }

      return true;
    } catch (err) {
      console.error('[Input IPC] Native simulation error:', err);
      return false;
    }
  });

  ipcMain.handle('input:read-clipboard', async (): Promise<string> => {
    return clipboard.readText();
  });

  ipcMain.handle('input:write-clipboard', async (_, text: string): Promise<boolean> => {
    clipboard.writeText(text);
    return true;
  });
}
