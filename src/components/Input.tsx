import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, TextInputProps, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight } from '../constants/dimensions';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  containerStyle?: ViewStyle;
}

export default function Input({
  label, error, hint, required, rightIcon, showPasswordToggle,
  containerStyle, secureTextEntry, ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[
          styles.label,
          isFocused && styles.labelFocused,
          error ? styles.labelError : null,
        ]}>
          {label.toUpperCase()}
        </Text>
      )}
      <View style={[
        styles.inputWrapper,
        isFocused && styles.focused,
        error ? styles.errorBorder : null,
      ]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.text.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !showPassword}
          {...rest}
        />
        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.toggle}>
            <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing['4'] },
  label: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
    letterSpacing: 11 * 0.08,
    marginBottom: spacing['2'],
  },
  labelFocused: { color: colors.text.primary },
  labelError: { color: colors.error },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  focused: {
    borderColor: colors.text.primary,
    borderWidth: 1.5,
  },
  errorBorder: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing['5'],
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: fontWeight.regular,
  },
  toggle: { paddingHorizontal: spacing['5'] },
  toggleText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing['1'],
  },
  hint: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing['1'],
  },
});
