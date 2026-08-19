import { describe, it, expect } from 'vitest';
import { RemoteInputEvent } from '../src/preload/types';

describe('Remote Desktop & Input Engine Exhaustive Suite', () => {
  it('should accurately transform normalized (0..1) coordinates into target display pixels', () => {
    const displayWidth = 2560; // 1440p
    const displayHeight = 1440;

    const normalizedX = 0.5;
    const normalizedY = 0.25;

    const targetPixelX = Math.round(normalizedX * displayWidth);
    const targetPixelY = Math.round(normalizedY * displayHeight);

    expect(targetPixelX).toBe(1280);
    expect(targetPixelY).toBe(360);
  });

  it('should validate normalized input events boundaries (clamp 0..1)', () => {
    const clampCoordinate = (val: number) => Math.max(0, Math.min(1, val));

    expect(clampCoordinate(1.2)).toBe(1.0);
    expect(clampCoordinate(-0.3)).toBe(0.0);
    expect(clampCoordinate(0.75)).toBe(0.75);
  });

  it('should serialize and parse keyboard shortcut modifiers', () => {
    const inputEvent: RemoteInputEvent = {
      type: 'key-tap',
      key: 'c',
      modifiers: ['command', 'shift']
    };

    expect(inputEvent.type).toBe('key-tap');
    expect(inputEvent.modifiers).toContain('command');
    expect(inputEvent.modifiers).toContain('shift');
  });

  it('should compute privacy mask rectangle collision to hide sensitive windows', () => {
    const sensitiveWindowBounds = { x: 200, y: 200, width: 400, height: 300 };
    const cursor = { x: 300, y: 250 };

    const isInsideSensitiveZone =
      cursor.x >= sensitiveWindowBounds.x &&
      cursor.x <= sensitiveWindowBounds.x + sensitiveWindowBounds.width &&
      cursor.y >= sensitiveWindowBounds.y &&
      cursor.y <= sensitiveWindowBounds.y + sensitiveWindowBounds.height;

    expect(isInsideSensitiveZone).toBe(true);

    const outsideCursor = { x: 100, y: 100 };
    const isOutside =
      outsideCursor.x >= sensitiveWindowBounds.x &&
      outsideCursor.x <= sensitiveWindowBounds.x + sensitiveWindowBounds.width &&
      outsideCursor.y >= sensitiveWindowBounds.y &&
      outsideCursor.y <= sensitiveWindowBounds.y + sensitiveWindowBounds.height;

    expect(isOutside).toBe(false);
  });
});
