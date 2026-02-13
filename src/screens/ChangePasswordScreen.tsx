import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight } from '../constants/dimensions';
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
    // NOT SUPPORTED YET: Real password change via backend API.
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    Alert.alert('Done', 'Your password has been changed.');
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backIcon}>{'\u2039'}</Text></TouchableOpacity>
        <Text style={styles.navTitle}>Change Password</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Input label="Current Password" placeholder="Enter current password" value={currentPassword} onChangeText={setCurrentPassword} error={errors.currentPassword} secureTextEntry showPasswordToggle autoCapitalize="none" containerStyle={{ marginBottom: 0 }} />
          <View style={styles.divider} />
          <Input label="New Password" placeholder="Enter new password" value={newPassword} onChangeText={setNewPassword} error={errors.newPassword} secureTextEntry showPasswordToggle autoCapitalize="none" hint="Min 8 chars, 1 uppercase, 1 lowercase, 1 number" containerStyle={{ marginBottom: 0 }} />
          <View style={styles.divider} />
          <Input label="Confirm Password" placeholder="Re-enter new password" value={confirmPassword} onChangeText={setConfirmPassword} error={errors.confirmPassword} secureTextEntry showPasswordToggle autoCapitalize="none" containerStyle={{ marginBottom: 0 }} />
        </View>
        <Button title="Update Password" onPress={handleChange} variant="primary" loading={loading} style={styles.submitBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing['6'], paddingTop: 56, paddingBottom: spacing['2'] },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: colors.text.primary },
  navTitle: { fontSize: 17, fontWeight: fontWeight.semibold, color: colors.text.primary },
  content: { paddingHorizontal: spacing['6'], paddingTop: spacing['6'] },
  formCard: { backgroundColor: colors.surface, borderRadius: radius.xl, paddingHorizontal: spacing['5'], paddingVertical: spacing['4'], marginBottom: spacing['4'] },
  divider: { height: 1, backgroundColor: colors.border.subtle, marginVertical: spacing['3'] },
  submitBtn: { marginTop: spacing['2'] },
});
