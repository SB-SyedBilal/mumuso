/**
 * Mumuso V3 — "Quiet Luxury" Color System
 * Near-monochromatic. One warm accent — gold.
 * Gold appears only where it matters most.
 */

export const colors = {
    // Surfaces
    canvas: '#F5F3F0',
    surface: '#FFFFFF',
    surfaceRaised: '#FAFAF8',
    surfaceDark: '#1C1C1E',
    surfaceDarker: '#141416',

    // Text
    text: {
        primary: '#1A1A1A',
        secondary: '#6B6B6B',
        tertiary: '#9E9E9E',
        inverted: '#F0EDE8',
        invertedMuted: '#9E9B96',
    },

    // Accent — The Single Gold
    accent: {
        default: '#C8A96E',
        light: '#F0E4C8',
        dark: '#A07840',
        text: '#8B6430',
    },

    // Functional
    success: '#4A9B7F',
    successBg: '#EBF5F1',
    error: '#C0544A',
    errorBg: '#F7EDEC',
    warning: '#C08040',
    warningBg: '#F7F0E8',

    // Borders
    border: {
        subtle: '#E8E5E0',
        default: '#D4D0C8',
        strong: '#B0AA9E',
    },

    // Membership Card Gradient stops
    card: {
        gradientStart: '#1C1C1E',
        gradientMid: '#2C2A26',
        gradientEnd: '#1C1C1E',
    },

    // Tab bar / nav
    tabInactive: '#B0AA9E',
    tabActive: '#1A1A1A',
    tabActiveLabel: '#C8A96E',
};

export default colors;
