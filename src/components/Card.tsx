import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';
import { spacing, radius, shadows } from '../constants/dimensions';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'flat';
  style?: ViewStyle;
}

export default function Card({ children, variant = 'default', style }: CardProps) {
  return (
    <View style={[styles.base, variantStyles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: spacing['6'],
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
});

const variantStyles: Record<string, ViewStyle> = {
  default: {
    ...shadows.card,
  },
  elevated: {
    ...shadows.md,
  },
  flat: {
    backgroundColor: colors.surfaceRaised,
  },
};
