/**
 * Pillbox design tokens.
 *
 * Mirrors design-system/pillbox/MASTER.md exactly. Every colour, size, radius
 * and duration in the app comes from here — no component defines its own.
 * If something needs a value this file does not export, it goes in MASTER.md
 * first, then here, then into the component.
 *
 * Contrast note: every text/background pair below was computed, not estimated.
 * See MASTER.md §2.5 for the measured ratios. There is deliberately no third,
 * lighter text tone — one was tested at 4.37:1 on white and rejected.
 */

export type Scheme = 'light' | 'dark';

/* ------------------------------------------------------------------ colour */

export type Colors = {
  bg: string; surface: string; surfaceRaised: string; separator: string;
  text: string; textSecondary: string;
  primary: string; primaryPressed: string; primaryText: string;
  primaryTint: string; primaryOnTint: string; onPrimary: string;
  successText: string; successTint: string; successOnTint: string;
  dangerText: string; dangerTint: string; dangerOnTint: string;
  warningText: string; warningTint: string; warningOnTint: string;
  mutedText: string; mutedTint: string;
  material: string; scrim: string; onDanger: string;
  toastBg: string; toastText: string;
};

const light: Colors = {
  bg: '#F5F8F8',
  surface: '#FFFFFF',
  surfaceRaised: '#EDF2F2',
  separator: '#DDE4E4',
  text: '#0B1416',
  textSecondary: '#5B6C6E',

  primary: '#0F766E',
  primaryPressed: '#0B5C55',
  primaryText: '#0F766E',
  primaryTint: '#E4F0EF',
  primaryOnTint: '#0B5C55',
  onPrimary: '#FFFFFF',

  successText: '#15803D',
  successTint: '#E6F4EA',
  successOnTint: '#14652F',
  dangerText: '#B42318',
  dangerTint: '#FDECEA',
  dangerOnTint: '#912018',
  warningText: '#A15C07',
  warningTint: '#FBF1E2',
  warningOnTint: '#8A4E05',
  mutedText: '#5B6C6E',
  mutedTint: '#EDF2F2',

  material: 'rgba(247,250,250,0.94)',
  scrim: 'rgba(6,20,19,0.40)',
  onDanger: '#FFFFFF',
  toastBg: '#0B1416',
  toastText: '#F5F8F8',
};

const dark: Colors = {
  bg: '#0C1213',
  surface: '#161D1E',
  surfaceRaised: '#1F2829',
  separator: '#2C3839',
  text: '#ECF1F1',
  textSecondary: '#A2B1B2',

  // The fill stays the deep teal (white on it measures 5.47:1); only teal used
  // AS TEXT lifts. The bright tone is never a large fill — that is the neon
  // look MASTER.md §15 rules out.
  primary: '#0F766E',
  primaryPressed: '#0B5C55',
  primaryText: '#3DBFB2',
  primaryTint: '#10302E',
  primaryOnTint: '#5FD3C6',
  onPrimary: '#FFFFFF',

  successText: '#6EE7A0',
  successTint: '#16301F',
  successOnTint: '#6EE7A0',
  dangerText: '#FFA99C',
  dangerTint: '#3A1A16',
  dangerOnTint: '#FFA99C',
  warningText: '#EFBE7A',
  warningTint: '#332313',
  warningOnTint: '#EFBE7A',
  mutedText: '#A2B1B2',
  mutedTint: '#1F2829',

  material: 'rgba(20,27,28,0.94)',
  scrim: 'rgba(0,0,0,0.55)',
  onDanger: '#FFFFFF',
  toastBg: '#ECF1F1',
  toastText: '#0C1213',
};

export const colors = { light, dark };

/* ----------------------------------------------------------------- spacing */
/* 4pt grid. These are the only legal spacing values. */

export const space = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s7: 32,
  s8: 40,
  s9: 48,
  s10: 64,
} as const;

export const GUTTER = space.s5;

/* ------------------------------------------------------------------ radius */

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

/* -------------------------------------------------------------- typography */
/*
 * Sizes are in points. React Native scales them with the OS text-size setting
 * automatically (allowFontScaling defaults to true), so Dynamic Type needs no
 * extra machinery here — but every container must use minHeight, never height,
 * or the scaled text will clip. That rule is enforced throughout the app.
 */

export const type = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: -0.4 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.3 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '600', letterSpacing: -0.2 },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600', letterSpacing: -0.2 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.1 },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400', letterSpacing: 0 },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400', letterSpacing: 0 },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400', letterSpacing: 0 },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400', letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: 0.1 },
  tab: { fontSize: 11, lineHeight: 13, fontWeight: '500', letterSpacing: 0.1 },
} as const;

export type TypeToken = keyof typeof type;

/* ------------------------------------------------------------------- icons */

export const icon = { sm: 18, md: 24, lg: 26, xl: 32 } as const;

/* ------------------------------------------------------------------ motion */
/* Exit is always faster than enter. */

export const motion = {
  micro: 120,
  state: 200,
  enter: 280,
  exit: 200,
} as const;

/* ------------------------------------------------------------------ layout */

/** Minimum touch target, iOS. Non-negotiable — see MASTER.md §14. */
export const TARGET = 44;

/** Fixed scale for supply bars so medicines compare against each other. */
export const SUPPLY_SCALE_DAYS = 30;

/* --------------------------------------------------------------- elevation */
/*
 * Three shadows total, two of them for things that float above the app.
 * Cards and list groups get none — hierarchy comes from surface colour and
 * spacing. In dark mode shadows are invisible, so the sheet uses a hairline
 * and a lighter surface instead.
 */

export function shadows(scheme: Scheme) {
  if (scheme === 'dark') {
    return {
      sheet: { borderTopWidth: 1, borderTopColor: dark.separator },
      float: {},
    };
  }
  return {
    sheet: {
      shadowColor: '#061413',
      shadowOpacity: 0.16,
      shadowRadius: 32,
      shadowOffset: { width: 0, height: -8 },
      elevation: 16,
    },
    float: {
      shadowColor: '#061413',
      shadowOpacity: 0.1,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
  };
}
