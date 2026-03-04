import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
  const initials = (user?.full_name || 'M').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text.tertiary} />}>
      {/* NAV BAR */}
      <View style={styles.navBar}>
        <Text style={styles.navWordmark}>MUMUSO</Text>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.notifButton} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={20} color={colors.text.primary} />
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
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.accent.dark} style={{ marginRight: 8 }} />
            <Text style={styles.renewText}>
              Your membership expires in {daysRemaining} days
            </Text>
          </View>
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
          <View style={styles.statHeader}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(155,123,63,0.1)' }]}>
              <Ionicons name="sparkles-outline" size={14} color={colors.accent.default} />
            </View>
            <Text style={styles.statEyebrow}>TOTAL SAVED</Text>
          </View>
          <Text style={styles.statValueGold}>{formatCurrency(dashboard?.total_saved || 0)}</Text>
          <Text style={styles.statSub}>This year</Text>
        </View>
        <View style={styles.statTile}>
          <View style={styles.statHeader}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(26,26,26,0.05)' }]}>
              <Ionicons name="bag-handle-outline" size={14} color={colors.text.primary} />
            </View>
            <Text style={styles.statEyebrow}>PURCHASES</Text>
          </View>
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
          { label: 'Stores', icon: 'location-outline', screen: 'StoreLocator' },
          { label: 'Notifications', icon: 'notifications-outline', screen: 'Notifications' },
          { label: 'History', icon: 'time-outline', screen: 'History' },
          { label: 'Refer', icon: 'share-social-outline', screen: 'ReferralScreen' },
        ].map(action => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionChip}
            onPress={() => {
              if (action.screen === 'History') navigation.getParent()?.navigate('History');
              else navigation.navigate(action.screen as any);
            }}
            activeOpacity={0.7}>
            <Ionicons name={action.icon as any} size={16} color={colors.text.secondary} />
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* RECENT ACTIVITY */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('History')}>
          <Text style={styles.seeAll}>See All \u203A</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.txnCard}>
        {recentTransactions.length === 0 ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>No recent transactions</Text>
          </View>
        ) : (
          recentTransactions.map((txn, index) => {
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
          })
        )}
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
    fontSize: 22,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: 2,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  notifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  notifBadgeText: { display: 'none' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accent.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: fontWeight.bold, color: '#FFFFFF' },

  // Renewal banner
  renewBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: HORIZONTAL_MARGIN,
    marginBottom: spacing['6'],
    backgroundColor: 'rgba(155,123,63,0.08)',
    borderRadius: radius.lg,
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['4'],
    borderWidth: 1,
    borderColor: 'rgba(155,123,63,0.15)',
  },
  renewText: { fontSize: 13, color: colors.text.primary, fontWeight: fontWeight.semibold, flex: 1 },
  renewLink: { fontSize: 13, color: colors.accent.default, fontWeight: fontWeight.bold, marginLeft: spacing['2'] },

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
    fontWeight: fontWeight.bold,
    color: colors.text.invertedMuted,
    letterSpacing: 1.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusActive: { backgroundColor: 'rgba(74,155,127,0.15)' },
  statusExpired: { backgroundColor: 'rgba(192,84,74,0.15)' },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  statusText: { fontSize: 10, fontWeight: fontWeight.bold },
  statusActiveText: { color: colors.success },
  statusExpiredText: { color: colors.error },
  cardName: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.text.inverted,
    letterSpacing: -0.5,
  },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardId: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: fontWeight.medium,
    letterSpacing: 1,
  },
  cardValidCol: { alignItems: 'flex-end' },
  cardValidLabel: {
    fontSize: 9,
    color: colors.text.invertedMuted,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.8,
  },
  cardValidDate: {
    fontSize: 14,
    color: colors.text.inverted,
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },
  tapHint: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing['4'],
    marginBottom: spacing['6'],
    fontWeight: fontWeight.medium,
  },

  // Stat tiles
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: HORIZONTAL_MARGIN,
    marginBottom: spacing['8'],
  },
  statTile: {
    flex: 1,
    height: 110,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: spacing['4'],
    justifyContent: 'space-between',
    ...shadows.card,
  },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBox: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  statEyebrow: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.text.tertiary,
    letterSpacing: 0.8,
  },
  statValueGold: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: colors.accent.default,
  },
  statValue: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  statSub: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: fontWeight.medium,
  },

  // Section headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_MARGIN,
    marginBottom: spacing['4'],
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.text.tertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  seeAll: {
    fontSize: 13,
    color: colors.accent.default,
    fontWeight: fontWeight.bold,
  },

  // Quick actions
  actionsScroll: {
    paddingHorizontal: HORIZONTAL_MARGIN,
    gap: 12,
    marginBottom: spacing['8'],
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    ...shadows.sm,
    gap: 10,
  },
  actionLabel: { fontSize: 14, color: colors.text.primary, fontWeight: fontWeight.bold },

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
    paddingHorizontal: spacing['4'],
    height: 72,
  },
  txnAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing['3'],
  },
  txnAvatarText: { fontSize: 13, fontWeight: fontWeight.bold, color: '#FFFFFF' },
  txnCenter: { flex: 1 },
  txnStore: { fontSize: 16, fontWeight: fontWeight.bold, color: colors.text.primary },
  txnTime: { fontSize: 12, color: colors.text.tertiary, marginTop: 2, fontWeight: fontWeight.medium },
  txnRight: { alignItems: 'flex-end', marginLeft: spacing['3'] },
  txnTotal: { fontSize: 16, fontWeight: fontWeight.bold, color: colors.text.primary },
  txnSaved: { fontSize: 12, fontWeight: fontWeight.bold, color: colors.accent.default, marginTop: 2 },
  txnDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginLeft: 72,
  },
});
