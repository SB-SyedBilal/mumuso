import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import { formatCurrency, formatDate, getDaysRemaining } from '../utils';
import { MEMBERSHIP_FEE } from '../services/mockData';
import Button from '../components/Button';

const H = 24;

interface Props { navigation: NativeStackNavigationProp<RootStackParamList, 'RenewalScreen'>; }

export default function RenewalScreen({ navigation }: Props) {
  const { membership } = useAuth();
  const daysRemaining = membership ? getDaysRemaining(membership.expiry_date) : 0;
  const isExpired = membership?.status !== 'active' || daysRemaining <= 0;

  return (
    <View style={styles.screen}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backIcon}>{'\u2039'}</Text></TouchableOpacity>
        <Text style={styles.navTitle}>Renew</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.statusCircle, isExpired ? styles.expiredCircle : styles.warningCircle]}>
          <Text style={styles.statusIcon}>{isExpired ? '\u2717' : '\u23F0'}</Text>
        </View>

        <Text style={styles.headline}>{isExpired ? 'Membership expired' : 'Expiring soon'}</Text>
        {isExpired ? (
          <Text style={styles.subheadline}>Expired on {membership ? formatDate(membership.expiry_date) : 'N/A'}. Renew to continue saving 10%.</Text>
        ) : (
          <>
            <Text style={styles.countdown}>{daysRemaining} days</Text>
            <Text style={styles.subheadline}>Don't lose your benefits</Text>
          </>
        )}

        {/* What you'll miss */}
        <View style={styles.missCard}>
          <Text style={styles.missTitle}>{isExpired ? "What you're missing" : "What you'll lose"}</Text>
          {['10% discount on all purchases', 'Purchase history tracking', 'Member-only offers'].map((item, i) => (
            <View key={i} style={styles.missRow}>
              <Text style={styles.missX}>{'\u2717'}</Text>
              <Text style={styles.missText}>{item}</Text>
            </View>
          ))}
        </View>

        {membership && membership.total_savings > 0 && (
          <View style={styles.savingsCard}>
            <Text style={styles.savingsEyebrow}>SAVED THIS YEAR</Text>
            <Text style={styles.savingsAmount}>{formatCurrency(membership.total_savings)}</Text>
          </View>
        )}

        <Button title={`Renew \u2014 ${formatCurrency(MEMBERSHIP_FEE)}`} onPress={() => navigation.navigate('MembershipPurchase')} variant="gold" style={styles.renewBtn} />
        {!isExpired && <Button title="Remind me later" onPress={() => navigation.goBack()} variant="text" />}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: H, paddingTop: 56, paddingBottom: spacing['2'] },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: colors.text.primary },
  navTitle: { fontSize: 17, fontWeight: fontWeight.semibold, color: colors.text.primary },

  content: { alignItems: 'center', paddingHorizontal: H, paddingTop: spacing['8'] },

  statusCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing['6'] },
  expiredCircle: { backgroundColor: colors.errorBg },
  warningCircle: { backgroundColor: 'rgba(200,169,110,0.12)' },
  statusIcon: { fontSize: 32, color: colors.text.primary },

  headline: { fontSize: 26, fontWeight: fontWeight.semibold, color: colors.text.primary, textAlign: 'center', letterSpacing: -0.3 },
  countdown: { fontSize: 40, fontWeight: fontWeight.bold, color: colors.warning, marginTop: spacing['2'] },
  subheadline: { fontSize: 15, color: colors.text.secondary, textAlign: 'center', lineHeight: 24, marginTop: spacing['2'], marginBottom: spacing['6'] },

  missCard: { width: '100%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing['5'], ...shadows.card, marginBottom: spacing['4'] },
  missTitle: { fontSize: 15, fontWeight: fontWeight.semibold, color: colors.text.primary, marginBottom: spacing['4'] },
  missRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['3'], marginBottom: spacing['3'] },
  missX: { fontSize: 14, color: colors.error, fontWeight: fontWeight.bold },
  missText: { fontSize: 15, color: colors.text.secondary },

  savingsCard: {
    width: '100%',
    backgroundColor: 'rgba(200,169,110,0.08)',
    borderRadius: radius.xl,
    padding: spacing['5'],
    alignItems: 'center',
    marginBottom: spacing['6'],
    borderWidth: 1,
    borderColor: 'rgba(200,169,110,0.2)',
  },
  savingsEyebrow: { fontSize: 10, fontWeight: fontWeight.medium, color: colors.accent.text, letterSpacing: 10 * 0.14 },
  savingsAmount: { fontSize: 32, fontWeight: fontWeight.bold, color: colors.accent.text, marginTop: spacing['1'] },

  renewBtn: { width: '100%', marginBottom: spacing['3'] },
});
