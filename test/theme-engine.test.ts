import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore, resolveEffectiveTheme } from '../src/renderer/src/stores/useThemeStore';

describe('Centralized Theme Engine Exhaustive Suite', () => {
  let mockStorage: Record<string, string> = {};
  let mockClassList: Set<string> = new Set();
  let mockAttributes: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    mockClassList = new Set();
    mockAttributes = {};

    global.localStorage = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => delete mockStorage[key]),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
      length: 0,
      key: vi.fn()
    };

    global.document = {
      documentElement: {
        classList: {
          add: vi.fn((cls: string) => mockClassList.add(cls)),
          remove: vi.fn((cls: string) => mockClassList.delete(cls)),
          contains: vi.fn((cls: string) => mockClassList.has(cls))
        },
        setAttribute: vi.fn((attr: string, val: string) => {
          mockAttributes[attr] = val;
        }),
        getAttribute: vi.fn((attr: string) => mockAttributes[attr] || null),
        removeAttribute: vi.fn((attr: string) => delete mockAttributes[attr]),
        style: {}
      }
    } as any;
  });

  it('should default to dark theme and apply dark classes to DOM', () => {
    useThemeStore.getState().initTheme();

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(useThemeStore.getState().effectiveTheme).toBe('dark');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('should switch to light theme, persist to localStorage, and update DOM classes', () => {
    useThemeStore.getState().setTheme('light');

    expect(useThemeStore.getState().theme).toBe('light');
    expect(useThemeStore.getState().effectiveTheme).toBe('light');
    expect(mockStorage['zerohop_theme_preference']).toBe('light');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('light');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
  });

  it('should resolve system theme based on matchMedia query', () => {
    global.window = {
      matchMedia: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('dark'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }))
    } as any;

    expect(resolveEffectiveTheme('system')).toBe('dark');
    expect(resolveEffectiveTheme('light')).toBe('light');
    expect(resolveEffectiveTheme('dark')).toBe('dark');
  });
});
