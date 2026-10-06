import { Platform, type TextStyle } from 'react-native';

export const colors = {
  // Reference palette: sage 6D9773 · deep green 0C3B2E · tan BB8A52 · yellow FFBA00
  paper: '#EDF1EA',
  card: '#FFFFFF',
  surface: '#E1E7DE',
  hairline: '#D9DED6',
  ink: '#0C3B2E',
  ink2: '#4A5A52',
  ink3: '#86928B',
  green: '#0C3B2E',      // deep green: headers, dark surfaces, user bubble
  green2: '#14503F',
  sage: '#6D9773',       // primary actions, active states
  sageSoft: '#E4EDE5',
  greenSoft: '#E4EDE5',
  onGreen: '#FFFFFF',
  onGreenMuted: 'rgba(255,255,255,0.72)',
  brass: '#BB8A52',      // tan: citations, section numbers
  brassSoft: '#F3EADF',
  yellow: '#FFBA00',     // highlights, badges
  yellowSoft: '#FFF3CC',
  dark: '#0C3B2E',
  danger: '#B3261E',
  dangerSoft: '#FBEBE9',
  info: '#6D9773',
};

/** Noto Sans Bengali everywhere. */
export const fonts = {
  display: 'NotoSansBengali_700Bold',
  regular: 'NotoSansBengali_400Regular',
  medium: 'NotoSansBengali_500Medium',
  semibold: 'NotoSansBengali_600SemiBold',
  bold: 'NotoSansBengali_700Bold',
};

export const radius = { sm: 12, md: 16, lg: 22, xl: 28, pill: 999 };

export const shadow = {
  card: Platform.select<object>({
    ios: { shadowColor: '#0C3B2E', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } },
    android: { elevation: 1, shadowColor: '#0C3B2E' },
    default: {},
  }) as object,
  float: Platform.select<object>({
    ios: { shadowColor: '#2B2A26', shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } },
    android: { elevation: 6, shadowColor: '#2B2A26' },
    default: {},
  }) as object,
};

export const t = {
  display: { fontFamily: fonts.display, fontSize: 30, lineHeight: 42, color: colors.ink } as TextStyle,
  h1: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 32, color: colors.ink } as TextStyle,
  h2: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 26, color: colors.ink } as TextStyle,
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 27, color: colors.ink } as TextStyle,
  bodyMd: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 25, color: colors.ink } as TextStyle,
  bodySm: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.ink2 } as TextStyle,
  caption: { fontFamily: fonts.medium, fontSize: 12.5, lineHeight: 18, color: colors.ink3 } as TextStyle,
  label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 17, color: colors.ink3, letterSpacing: 0.4 } as TextStyle,
  button: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 } as TextStyle,
};
