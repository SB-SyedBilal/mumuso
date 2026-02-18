import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList, AppNotification, NotificationsResponse } from '../types';
import { api } from '../services/apiClient';
import { formatRelativeTime } from '../utils';
import EmptyState from '../components/EmptyState';

const H = 24;

interface Props { navigation: NativeStackNavigationProp<RootStackParamList, 'Notifications'>; }
type FilterCat = 'all' | 'membership' | 'transaction' | 'promotional' | 'system';

export default function NotificationsScreen({ navigation }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<FilterCat>('all');
  const [unread, setUnread] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    const res = await api.get<NotificationsResponse>('/notifications', { limit: '50' });
    if (res.success && res.data) {
      setNotifications(res.data.notifications);
      setUnread(res.data.unread_count);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  const onRefresh = async () => { setRefreshing(true); await loadNotifications(); setRefreshing(false); };

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

  const markRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };
  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(p => p.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const handlePress = (n: AppNotification) => {
    if (!n.read) markRead(n.id);
    if (n.type === 'transaction' && n.deep_link) {
      const txnId = n.deep_link.replace('mumuso://', '');
      if (txnId) navigation.navigate('TransactionDetail', { transaction_id: txnId });
    }
  };

  const FILTERS: { key: FilterCat; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'membership', label: 'Membership' },
    { key: 'transaction', label: 'Transactions' }, { key: 'promotional', label: 'Offers' }, { key: 'system', label: 'System' },
  ];

  const getCategoryInitial = (cat: string) => {
    const map: Record<string, string> = { membership_activated: 'M', membership_renewed: 'M', transaction: 'T', promotional: 'P', system: 'S' };
    return map[cat] || cat.charAt(0).toUpperCase();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backIcon}>{'\u2039'}</Text></TouchableOpacity>
        <Text style={styles.navTitle}>Notifications</Text>
        {unread > 0 ? <TouchableOpacity onPress={markAllRead}><Text style={styles.markAll}>Read all</Text></TouchableOpacity> : <View style={{ width: 44 }} />}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key} style={[styles.pill, filter === f.key && styles.pillActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.pillText, filter === f.key && styles.pillTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text.tertiary} />}>
        {filtered.length === 0 ? <EmptyState title="No notifications" message="We'll notify you about updates and offers" /> : (
          filtered.map((n, idx) => (
            <TouchableOpacity key={n.id} style={styles.notifRow} onPress={() => handlePress(n)} activeOpacity={0.7}>
              <View style={[styles.notifAvatar, !n.read && styles.notifAvatarUnread]}>
                <Text style={styles.notifAvatarText}>{getCategoryInitial(n.type)}</Text>
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifTitleRow}>
                  <Text style={[styles.notifTitle, !n.read && styles.notifTitleUnread]} numberOfLines={1}>{n.title}</Text>
                  {!n.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifMsg} numberOfLines={2}>{n.body}</Text>
                <Text style={styles.notifTime}>{formatRelativeTime(n.created_at)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  markAll: { fontSize: 13, color: colors.accent.text, fontWeight: fontWeight.medium },

  filterRow: { paddingHorizontal: H, paddingVertical: spacing['3'], gap: spacing['2'] },
  pill: { paddingVertical: spacing['2'], paddingHorizontal: spacing['4'], borderRadius: radius.full, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border.subtle },
  pillActive: { backgroundColor: colors.text.primary, borderColor: colors.text.primary },
  pillText: { fontSize: 13, color: colors.text.secondary, fontWeight: fontWeight.medium },
  pillTextActive: { color: colors.text.inverted },

  notifRow: { flexDirection: 'row', paddingVertical: spacing['4'], paddingHorizontal: H, gap: spacing['3'] },
  notifAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  notifAvatarUnread: { backgroundColor: colors.accent.default },
  notifAvatarText: { fontSize: 14, fontWeight: fontWeight.semibold, color: '#FFFFFF' },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  notifTitle: { fontSize: 15, fontWeight: fontWeight.medium, color: colors.text.primary, flex: 1 },
  notifTitleUnread: { fontWeight: fontWeight.semibold },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent.default },
  notifMsg: { fontSize: 13, color: colors.text.secondary, marginTop: 2, lineHeight: 20 },
  notifTime: { fontSize: 11, color: colors.text.tertiary, marginTop: spacing['1'] },
});
