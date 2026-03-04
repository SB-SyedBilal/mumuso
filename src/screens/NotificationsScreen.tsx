import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList, AppNotification, NotificationsResponse } from '../types';
import { api } from '../services/apiClient';
import { formatRelativeTime } from '../utils';
import { EmptyState, SegmentedControl } from '../components';

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

  const CAT_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Member', value: 'membership' },
    { label: 'Orders', value: 'transaction' },
    { label: 'Offers', value: 'promotional' },
    { label: 'System', value: 'system' },
  ];

  const getCategoryIcon = (cat: string) => {
    const map: Record<string, string> = {
      membership_activated: 'person-outline',
      membership_renewed: 'refresh-outline',
      transaction: 'receipt-outline',
      promotional: 'pricetag-outline',
      system: 'settings-outline'
    };
    return map[cat] || 'notifications-outline';
  };

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      membership_activated: colors.accent.default,
      membership_renewed: colors.accent.default,
      transaction: colors.success,
      promotional: colors.warning || '#C08040',
      system: colors.text.tertiary
    };
    return map[cat] || colors.text.secondary;
  };

  return (
    <View style={styles.screen}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Notifications</Text>
        {unread > 0 ? (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAll}>Read All</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      <SegmentedControl
        options={CAT_OPTIONS}
        selectedValue={filter}
        onValueChange={(val) => setFilter(val as FilterCat)}
        containerStyle={styles.filterContainer}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text.tertiary} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {filtered.length === 0 ? <EmptyState title="No notifications" message="We'll notify you about updates and offers" /> : (
          filtered.map((n, idx) => {
            const icon = getCategoryIcon(n.type);
            const color = getCategoryColor(n.type);
            return (
              <TouchableOpacity key={n.id} style={styles.notifRow} onPress={() => handlePress(n)} activeOpacity={0.7}>
                <View style={[styles.notifIconBox, { backgroundColor: `${color}10` }]}>
                  <Ionicons name={icon} size={20} color={color} />
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
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: spacing['4']
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 17, fontWeight: fontWeight.bold, color: colors.text.primary },
  markAllBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  markAll: { fontSize: 13, color: colors.accent.text, fontWeight: fontWeight.bold },

  filterContainer: { marginBottom: spacing['4'] },

  notifRow: {
    flexDirection: 'row',
    paddingVertical: spacing['4'],
    paddingHorizontal: H,
    gap: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  notifIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  notifTitle: { fontSize: 15, fontWeight: fontWeight.semibold, color: colors.text.primary, flex: 1 },
  notifTitleUnread: { color: colors.text.primary },
  unreadDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent.default },
  notifMsg: { fontSize: 13, color: colors.text.secondary, marginTop: 4, lineHeight: 18 },
  notifTime: { fontSize: 11, color: colors.text.tertiary, marginTop: spacing['2'], fontWeight: fontWeight.medium },
});
