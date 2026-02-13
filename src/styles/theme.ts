/**
 * Mumuso V3 — Global Theme
 * "Quiet Luxury" design system
 */

import { colors } from '../constants/colors';
import { spacing, radius, typeScale, fontWeight, shadows, motion } from '../constants/dimensions';

export const theme = {
    colors,
    spacing,
    radius,
    typeScale,
    fontWeight,
    shadows,
    motion,
};

export type Theme = typeof theme;

export default theme;
