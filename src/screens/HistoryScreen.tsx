import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList, Transaction, TransactionsResponse } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { api } from '../services/apiClient';
import EmptyState from '../components/EmptyState';

const H = 24;

interface HistoryScreenProps { navigation: NativeStackNavigationProp<RootStackParamList>; }

type FilterPeriod = '7d' | '30d' | '3m' | 'all';

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const [filter, setFilter] = useState<FilterPeriod>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ total_saved: 0, total_transactions: 0 });

  const loadTransactions = useCallback(async () => {
    const query: Record<string, string | undefined> = { limit: '50' };
    if (filter !== 'all') {
      const now = new Date();
      const days = filter === '7d' ? 7 : filter === '30d' ? 30 : 90;
      const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      query.from_date = from.toISOString().split('T')[0];
    }
    const res = await api.get<TransactionsResponse>('/member/transactions', query);
    if (res.success && res.data) {
      setTransactions(res.data.transactions);
      setSummary(res.data.summary);
    }
  }, [filter]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const filtered = transactions;
  const totalSpent = filtered.reduce((s, t) => s + t.final_amount, 0);
  const totalSaved = summary.total_saved;
  const txnCount = filtered.length;

  const onRefresh = async () => { setRefreshing(true); await loadTransactions(); setRefreshing(false); };

  const FILTERS: { key: FilterPeriod; label: string }[] = [
    { key: 'all', label: 'All' }, { key: '7d', label: '7 days' }, { key: '30d', label: '30 days' }, { key: '3m', label: '3 months' },
  ];

  // Group by date
  const grouped: Record<string, typeof filtered> = {};
  filtered.forEach(t => {
    const key = formatDate(t.date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  return (
    <View style={styles.screen}>
      {/* Nav */}
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>History</Text>
      </View>

      {/* Filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key} style={[styles.filterPill, filter === f.key && styles.filterPillActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary tiles */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryTile}>
          <Text style={styles.summaryEyebrow}>SPENT</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalSpent)}</Text>
        </View>
        <View style={styles.summaryTile}>
          <Text style={styles.summaryEyebrow}>SAVED</Text>
          <Text style={styles.summaryValueGold}>{formatCurrency(totalSaved)}</Text>
        </View>
        <View style={styles.summaryTile}>
          <Text style={styles.summaryEyebrow}>VISITS</Text>
          <Text style={styles.summaryValue}>{txnCount}</Text>
        </View>
      </View>

      {/* Transaction list */}
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text.tertiary} />}>
        {txnCount === 0 ? (
          <EmptyState title="No purchases yet" message="Your purchase history will appear here after your first transaction" />
        ) : (
          Object.entries(grouped).map(([date, txns]) => (
            <View key={date}>
              <Text style={styles.dateHeader}>{date}</Text>
              <View style={styles.txnCard}>
                {txns.map((txn, idx) => {
                  const initials = txn.store_name.replace('Mumuso ', '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  const isLast = idx === txns.length - 1;
                  return (
                    <TouchableOpacity key={txn.id} onPress={() => navigation.navigate('TransactionDetail', { transaction_id: txn.id })} activeOpacity={0.7}>
                      <View style={styles.txnRow}>
                        <View style={styles.txnAvatar}><Text style={styles.txnAvatarText}>{initials}</Text></View>
                        <View style={styles.txnCenter}>
                          <Text style={styles.txnStore} numberOfLines={1}>{txn.store_name}</Text>
                          <Text style={styles.txnMeta}>{txn.discount_type} discount</Text>
                        </View>
                        <View style={styles.txnRight}>
                          <Text style={styles.txnTotal}>{formatCurrency(txn.final_amount)}</Text>
                          <Text style={styles.txnSaved}>{'\u2013'}{formatCurrency(txn.discount_amount)}</Text>
                        </View>
                      </View>
                      {!isLast && <View style={styles.txnDivider} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  navBar: {
    paddingHorizontal: H,
    paddingTop: 56,
    paddingBottom: spacing['2'],
  },
  navTitle: { fontSize: 30, fontWeight: fontWeight.semibold, color: colors.text.primary, letterSpacing: -0.3 },

  filterRow: { paddingHorizontal: H, paddingVertical: spacing['3'], gap: spacing['2'] },
  filterPill: {
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  filterPillActive: { backgroundColor: colors.text.primary, borderColor: colors.text.primary },
  filterText: { fontSize: 13, color: colors.text.secondary, fontWeight: fontWeight.medium },
  filterTextActive: { color: colors.text.inverted },

  summaryRow: { flexDirection: 'row', gap: spacing['3'], paddingHorizontal: H, marginBottom: spacing['6'] },
  summaryTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing['4'],
    ...shadows.card,
  },
  summaryEyebrow: { fontSize: 10, fontWeight: fontWeight.medium, color: colors.text.tertiary, letterSpacing: 10 * 0.1, marginBottom: spacing['1'] },
  summaryValue: { fontSize: 20, fontWeight: fontWeight.semibold, color: colors.text.primary },
  summaryValueGold: { fontSize: 20, fontWeight: fontWeight.semibold, color: colors.accent.text },

  dateHeader: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
    letterSpacing: 11 * 0.08,
    paddingHorizontal: H,
    marginBottom: spacing['2'],
    marginTop: spacing['2'],
  },
  txnCard: {
    marginHorizontal: H,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    ...shadows.card,
    overflow: 'hidden',
    marginBottom: spacing['4'],
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
  txnMeta: { fontSize: 12, color: colors.text.tertiary, marginTop: 2 },
  txnRight: { alignItems: 'flex-end', marginLeft: spacing['3'] },
  txnTotal: { fontSize: 15, fontWeight: fontWeight.semibold, color: colors.text.primary },
  txnSaved: { fontSize: 12, fontWeight: fontWeight.medium, color: colors.accent.text, marginTop: 2 },
  txnDivider: { height: 1, backgroundColor: colors.border.subtle, marginLeft: 68 },
});
