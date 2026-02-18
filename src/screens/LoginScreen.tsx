import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight } from '../constants/dimensions';
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
    if (!identifier) e.identifier = 'Please enter your phone number or email';
    if (!password) e.password = 'Please enter your password';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    const result = await login(identifier, password);
    setLoading(false);
    if (!result.success) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLocked(true);
        Alert.alert('Account locked', 'Too many failed attempts. Please try again in 15 minutes.');
      } else {
        setErrors({ general: "That doesn't match our records. Please try again." });
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>{'\u2039'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>Welcome back</Text>
        <Text style={styles.subheadline}>Sign in with your email and password</Text>

        {errors.general && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        )}

        <View style={styles.formCard}>
          <Input
            label="Phone or Email"
            value={identifier}
            onChangeText={setIdentifier}
            error={errors.identifier}
            autoCapitalize="none"
            placeholder="Enter phone number or email"
            containerStyle={styles.cardInput}
          />
          <View style={styles.cardDivider} />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            showPasswordToggle
            autoCapitalize="none"
            placeholder="Your password"
            containerStyle={styles.cardInput}
          />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotRow}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <Button
          title="Sign In"
          onPress={handleLogin}
          variant="primary"
          loading={loading}
          disabled={locked}
          style={styles.loginButton}
        />

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  navBar: {
    paddingHorizontal: spacing['6'],
    paddingTop: 56,
    paddingBottom: spacing['2'],
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -spacing['2'] },
  backIcon: { fontSize: 28, color: colors.text.primary },

  content: { paddingHorizontal: spacing['6'] },

  headline: {
    fontSize: 30,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    lineHeight: 38,
    letterSpacing: -0.3,
    marginTop: spacing['8'],
  },
  subheadline: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 24,
    marginTop: spacing['1'],
    marginBottom: spacing['6'],
  },

  errorBanner: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    padding: spacing['4'],
    marginBottom: spacing['4'],
  },
  errorBannerText: { fontSize: 14, color: colors.error, textAlign: 'center' },

  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['4'],
    marginBottom: spacing['3'],
  },
  cardInput: { marginBottom: 0 },
  cardDivider: { height: 1, backgroundColor: colors.border.subtle, marginVertical: spacing['3'] },

  forgotRow: { alignSelf: 'flex-end', marginBottom: spacing['6'], paddingVertical: spacing['1'] },
  forgotText: { fontSize: 13, color: colors.accent.text, fontWeight: fontWeight.medium },

  loginButton: { marginBottom: spacing['4'] },

  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing['6'] },
  registerText: { fontSize: 14, color: colors.text.secondary },
  registerLink: { fontSize: 14, color: colors.accent.text, fontWeight: fontWeight.semibold },
});
