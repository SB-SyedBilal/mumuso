import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';

interface ForgotPasswordScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!identifier) { Alert.alert('Error', 'Please enter your phone number or email'); return; }
    setLoading(true);
    // NOT SUPPORTED YET: Real password reset via backend API.
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <Text style={styles.successIcon}>{'\u2709'}</Text>
          <Text style={styles.successTitle}>Reset Link Sent!</Text>
          <Text style={styles.successText}>We've sent a password reset link to your registered email/phone. Please check and follow the instructions.</Text>
          <Button title="Back to Login" onPress={() => navigation.navigate('Login')} variant="primary" size="large" style={styles.button} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>Enter your registered phone number or email and we'll send you a reset link.</Text>
        <Input label="Phone Number or Email" required value={identifier} onChangeText={setIdentifier} autoCapitalize="none" placeholder="Enter phone or email" />
        <Button title="Send Reset Link" onPress={handleSend} variant="primary" size="large" loading={loading} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { paddingHorizontal: spacing.lg, paddingTop: 50 },
  backText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { fontSize: fontSize.md, color: colors.text.secondary, lineHeight: 24, marginBottom: spacing.xl },
  button: { marginTop: spacing.md, borderRadius: borderRadius.lg },
  successContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  successIcon: { fontSize: 64, marginBottom: spacing.lg },
  successTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.md },
  successText: { fontSize: fontSize.md, color: colors.text.secondary, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xl },
});
