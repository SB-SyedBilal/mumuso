import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title, onPress, variant = 'primary', size = 'medium',
  loading = false, disabled = false, style, textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    styles[`${variant}Bg`],
    styles[`${size}Size`],
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#ffffff' : colors.primary[600]} size="small" />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.md },
  primaryBg: { backgroundColor: colors.primary[600] },
  secondaryBg: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary[600] },
  textBg: { backgroundColor: 'transparent' },
  dangerBg: { backgroundColor: colors.error },
  smallSize: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  mediumSize: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  largeSize: { paddingVertical: spacing.md + 4, paddingHorizontal: spacing.xl },
  disabled: { opacity: 0.5 },
  baseText: { fontWeight: fontWeight.bold, textAlign: 'center' },
  primaryText: { color: '#ffffff', fontSize: fontSize.md },
  secondaryText: { color: colors.primary[600], fontSize: fontSize.md },
  textText: { color: colors.primary[600], fontSize: fontSize.md },
  dangerText: { color: '#ffffff', fontSize: fontSize.md },
  smallText: { fontSize: fontSize.sm },
  mediumText: { fontSize: fontSize.md },
  largeText: { fontSize: fontSize.lg },
  disabledText: { opacity: 0.7 },
} as any);
