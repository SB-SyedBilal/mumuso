import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { validatePassword } from '../utils';
import Button from '../components/Button';
import Input from '../components/Input';

interface Props { navigation: NativeStackNavigationProp<RootStackParamList, 'ChangePassword'>; }

export default function ChangePasswordScreen({ navigation }: Props) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = async () => {
    const e: Record<string, string> = {};
    if (!currentPassword) e.currentPassword = 'Current password is required';
    const pw = validatePassword(newPassword);
    if (!pw.valid) e.newPassword = 'Missing: ' + pw.errors.join(', ');
    if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (currentPassword === newPassword && currentPassword) e.newPassword = 'New password must be different';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    Alert.alert('Success', 'Your password has been changed successfully.');
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>{'\u2190'} Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="Current Password" required placeholder="Enter current password" value={currentPassword} onChangeText={setCurrentPassword} error={errors.currentPassword} secureTextEntry showPasswordToggle autoCapitalize="none" />
        <Input label="New Password" required placeholder="Enter new password" value={newPassword} onChangeText={setNewPassword} error={errors.newPassword} secureTextEntry showPasswordToggle autoCapitalize="none" hint="Min 8 chars, 1 uppercase, 1 lowercase, 1 number" />
        <Input label="Confirm New Password" required placeholder="Re-enter new password" value={confirmPassword} onChangeText={setConfirmPassword} error={errors.confirmPassword} secureTextEntry showPasswordToggle autoCapitalize="none" />
        <Button title="Change Password" onPress={handleChange} variant="primary" size="large" loading={loading} style={{ marginTop: spacing.lg, borderRadius: borderRadius.lg }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  backText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
});
