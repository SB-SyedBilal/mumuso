import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import { formatCurrency } from '../utils';
import Button from '../components/Button';

interface PaymentProcessingScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PaymentProcessing'>;
}

export default function PaymentProcessingScreen({ navigation }: PaymentProcessingScreenProps) {
  const route = useRoute<RouteProp<RootStackParamList, 'PaymentProcessing'>>();
  const { refreshDashboard } = useAuth();
  const { method, amount, payment_id, gateway_token } = route.params;
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');

  useEffect(() => {
    processPayment();
  }, []);

  const processPayment = async () => {
    // NOTE: Real payment processing happens via Safepay gateway.
    // The backend creates the order and returns a gateway_token.
    // In production, user would be redirected to Safepay payment page.
    // Safepay webhook notifies backend when payment completes.
    // For now, simulate success after delay.
    setStatus('processing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    // In real flow, we'd poll backend or wait for webhook notification
    await refreshDashboard();
    setStatus('success');
    setTimeout(() => navigation.replace('MembershipSuccess'), 1500);
  };

  return (
    <View style={styles.screen}>
      {status === 'processing' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent.default} />
          <Text style={styles.headline}>Processing payment</Text>
          <Text style={styles.body}>Please wait while we process your payment of {formatCurrency(amount)}</Text>
          <Text style={styles.warning}>Do not close the app</Text>
        </View>
      )}
      {status === 'success' && (
        <View style={styles.center}>
          <View style={styles.successCircle}><Text style={styles.circleIcon}>{'\u2713'}</Text></View>
          <Text style={styles.headline}>Payment successful</Text>
          <Text style={styles.body}>Redirecting to your membership...</Text>
        </View>
      )}
      {status === 'failed' && (
        <View style={styles.center}>
          <View style={styles.failCircle}><Text style={styles.circleIcon}>{'\u2717'}</Text></View>
          <Text style={styles.headline}>Payment failed</Text>
          <Text style={styles.body}>Something went wrong. Please try again.</Text>
          <Button title="Retry" onPress={processPayment} variant="primary" style={styles.button} />
          <Button title="Change method" onPress={() => navigation.goBack()} variant="secondary" style={styles.button} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing['6'] },
  headline: { fontSize: 24, fontWeight: fontWeight.semibold, color: colors.text.primary, marginTop: spacing['6'], textAlign: 'center' },
  body: { fontSize: 15, color: colors.text.secondary, textAlign: 'center', marginTop: spacing['2'], lineHeight: 24 },
  warning: { fontSize: 13, color: colors.text.tertiary, marginTop: spacing['6'] },
  successCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(74,155,127,0.12)', alignItems: 'center', justifyContent: 'center' },
  failCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.errorBg, alignItems: 'center', justifyContent: 'center' },
  circleIcon: { fontSize: 36, color: colors.text.primary, fontWeight: fontWeight.bold },
  button: { marginTop: spacing['3'], width: '100%' },
});
