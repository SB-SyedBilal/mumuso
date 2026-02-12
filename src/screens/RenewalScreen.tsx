import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import { formatCurrency, formatDate, getDaysRemaining } from '../utils';
import { MEMBERSHIP_FEE } from '../services/mockData';
import Card from '../components/Card';
import Button from '../components/Button';

interface Props { navigation: NativeStackNavigationProp<RootStackParamList, 'RenewalScreen'>; }

export default function RenewalScreen({ navigation }: Props) {
  const { membership } = useAuth();
  const daysRemaining = membership ? getDaysRemaining(membership.expiry_date) : 0;
  const isExpired = membership?.status !== 'active' || daysRemaining <= 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>{'\u2190'} Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Renew Membership</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.iconCircle, isExpired ? { backgroundColor: '#FEE2E2' } : { backgroundColor: '#FEF3C7' }]}>
          <Text style={{ fontSize: 36 }}>{isExpired ? '\u{23F0}' : '\u{1F4C5}'}</Text>
        </View>
        <Text style={styles.title}>{isExpired ? 'Your Membership Has Expired' : 'Your Membership Expires Soon'}</Text>
        {isExpired ? (
          <Text style={styles.subtitle}>Expired on {membership ? formatDate(membership.expiry_date) : 'N/A'}. Renew now to continue saving 10%.</Text>
        ) : (
          <><Text style={styles.countdown}>{daysRemaining} days remaining</Text><Text style={styles.subtitle}>Don't lose your benefits!</Text></>
        )}
        <Card style={styles.missCard} variant="outlined">
          <Text style={styles.missTitle}>{isExpired ? "What you're missing:" : "What you'll miss:"}</Text>
          {['10% discount on all purchases', 'Purchase history tracking', 'Member-only offers'].map((item, i) => (
            <View key={i} style={styles.missRow}><Text style={{ color: colors.error, fontWeight: fontWeight.bold }}>{'\u2717'}</Text><Text style={styles.missText}>{item}</Text></View>
          ))}
        </Card>
        {membership && membership.total_savings > 0 && (
          <Card style={styles.savingsCard} variant="elevated">
            <Text style={styles.savingsTitle}>Your Savings This Year</Text>
            <Text style={styles.savingsAmount}>{formatCurrency(membership.total_savings)}</Text>
          </Card>
        )}
        <Button title={`Renew Membership - ${formatCurrency(MEMBERSHIP_FEE)}`} onPress={() => navigation.navigate('MembershipPurchase')} variant="primary" size="large" style={styles.renewBtn} />
        {!isExpired && <Button title="Remind Me Later" onPress={() => navigation.goBack()} variant="text" size="medium" />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  backText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  content: { alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xl },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary, textAlign: 'center', marginBottom: spacing.sm },
  countdown: { fontSize: 32, fontWeight: fontWeight.bold, color: '#D97706', marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.md, color: colors.text.secondary, textAlign: 'center', lineHeight: 24, marginBottom: spacing.lg },
  missCard: { width: '100%', marginBottom: spacing.lg },
  missTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.md },
  missRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  missText: { fontSize: fontSize.md, color: colors.text.secondary },
  savingsCard: { width: '100%', alignItems: 'center', marginBottom: spacing.lg, backgroundColor: '#D1FAE5' },
  savingsTitle: { fontSize: fontSize.sm, color: '#065F46', fontWeight: fontWeight.semibold },
  savingsAmount: { fontSize: 32, fontWeight: fontWeight.bold, color: '#065F46', marginVertical: spacing.sm },
  renewBtn: { width: '100%', borderRadius: borderRadius.lg, marginBottom: spacing.md },
});
