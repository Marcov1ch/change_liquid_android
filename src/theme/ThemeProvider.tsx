/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Preferences } from '@capacitor/preferences';
import { SystemBars, SystemBarsStyle } from '@capacitor/core';
import { resolveTheme, type ResolvedTheme, type ThemeMode } from './theme';

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'theme-mode';

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemDark, setSystemDark] = useState(systemPrefersDark);
  const resolved = resolveTheme(mode, systemDark);

  useEffect(() => {
    Preferences.get({ key: STORAGE_KEY })
      .then(({ value }) => {
        if (value === 'light' || value === 'dark' || value === 'system') {
          setModeState(value);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;

    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', resolved === 'dark' ? '#0E1216' : '#F4F6F8');

    SystemBars.setStyle({
      style: resolved === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
    }).catch(() => undefined);
  }, [resolved]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void Preferences.set({ key: STORAGE_KEY, value: next }).catch(() => undefined);
  }, []);

  const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
