import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import { formatCurrency, formatDate, getDaysRemaining } from '../utils';
import { MOCK_TRANSACTIONS, MOCK_NOTIFICATIONS } from '../services/mockData';
import Card from '../components/Card';
import Button from '../components/Button';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, membership } = useAuth();
  const daysRemaining = membership ? getDaysRemaining(membership.expiry_date) : 0;
  const unreadNotifs = MOCK_NOTIFICATIONS.filter(n => !n.is_read).length;
  const recentTransactions = MOCK_TRANSACTIONS.slice(0, 3);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.full_name?.split(' ')[0] || 'Member'}!</Text>
          <Text style={styles.subGreeting}>Welcome back</Text>
        </View>
        <TouchableOpacity style={styles.notifButton} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.notifIcon}>{'\u{1F514}'}</Text>
          {unreadNotifs > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unreadNotifs}</Text></View>}
        </TouchableOpacity>
      </View>

      {daysRemaining <= 30 && daysRemaining > 0 && (
        <TouchableOpacity style={styles.renewBanner} onPress={() => navigation.navigate('RenewalScreen')}>
          <Text style={styles.renewText}>{'\u26A0'} Membership expires in {daysRemaining} days. Renew now!</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.memberCard} onPress={() => navigation.getParent()?.navigate('MyCard')}>
        <Text style={styles.cardBrand}>MUMUSO</Text>
        <Text style={styles.cardName}>{user?.full_name || 'Member'}</Text>
        <Text style={styles.cardId}>{membership?.member_id || 'MUM-XXXXX'}</Text>
        <View style={styles.cardBottom}>
          <Text style={styles.cardStatus}>{membership?.status === 'active' ? '\u2713 Active' : '\u2717 Expired'}</Text>
          <Text style={styles.cardExpiry}>Valid until {membership ? formatDate(membership.expiry_date) : 'N/A'}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(membership?.total_savings || 0)}</Text>
          <Text style={styles.statLabel}>Total Saved</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{membership?.total_purchases || 0}</Text>
          <Text style={styles.statLabel}>Purchases</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        {[
          { label: 'History', icon: '\u{1F4CB}', screen: 'History' },
          { label: 'Stores', icon: '\u{1F4CD}', screen: 'StoreLocator' },
          { label: 'Refer', icon: '\u{1F91D}', screen: 'ReferralScreen' },
          { label: 'Support', icon: '\u{1F4AC}', screen: 'HelpSupport' },
        ].map(action => (
          <TouchableOpacity key={action.label} style={styles.actionButton} onPress={() => {
            if (action.screen === 'History') navigation.getParent()?.navigate('History');
            else navigation.navigate(action.screen as any);
          }}>
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Purchases</Text>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('History')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      {recentTransactions.map(txn => (
        <TouchableOpacity key={txn.id} onPress={() => navigation.navigate('TransactionDetail', { transaction_id: txn.id })}>
          <Card style={styles.txnCard} variant="outlined">
            <View style={styles.txnRow}>
              <View style={styles.txnLeft}>
                <Text style={styles.txnStore}>{txn.store_name}</Text>
                <Text style={styles.txnDate}>{formatDate(txn.date)}</Text>
              </View>
              <View style={styles.txnRight}>
                <Text style={styles.txnTotal}>{formatCurrency(txn.total)}</Text>
                <Text style={styles.txnSaved}>Saved {formatCurrency(txn.discount_amount)}</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, backgroundColor: '#ffffff' },
  greeting: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary },
  subGreeting: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 2 },
  notifButton: { position: 'relative', padding: 8 },
  notifIcon: { fontSize: 24 },
  notifBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: colors.error, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: fontWeight.bold },
  renewBanner: { backgroundColor: '#FEF3C7', paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg },
  renewText: { fontSize: fontSize.sm, color: '#92400E', fontWeight: fontWeight.semibold, textAlign: 'center' },
  memberCard: { marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.lg, borderRadius: borderRadius.lg, backgroundColor: colors.primary[600], overflow: 'hidden' },
  cardBrand: { fontSize: fontSize.sm, color: colors.primary[200], fontWeight: fontWeight.bold, letterSpacing: 3 },
  cardName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: '#ffffff', marginTop: spacing.md },
  cardId: { fontSize: fontSize.md, color: colors.primary[200], marginTop: spacing.xs },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  cardStatus: { fontSize: fontSize.sm, color: '#ffffff', fontWeight: fontWeight.semibold },
  cardExpiry: { fontSize: fontSize.sm, color: colors.primary[200] },
  statsRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary[600] },
  statLabel: { fontSize: fontSize.xs, color: colors.text.secondary, marginTop: spacing.xs },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm },
  seeAll: { fontSize: fontSize.sm, color: colors.primary[600], fontWeight: fontWeight.semibold },
  actionsRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.sm },
  actionButton: { flex: 1, alignItems: 'center', backgroundColor: '#ffffff', paddingVertical: spacing.md, borderRadius: borderRadius.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  actionIcon: { fontSize: 24, marginBottom: spacing.xs },
  actionLabel: { fontSize: fontSize.xs, color: colors.text.secondary, fontWeight: fontWeight.medium },
  txnCard: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  txnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  txnLeft: {},
  txnStore: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text.primary },
  txnDate: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 2 },
  txnRight: { alignItems: 'flex-end' },
  txnTotal: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text.primary },
  txnSaved: { fontSize: fontSize.sm, color: colors.success, marginTop: 2 },
});
