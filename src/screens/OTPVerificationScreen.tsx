import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight } from '../constants/dimensions';
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
  const [hasError, setHasError] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const triggerShake = () => {
    setHasError(true);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => setHasError(false), 1500);
    });
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setHasError(false);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '')) handleVerify(newOtp.join(''));
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleVerify = async (code?: string) => {
    if (locked) return;
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) return;
    setLoading(true);
    const result = await verifyOTP(otpCode);
    setLoading(false);
    if (!result.success) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      triggerShake();
      if (newAttempts >= 3) {
        setLocked(true);
        Alert.alert('Too many attempts', 'Please wait 5 minutes before trying again.');
      }
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = () => {
    // NOT SUPPORTED YET: Real OTP resend via SMS provider.
    setCountdown(59);
    setOtp(['', '', '', '', '', '']);
    setHasError(false);
    Alert.alert('Code sent', 'A new verification code has been sent.');
  };

  const formattedCountdown = `${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`;

  return (
    <View style={styles.screen}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>{'\u2039'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.stepLabel}>STEP 2 OF 2</Text>
        <Text style={styles.headline}>Enter verification code</Text>
        <Text style={styles.subheadline}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phoneHighlight}>{maskPhoneNumber(phone_number)}</Text>
        </Text>

        {/* OTP Boxes */}
        <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={ref => inputRefs.current[i] = ref}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : null,
                hasError && styles.otpBoxError,
                locked && styles.otpBoxLocked,
              ]}
              value={digit}
              onChangeText={v => handleOtpChange(v.replace(/[^0-9]/g, ''), i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!locked}
              selectTextOnFocus
            />
          ))}
        </Animated.View>

        {hasError && !locked && (
          <Text style={styles.errorText}>That code isn't right. Please try again.</Text>
        )}
        {locked && (
          <Text style={styles.errorText}>Too many attempts. Please wait 5 minutes.</Text>
        )}

        <Button
          title="Verify"
          onPress={() => handleVerify()}
          variant="primary"
          loading={loading}
          disabled={locked || otp.some(d => !d)}
          style={styles.verifyButton}
        />

        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>Resend code in <Text style={styles.countdownBold}>{formattedCountdown}</Text></Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendText}>Resend code</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
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

  content: {
    flex: 1,
    paddingHorizontal: spacing['6'],
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: colors.accent.text,
    letterSpacing: 11 * 0.08,
    marginTop: spacing['8'],
    marginBottom: spacing['2'],
  },
  headline: {
    fontSize: 30,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    lineHeight: 38,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: spacing['3'],
  },
  subheadline: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing['10'],
  },
  phoneHighlight: {
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },

  otpRow: {
    flexDirection: 'row',
    gap: spacing['2'],
    marginBottom: spacing['6'],
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    borderRadius: radius.md,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    backgroundColor: colors.surface,
  },
  otpBoxFilled: {
    borderColor: colors.text.primary,
    backgroundColor: colors.surfaceRaised,
  },
  otpBoxError: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  otpBoxLocked: {
    borderColor: colors.border.subtle,
    backgroundColor: colors.surfaceRaised,
    opacity: 0.5,
  },

  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing['4'],
  },

  verifyButton: { width: '100%' },

  resendRow: { marginTop: spacing['6'] },
  countdownText: { fontSize: 14, color: colors.text.secondary },
  countdownBold: { fontWeight: fontWeight.semibold, color: colors.text.primary },
  resendText: { fontSize: 14, color: colors.accent.text, fontWeight: fontWeight.semibold },
});
