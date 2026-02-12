import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, TextInputProps, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';

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
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <View style={[styles.inputWrapper, isFocused && styles.focused, error ? styles.errorBorder : null]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.neutral[400]}
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
  container: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.xs + 2 },
  required: { color: colors.error },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.neutral[200], borderRadius: borderRadius.md,
    backgroundColor: '#ffffff',
  },
  focused: { borderColor: colors.primary[600], borderWidth: 2 },
  errorBorder: { borderColor: colors.error, borderWidth: 2 },
  input: { flex: 1, paddingVertical: spacing.md - 4, paddingHorizontal: spacing.md, fontSize: fontSize.md, color: colors.text.primary },
  toggle: { paddingHorizontal: spacing.md },
  toggleText: { fontSize: fontSize.sm, color: colors.primary[600], fontWeight: fontWeight.semibold },
  error: { fontSize: fontSize.xs, color: colors.error, marginTop: spacing.xs },
  hint: { fontSize: fontSize.xs, color: colors.text.secondary, marginTop: spacing.xs },
});
