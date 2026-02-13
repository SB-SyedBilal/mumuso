import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'gold' | 'secondary' | 'text' | 'danger' | 'textGold';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function Button({
  title, onPress, variant = 'primary',
  loading = false, disabled = false, style, textStyle, icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getBgStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.text.primary, ...shadows.md };
      case 'gold':
        return { backgroundColor: colors.accent.default };
      case 'secondary':
        return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border.default };
      case 'danger':
        return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.error };
      case 'text':
      case 'textGold':
      default:
        return { backgroundColor: 'transparent' };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return { color: colors.text.inverted, fontSize: 15, fontWeight: fontWeight.semibold, letterSpacing: 0.01 };
      case 'gold':
        return { color: '#FFFFFF', fontSize: 15, fontWeight: fontWeight.semibold, letterSpacing: 0.02 };
      case 'secondary':
        return { color: colors.text.primary, fontSize: 15, fontWeight: fontWeight.medium };
      case 'danger':
        return { color: colors.error, fontSize: 15, fontWeight: fontWeight.medium };
      case 'textGold':
        return { color: colors.accent.text, fontSize: 14, fontWeight: fontWeight.medium };
      case 'text':
      default:
        return { color: colors.text.secondary, fontSize: 14, fontWeight: fontWeight.medium };
    }
  };

  const isTextVariant = variant === 'text' || variant === 'textGold';
  const spinnerColor = variant === 'primary' ? colors.accent.default
    : variant === 'gold' ? '#FFFFFF'
    : colors.accent.default;

  return (
    <TouchableOpacity
      style={[
        isTextVariant ? styles.textBase : styles.base,
        !isTextVariant && getBgStyle(),
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[getTextStyle(), isDisabled && !isTextVariant && styles.disabledText, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['6'],
  },
  textBase: {
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['1'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    marginRight: spacing['2'],
  },
  disabled: {
    opacity: 0.38,
  },
  disabledText: {
    opacity: 0.7,
  },
});
