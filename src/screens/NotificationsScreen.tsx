import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList, AppNotification } from '../types';
import { MOCK_NOTIFICATIONS } from '../services/mockData';
import { formatRelativeTime } from '../utils';
import EmptyState from '../components/EmptyState';

interface Props { navigation: NativeStackNavigationProp<RootStackParamList, 'Notifications'>; }
type FilterCat = 'all' | 'membership' | 'transaction' | 'promotional' | 'system';
const ICONS: Record<string, string> = { membership: '\u{1F4B3}', transaction: '\u{1F6CD}', promotional: '\u{1F381}', system: '\u{2699}' };

export default function NotificationsScreen({ navigation }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<FilterCat>('all');
  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.category === filter);
  const unread = notifications.filter(n => !n.is_read).length;

  const markRead = (id: string) => setNotifications(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, is_read: true })));

  const handlePress = (n: AppNotification) => {
    markRead(n.id);
    if (n.category === 'transaction' && n.action_url) navigation.navigate('TransactionDetail', { transaction_id: n.action_url });
  };

  const FILTERS: { key: FilterCat; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'membership', label: 'Membership' },
    { key: 'transaction', label: 'Transactions' }, { key: 'promotional', label: 'Offers' }, { key: 'system', label: 'System' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>{'\u2190'} Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unread > 0 ? <TouchableOpacity onPress={markAllRead}><Text style={styles.markAll}>Read All</Text></TouchableOpacity> : <View style={{ width: 60 }} />}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key} style={[styles.chip, filter === f.key && styles.chipActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? <EmptyState title="No notifications" message="We'll notify you about updates and offers" /> : (
          filtered.map(n => (
            <TouchableOpacity key={n.id} style={[styles.notifCard, !n.is_read && styles.unread]} onPress={() => handlePress(n)}
              onLongPress={() => setNotifications(p => p.filter(x => x.id !== n.id))}>
              <View style={styles.notifRow}>
                <View style={styles.iconCircle}><Text style={{ fontSize: 18 }}>{ICONS[n.category] || '\u{1F514}'}</Text></View>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.notifTitle, !n.is_read && { fontWeight: fontWeight.bold }]} numberOfLines={1}>{n.title}</Text>
                    {!n.is_read && <View style={styles.dot} />}
                  </View>
                  <Text style={styles.notifMsg} numberOfLines={2}>{n.message}</Text>
                  <Text style={styles.notifTime}>{formatRelativeTime(n.created_at)}</Text>
                </View>
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
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, backgroundColor: '#ffffff' },
  backText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  markAll: { fontSize: fontSize.sm, color: colors.primary[600], fontWeight: fontWeight.semibold },
  filterRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2, backgroundColor: '#ffffff', gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  chip: { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md, borderRadius: borderRadius.full, backgroundColor: colors.neutral[100] },
  chipActive: { backgroundColor: colors.primary[600] },
  chipText: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: fontWeight.medium },
  chipTextActive: { color: '#ffffff' },
  notifCard: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  unread: { backgroundColor: colors.primary[50] },
  notifRow: { flexDirection: 'row', gap: spacing.md },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.neutral[100], alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  notifTitle: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text.primary, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary[600] },
  notifMsg: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 2, lineHeight: 20 },
  notifTime: { fontSize: fontSize.xs, color: colors.neutral[400], marginTop: spacing.xs },
});
