import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';

import { Colors, Scheme, colors, shadows } from './tokens';

export * from './tokens';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeValue = {
  scheme: Scheme;
  c: Colors;
  shadow: ReturnType<typeof shadows>;
  /** True when the OS asks for reduced motion. Never ignore this. */
  reduceMotion: boolean;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({
  preference,
  children,
}: {
  preference: ThemePreference;
  children: React.ReactNode;
}) {
  const system = useColorScheme();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => mounted && setReduceMotion(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const value = useMemo<ThemeValue>(() => {
    const scheme: Scheme =
      preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
    return { scheme, c: colors[scheme], shadow: shadows(scheme), reduceMotion };
  }, [preference, system, reduceMotion]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const v = useContext(ThemeContext);
  if (!v) throw new Error('useTheme must be used inside <ThemeProvider>');
  return v;
}

/**
 * Duration that collapses to ~0 when the user has asked for reduced motion.
 * Feedback still happens — it just stops moving. Never return 0 for something
 * that conveys state; the user must still know the tap registered.
 */
export function useDuration(ms: number): number {
  const { reduceMotion } = useTheme();
  return reduceMotion ? 1 : ms;
}
