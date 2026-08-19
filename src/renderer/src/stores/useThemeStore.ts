import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light' | 'system';
export type EffectiveTheme = 'dark' | 'light';

interface ThemeState {
  theme: ThemeMode;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: ThemeMode) => void;
  initTheme: () => void;
}

const STORAGE_KEY = 'zerohop_theme_preference';

const getStoredTheme = (): ThemeMode => {
  try {
    if (typeof localStorage !== 'undefined') {
      return (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'dark';
    }
  } catch {}
  return 'dark';
};

const setStoredTheme = (theme: ThemeMode): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  } catch {}
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  effectiveTheme: 'dark',

  setTheme: (theme: ThemeMode) => {
    setStoredTheme(theme);
    const effectiveTheme = resolveEffectiveTheme(theme);
    applyThemeToDOM(effectiveTheme);
    set({ theme, effectiveTheme });
  },

  initTheme: () => {
    const saved = getStoredTheme();
    const effectiveTheme = resolveEffectiveTheme(saved);
    applyThemeToDOM(effectiveTheme);
    set({ theme: saved, effectiveTheme });

    // Listen for OS system theme changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        if (get().theme === 'system') {
          const newEffective = e.matches ? 'dark' : 'light';
          applyThemeToDOM(newEffective);
          set({ effectiveTheme: newEffective });
        }
      };

      mediaQuery.addEventListener('change', listener);
    }
  }
}));

export function resolveEffectiveTheme(theme: ThemeMode): EffectiveTheme {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }
  return theme;
}

export function applyThemeToDOM(effectiveTheme: EffectiveTheme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (!root) return;

  if (effectiveTheme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }
}
