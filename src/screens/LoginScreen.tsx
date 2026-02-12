import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async () => {
    if (locked) return;
    const e: Record<string, string> = {};
    if (!identifier) e.identifier = 'Phone number or email is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    const result = await login(identifier, password);
    setLoading(false);
    if (!result.success) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) { setLocked(true); Alert.alert('Account Locked', 'Too many failed attempts. Please try again in 15 minutes.'); }
      else setErrors({ general: result.error || 'Invalid credentials' });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to access your membership</Text>
        {errors.general && <Text style={styles.generalError}>{errors.general}</Text>}
        <Input label="Phone Number or Email" required value={identifier} onChangeText={setIdentifier} error={errors.identifier} autoCapitalize="none" placeholder="Enter phone or email" />
        <Input label="Password" required value={password} onChangeText={setPassword} error={errors.password} secureTextEntry showPasswordToggle autoCapitalize="none" placeholder="Enter your password" />
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotRow}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
        <Button title="Login" onPress={handleLogin} variant="primary" size="large" loading={loading} disabled={locked} style={styles.loginButton} />
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { paddingHorizontal: spacing.lg, paddingTop: 50 },
  backText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.md, color: colors.text.secondary, marginBottom: spacing.xl },
  generalError: { backgroundColor: '#FEE2E2', color: colors.error, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md, fontSize: fontSize.sm, textAlign: 'center' },
  forgotRow: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  forgotText: { fontSize: fontSize.sm, color: colors.primary[600], fontWeight: fontWeight.semibold },
  loginButton: { borderRadius: borderRadius.lg },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  registerText: { fontSize: fontSize.md, color: colors.text.secondary },
  registerLink: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.bold },
});
