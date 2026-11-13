/**
 * Mobile Apps - Prototyping Kit Design System (by Renata Pôrto)
 * Figma Node: 101-306
 *
 * Official Palette, Inter Typography Scale & Spacing System
 */
export const theme = {
  colors: {
    // 1. HIGHLIGHT / BRAND PALETTE (Electric Cobalt)
    primary: '#006FFD',          // ApplicationTheme.HighlightDarkest (Primary CTA)
    primaryDark: '#0058CB',
    primaryLight: '#2897FF',     // ApplicationTheme.HighlightDark
    primarySoft: '#EAF2FF',      // ApplicationTheme.HighlightLightest (Badges & Pills)
    accent: '#2897FF',

    // 2. SUPPORT & STATUS PALETTE
    success: '#298267',          // SupportSuccessDark
    successMedium: '#3AC0A0',
    successLight: '#E7F4E8',
    warning: '#E86339',          // SupportWarningDark
    warningMedium: '#FFB37C',
    warningLight: '#FFF4E4',
    danger: '#ED3241',           // SupportErrorDark
    dangerMedium: '#FF616D',
    dangerLight: '#FFE2E5',

    // 3. NEUTRAL SYSTEM PALETTE
    background: '#F8F9FE',       // NeutralLightest (Figma app canvas)
    card: '#FFFFFF',             // NeutralWhite (Elevated surface)
    surfaceSecondary: '#F0F2F7',
    text: '#1F2024',             // NeutralDarkest (High contrast headers & body)
    textSecondary: '#2F3036',    // NeutralDark
    textMuted: '#71727A',        // NeutralMedium (Captions & labels)
    textSubtle: '#8F9098',       // NeutralLight
    border: '#C5C6CC',           // NeutralLightMedium (Input & card outlines)
    borderLight: '#E8E9F1',      // NeutralLightLight
  },
  typography: {
    heading1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
    heading2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.4 },
    heading3: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
    heading4: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.2 },
    heading5: { fontSize: 16, fontWeight: '600' as const, letterSpacing: -0.1 },
    bodyXL: { fontSize: 18, fontWeight: '400' as const },
    bodyL: { fontSize: 16, fontWeight: '400' as const },
    bodyM: { fontSize: 14, fontWeight: '400' as const },
    bodyS: { fontSize: 12, fontWeight: '400' as const },
    bodyXS: { fontSize: 10, fontWeight: '400' as const },
    actionL: { fontSize: 16, fontWeight: '600' as const },
    actionM: { fontSize: 14, fontWeight: '600' as const },
    actionS: { fontSize: 12, fontWeight: '600' as const },
    captionM: { fontSize: 11, fontWeight: '500' as const },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
};
