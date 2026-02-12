import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { spacing, fontSize, fontWeight } from '../constants/dimensions';
import Button from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, message, actionTitle, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} variant="primary" size="small" style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, paddingVertical: spacing.xl * 2 },
  icon: { fontSize: 48, marginBottom: spacing.md },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary, textAlign: 'center', marginBottom: spacing.sm },
  message: { fontSize: fontSize.md, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  button: { marginTop: spacing.lg },
});
