import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList, NotificationsResponse } from '../types';
import { useAuth } from '../services/AuthContext';
import { formatCurrency, formatDate } from '../utils';
import { api } from '../services/apiClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_MARGIN = 24;

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, dashboard, refreshDashboard } = useAuth();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshDashboard();
    api.get<NotificationsResponse>('/notifications', { unread_only: 'true', limit: '1' }).then(res => {
      if (res.success && res.data) setUnreadNotifs(res.data.unread_count);
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshDashboard();
    const res = await api.get<NotificationsResponse>('/notifications', { unread_only: 'true', limit: '1' });
    if (res.success && res.data) setUnreadNotifs(res.data.unread_count);
    setRefreshing(false);
  };

  const daysRemaining = dashboard?.days_remaining || 0;
  const recentTransactions = dashboard?.recent_transactions || [];
  const isActive = dashboard?.status === 'active' && daysRemaining > 0;
  const firstName = user?.full_name?.split(' ')[0] || 'Member';
  const initials = (user?.full_name || 'M').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text.tertiary} />}>
      {/* NAV BAR */}
      <View style={styles.navBar}>
        <Text style={styles.navWordmark}>MUMUSO</Text>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.notifButton} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.bellIcon}>{'\u25CB'}</Text>
            {unreadNotifs > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadNotifs}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
      </View>

      {/* RENEWAL BANNER */}
      {daysRemaining <= 30 && daysRemaining > 0 && (
        <TouchableOpacity style={styles.renewBanner} onPress={() => navigation.navigate('RenewalScreen')}>
          <Text style={styles.renewText}>
            Your membership expires in {daysRemaining} days
          </Text>
          <Text style={styles.renewLink}>Renew \u2192</Text>
        </TouchableOpacity>
      )}

      {/* MEMBERSHIP CARD */}
      <TouchableOpacity
        style={styles.memberCard}
        onPress={() => navigation.getParent()?.navigate('MyCard')}
        activeOpacity={0.9}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardLabel}>MUMUSO MEMBER</Text>
          <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusExpired]}>
            {isActive && <View style={styles.statusDot} />}
            <Text style={[styles.statusText, isActive ? styles.statusActiveText : styles.statusExpiredText]}>
              {isActive ? 'ACTIVE' : 'EXPIRED'}
            </Text>
          </View>
        </View>
        <Text style={styles.cardName}>{user?.full_name || 'Member'}</Text>
        <View style={styles.cardBottomRow}>
          <Text style={styles.cardId}>{dashboard?.member_id || 'MUM \u00B7 XXXXX'}</Text>
          <View style={styles.cardValidCol}>
            <Text style={styles.cardValidLabel}>VALID UNTIL</Text>
            <Text style={styles.cardValidDate}>{dashboard?.expiry_date ? formatDate(dashboard.expiry_date) : 'N/A'}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <Text style={styles.tapHint}>Tap to show QR code</Text>

      {/* STAT TILES */}
      <View style={styles.statsRow}>
        <View style={styles.statTile}>
          <Text style={styles.statEyebrow}>TOTAL SAVED</Text>
          <Text style={styles.statValueGold}>{formatCurrency(dashboard?.total_saved || 0)}</Text>
          <Text style={styles.statSub}>This year</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statEyebrow}>PURCHASES</Text>
          <Text style={styles.statValue}>{dashboard?.total_transactions || 0}</Text>
          <Text style={styles.statSub}>This year</Text>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
        {[
          { label: 'Stores', icon: '\u25CB', screen: 'StoreLocator' },
          { label: 'Notifications', icon: '\u25CB', screen: 'Notifications' },
          { label: 'History', icon: '\u25B3', screen: 'History' },
          { label: 'Refer', icon: '\u25C7', screen: 'ReferralScreen' },
        ].map(action => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionChip}
            onPress={() => {
              if (action.screen === 'History') navigation.getParent()?.navigate('History');
              else navigation.navigate(action.screen as any);
            }}
            activeOpacity={0.7}>
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* RECENT ACTIVITY */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('History')}>
          <Text style={styles.seeAll}>See all \u203A</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.txnCard}>
        {recentTransactions.map((txn, index) => {
          const storeInitials = txn.store_name.replace('Mumuso ', '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          const time = new Date(txn.date).toLocaleTimeString('en-PK', { hour: 'numeric', minute: '2-digit' });
          const isLast = index === recentTransactions.length - 1;
          return (
            <TouchableOpacity
              key={txn.id}
              onPress={() => navigation.navigate('TransactionDetail', { transaction_id: txn.id })}
              activeOpacity={0.7}>
              <View style={styles.txnRow}>
                <View style={styles.txnAvatar}>
                  <Text style={styles.txnAvatarText}>{storeInitials}</Text>
                </View>
                <View style={styles.txnCenter}>
                  <Text style={styles.txnStore} numberOfLines={1}>{txn.store_name}</Text>
                  <Text style={styles.txnTime}>{time}</Text>
                </View>
                <View style={styles.txnRight}>
                  <Text style={styles.txnTotal}>{formatCurrency(txn.final_amount)}</Text>
                  <Text style={styles.txnSaved}>{'\u2013'} {formatCurrency(txn.discount_amount)}</Text>
                </View>
              </View>
              {!isLast && <View style={styles.txnDivider} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },

  // Nav bar
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_MARGIN,
    paddingTop: 56,
    paddingBottom: spacing['4'],
  },
  navWordmark: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: colors.accent.text,
    letterSpacing: 20 * 0.12,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  notifButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: { fontSize: 18, color: colors.text.primary },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.canvas,
  },
  notifBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: fontWeight.bold },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: fontWeight.semibold, color: '#FFFFFF' },

  // Renewal banner
  renewBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: HORIZONTAL_MARGIN,
    marginBottom: spacing['5'],
    backgroundColor: 'rgba(200,169,110,0.12)',
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.default,
    borderRadius: radius.sm,
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
  },
  renewText: { fontSize: 13, color: colors.text.primary, fontWeight: fontWeight.medium, flex: 1 },
  renewLink: { fontSize: 13, color: colors.accent.text, fontWeight: fontWeight.semibold, marginLeft: spacing['2'] },

  // Membership card
  memberCard: {
    marginHorizontal: HORIZONTAL_MARGIN,
    height: 208,
    borderRadius: radius['2xl'],
    backgroundColor: colors.surfaceDark,
    padding: spacing['6'],
    justifyContent: 'space-between',
    ...shadows.membership,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: {
    fontSize: 10,
    fontWeight: fontWeight.medium,
    color: colors.text.invertedMuted,
    letterSpacing: 10 * 0.14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  statusActive: { backgroundColor: 'rgba(74,155,127,0.12)' },
  statusExpired: { backgroundColor: 'rgba(192,84,74,0.10)' },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  statusText: { fontSize: 11, fontWeight: fontWeight.semibold },
  statusActiveText: { color: colors.success },
  statusExpiredText: { color: colors.error },
  cardName: {
    fontSize: 26,
    fontWeight: fontWeight.semibold,
    color: colors.text.inverted,
  },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardId: {
    fontSize: 12,
    color: '#6B6361',
    fontWeight: fontWeight.regular,
    letterSpacing: 0.5,
  },
  cardValidCol: { alignItems: 'flex-end' },
  cardValidLabel: {
    fontSize: 10,
    color: colors.text.invertedMuted,
    fontWeight: fontWeight.medium,
    letterSpacing: 10 * 0.06,
  },
  cardValidDate: {
    fontSize: 14,
    color: colors.text.invertedMuted,
    fontWeight: fontWeight.regular,
    marginTop: 2,
  },
  tapHint: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing['3'],
    marginBottom: spacing['5'],
  },

  // Stat tiles
  statsRow: {
    flexDirection: 'row',
    gap: spacing['3'],
    paddingHorizontal: HORIZONTAL_MARGIN,
    marginBottom: spacing['8'],
  },
  statTile: {
    flex: 1,
    height: 100,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: spacing['5'],
    justifyContent: 'space-between',
    ...shadows.card,
  },
  statEyebrow: {
    fontSize: 10,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
    letterSpacing: 10 * 0.1,
  },
  statValueGold: {
    fontSize: 28,
    fontWeight: fontWeight.semibold,
    color: colors.accent.text,
  },
  statValue: {
    fontSize: 28,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  statSub: {
    fontSize: 13,
    color: colors.text.tertiary,
  },

  // Section headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_MARGIN,
    marginBottom: spacing['3'],
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
    letterSpacing: 11 * 0.08,
  },
  seeAll: {
    fontSize: 13,
    color: colors.accent.text,
    fontWeight: fontWeight.medium,
  },

  // Quick actions
  actionsScroll: {
    paddingHorizontal: HORIZONTAL_MARGIN,
    gap: spacing['3'],
    marginBottom: spacing['8'],
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.full,
    ...shadows.xs,
    gap: spacing['2'],
  },
  actionIcon: { fontSize: 16, color: colors.text.secondary },
  actionLabel: { fontSize: 13, color: colors.text.primary, fontWeight: fontWeight.medium },

  // Transactions
  txnCard: {
    marginHorizontal: HORIZONTAL_MARGIN,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    ...shadows.card,
    overflow: 'hidden',
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['5'],
    height: 68,
  },
  txnAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing['3'],
  },
  txnAvatarText: { fontSize: 13, fontWeight: fontWeight.semibold, color: '#FFFFFF' },
  txnCenter: { flex: 1 },
  txnStore: { fontSize: 15, fontWeight: fontWeight.medium, color: colors.text.primary },
  txnTime: { fontSize: 12, color: colors.text.tertiary, marginTop: 2 },
  txnRight: { alignItems: 'flex-end', marginLeft: spacing['3'] },
  txnTotal: { fontSize: 15, fontWeight: fontWeight.semibold, color: colors.text.primary },
  txnSaved: { fontSize: 12, fontWeight: fontWeight.medium, color: colors.accent.text, marginTop: 2 },
  txnDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginLeft: 68,
  },
});
