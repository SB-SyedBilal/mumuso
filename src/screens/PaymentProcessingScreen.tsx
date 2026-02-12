import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import { formatCurrency } from '../utils';
import Button from '../components/Button';

interface PaymentProcessingScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PaymentProcessing'>;
}

export default function PaymentProcessingScreen({ navigation }: PaymentProcessingScreenProps) {
  const route = useRoute<RouteProp<RootStackParamList, 'PaymentProcessing'>>();
  const { purchaseMembership } = useAuth();
  const { method, amount } = route.params;
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');

  useEffect(() => {
    processPayment();
  }, []);

  const processPayment = async () => {
    // NOT SUPPORTED YET: Real payment processing via JazzCash/EasyPaisa/Stripe/Bank APIs.
    setStatus('processing');
    const result = await purchaseMembership(method);
    setStatus(result.success ? 'success' : 'failed');
    if (result.success) {
      setTimeout(() => navigation.replace('MembershipSuccess'), 1500);
    }
  };

  return (
    <View style={styles.container}>
      {status === 'processing' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.title}>Processing Payment</Text>
          <Text style={styles.subtitle}>Please wait while we process your payment of {formatCurrency(amount)}...</Text>
          <Text style={styles.warning}>Do not close the app or press back</Text>
        </View>
      )}
      {status === 'success' && (
        <View style={styles.center}>
          <Text style={styles.successIcon}>{'\u2713'}</Text>
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>Redirecting to your membership...</Text>
        </View>
      )}
      {status === 'failed' && (
        <View style={styles.center}>
          <Text style={styles.failIcon}>{'\u2717'}</Text>
          <Text style={styles.title}>Payment Failed</Text>
          <Text style={styles.subtitle}>Something went wrong. Please try again.</Text>
          <Button title="Retry Payment" onPress={processPayment} variant="primary" size="large" style={styles.button} />
          <Button title="Change Payment Method" onPress={() => navigation.goBack()} variant="secondary" size="medium" style={styles.button} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary, marginTop: spacing.lg, textAlign: 'center' },
  subtitle: { fontSize: fontSize.md, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 24 },
  warning: { fontSize: fontSize.sm, color: colors.error, marginTop: spacing.lg, fontWeight: fontWeight.medium },
  successIcon: { fontSize: 64, color: colors.success, backgroundColor: '#D1FAE5', width: 100, height: 100, borderRadius: 50, textAlign: 'center', lineHeight: 100 },
  failIcon: { fontSize: 64, color: colors.error, backgroundColor: '#FEE2E2', width: 100, height: 100, borderRadius: 50, textAlign: 'center', lineHeight: 100 },
  button: { marginTop: spacing.md, width: '100%', borderRadius: borderRadius.lg },
});
