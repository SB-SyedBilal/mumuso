/**
 * Mumuso V3 — Design System Dimensions
 * 8pt base grid. All values are multiples of 4 or 8.
 */

export const spacing = {
    '1': 4,
    '2': 8,
    '3': 12,
    '4': 16,
    '5': 20,
    '6': 24,
    '8': 32,
    '10': 40,
    '12': 48,
    '16': 64,
};

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
};

// V3 Type Scale
export const typeScale = {
    display:    { size: 48, lineHeight: 56, weight: '700' as const, letterSpacing: -0.02 },
    displaySm:  { size: 36, lineHeight: 44, weight: '600' as const, letterSpacing: -0.01 },
    h1:         { size: 30, lineHeight: 38, weight: '600' as const, letterSpacing: -0.01 },
    h2:         { size: 24, lineHeight: 32, weight: '600' as const, letterSpacing: 0 },
    h3:         { size: 20, lineHeight: 28, weight: '500' as const, letterSpacing: 0 },
    h4:         { size: 17, lineHeight: 24, weight: '500' as const, letterSpacing: 0 },
    bodyLg:     { size: 16, lineHeight: 26, weight: '400' as const, letterSpacing: 0 },
    bodyMd:     { size: 14, lineHeight: 22, weight: '400' as const, letterSpacing: 0 },
    bodySm:     { size: 13, lineHeight: 20, weight: '400' as const, letterSpacing: 0 },
    caption:    { size: 12, lineHeight: 18, weight: '400' as const, letterSpacing: 0 },
    label:      { size: 11, lineHeight: 14, weight: '500' as const, letterSpacing: 0.08 },
    mono:       { size: 14, lineHeight: 22, weight: '400' as const, letterSpacing: 0 },
    monoSm:     { size: 12, lineHeight: 18, weight: '400' as const, letterSpacing: 0 },
};

export const fontWeight = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};

// V3 Shadow System (React Native)
export const shadows = {
    xs: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 5,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.10,
        shadowRadius: 32,
        elevation: 8,
    },
    membership: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.28,
        shadowRadius: 40,
        elevation: 12,
    },
};

// V3 Motion Tokens
export const motion = {
    duration: {
        instant: 0,
        fast: 150,
        normal: 250,
        smooth: 350,
        deliberate: 500,
        slow: 700,
    },
};

export default {
    spacing,
    radius,
    typeScale,
    fontWeight,
    shadows,
    motion,
};
