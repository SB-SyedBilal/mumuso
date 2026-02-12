import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import { maskPhoneNumber } from '../utils';
import Button from '../components/Button';

interface OTPVerificationScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OTPVerification'>;
}

export default function OTPVerificationScreen({ navigation }: OTPVerificationScreenProps) {
  const route = useRoute<RouteProp<RootStackParamList, 'OTPVerification'>>();
  const { verifyOTP } = useAuth();
  const { phone_number } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(59);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '')) handleVerify(newOtp.join(''));
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleVerify = async (code?: string) => {
    if (locked) return;
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) { Alert.alert('Error', 'Please enter all 6 digits'); return; }
    setLoading(true);
    const result = await verifyOTP(otpCode);
    setLoading(false);
    if (!result.success) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) { setLocked(true); Alert.alert('Locked', 'Too many failed attempts. Please try again in 5 minutes.'); }
      else Alert.alert('Invalid OTP', result.error || 'Please try again');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = () => {
    // NOT SUPPORTED YET: Real OTP resend via SMS provider.
    setCountdown(59);
    setOtp(['', '', '', '', '', '']);
    Alert.alert('OTP Sent', 'A new verification code has been sent to your phone.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Phone</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to{'\n'}{maskPhoneNumber(phone_number)}</Text>
        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={ref => inputRefs.current[i] = ref}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null, locked && styles.otpBoxLocked]}
              value={digit}
              onChangeText={v => handleOtpChange(v.replace(/[^0-9]/g, ''), i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!locked}
              selectTextOnFocus
            />
          ))}
        </View>
        {locked && <Text style={styles.lockedText}>Too many attempts. Try again in 5 minutes.</Text>}
        <Button title="Verify" onPress={() => handleVerify()} variant="primary" size="large" loading={loading} disabled={locked || otp.some(d => !d)} style={styles.verifyButton} />
        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>Resend code in {countdown}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}><Text style={styles.resendText}>Resend Code</Text></TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { paddingHorizontal: spacing.lg, paddingTop: 50 },
  backText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl, alignItems: 'center' },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { fontSize: fontSize.md, color: colors.text.secondary, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xl },
  otpRow: { flexDirection: 'row', gap: spacing.sm + 2, marginBottom: spacing.xl },
  otpBox: { width: 48, height: 56, borderWidth: 2, borderColor: colors.neutral[200], borderRadius: borderRadius.md, textAlign: 'center', fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  otpBoxFilled: { borderColor: colors.primary[600], backgroundColor: colors.primary[50] },
  otpBoxLocked: { borderColor: colors.neutral[200], backgroundColor: colors.neutral[100] },
  lockedText: { fontSize: fontSize.sm, color: colors.error, marginBottom: spacing.md, textAlign: 'center' },
  verifyButton: { width: '100%', borderRadius: borderRadius.lg },
  resendRow: { marginTop: spacing.lg },
  countdownText: { fontSize: fontSize.md, color: colors.text.secondary },
  resendText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.bold },
});
