import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import { formatDate, formatCurrency } from '../utils';
import Button from '../components/Button';

const H = 24;

interface MembershipSuccessScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MembershipSuccess'>;
}

export default function MembershipSuccessScreen({ navigation }: MembershipSuccessScreenProps) {
  const { dashboard } = useAuth();
  const daysRemaining = dashboard?.days_remaining || 365;

  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('MainTabs'), 10000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Success icon */}
      <View style={styles.checkCircle}>
        <Ionicons name="checkmark" size={40} color="#FFFFFF" />
      </View>

      <Text style={styles.headline}>Welcome to Mumuso</Text>
      <Text style={styles.subheadline}>Your membership is now active</Text>

      {/* Card preview */}
      <View style={styles.cardPreview}>
        <Text style={styles.cardLabel}>MUMUSO MEMBER</Text>
        <Text style={styles.cardId}>{dashboard?.member_id || 'MUM-XXXXX'}</Text>
      </View>

      {/* Details */}
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Member Since</Text>
          <Text style={styles.detailValue}>{dashboard?.membership?.activated_at ? formatDate(dashboard.membership.activated_at) : 'Today'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Valid Until</Text>
          <Text style={styles.detailValue}>{dashboard?.expiry_date ? formatDate(dashboard.expiry_date) : 'N/A'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount Paid</Text>
          <Text style={styles.detailValue}>{formatCurrency(2000)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Discount</Text>
          <Text style={styles.detailValueGold}>10% on all purchases</Text>
        </View>
      </View>

      {/* Next steps */}
      <Text style={styles.stepsLabel}>NEXT STEPS</Text>
      {['Visit any Mumuso store', 'Show your QR code at checkout', 'Enjoy 10% off instantly'].map((step, i) => (
        <View key={i} style={styles.stepRow}>
          <View style={styles.stepCircle}><Text style={styles.stepNum}>{i + 1}</Text></View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}

      <Button title="Go to Home" onPress={() => navigation.replace('MainTabs')} variant="primary" style={styles.homeButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { alignItems: 'center', paddingHorizontal: H, paddingTop: 80, paddingBottom: 40 },

  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['6'],
  },
  checkMark: { fontSize: 32, color: '#FFFFFF', fontWeight: fontWeight.bold },

  headline: {
    fontSize: 30,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subheadline: {
    fontSize: 15,
    color: colors.success,
    fontWeight: fontWeight.medium,
    marginTop: spacing['2'],
    marginBottom: spacing['8'],
  },

  cardPreview: {
    width: '100%',
    backgroundColor: colors.surfaceDark,
    borderRadius: radius['2xl'],
    padding: spacing['6'],
    alignItems: 'center',
    marginBottom: spacing['6'],
    ...shadows.membership,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: fontWeight.medium,
    color: colors.text.invertedMuted,
    letterSpacing: 10 * 0.14,
    marginBottom: spacing['2'],
  },
  cardId: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: colors.text.inverted,
    letterSpacing: 2,
  },

  detailsCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing['5'],
    ...shadows.card,
    marginBottom: spacing['8'],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
  detailLabel: { fontSize: 14, color: colors.text.tertiary },
  detailValue: { fontSize: 14, color: colors.text.primary, fontWeight: fontWeight.medium },
  detailValueGold: { fontSize: 14, color: colors.accent.text, fontWeight: fontWeight.semibold },
  divider: { height: 1, backgroundColor: colors.border.subtle },

  stepsLabel: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
    letterSpacing: 11 * 0.08,
    alignSelf: 'flex-start',
    marginBottom: spacing['4'],
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
    marginBottom: spacing['4'],
    alignSelf: 'flex-start',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { fontSize: 14, fontWeight: fontWeight.semibold, color: colors.text.primary },
  stepText: { fontSize: 15, color: colors.text.primary },

  homeButton: { width: '100%', marginTop: spacing['4'] },
});
