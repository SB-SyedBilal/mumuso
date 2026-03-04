import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList, Transaction, TransactionsResponse } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { api } from '../services/apiClient';
import { EmptyState, SegmentedControl } from '../components';

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

  const PERIOD_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '3 Months', value: '3m' },
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

      {/* Filter Segmented Control */}
      <SegmentedControl
        options={PERIOD_OPTIONS}
        selectedValue={filter}
        onValueChange={(val) => setFilter(val as FilterPeriod)}
        containerStyle={styles.filterContainer}
      />

      {/* Summary tiles */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryTile}>
          <View style={styles.summaryHeader}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(26,26,26,0.05)' }]}>
              <Ionicons name="card-outline" size={14} color={colors.text.primary} />
            </View>
            <Text style={styles.summaryEyebrow}>SPENT</Text>
          </View>
          <Text style={styles.summaryValue}>{formatCurrency(totalSpent)}</Text>
        </View>

        <View style={styles.summaryTile}>
          <View style={styles.summaryHeader}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(155,123,63,0.1)' }]}>
              <Ionicons name="sparkles-outline" size={14} color={colors.accent.default} />
            </View>
            <Text style={styles.summaryEyebrow}>SAVED</Text>
          </View>
          <Text style={styles.summaryValueGold}>{formatCurrency(totalSaved)}</Text>
        </View>

        <View style={styles.summaryTile}>
          <View style={styles.summaryHeader}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(74,155,127,0.1)' }]}>
              <Ionicons name="receipt-outline" size={14} color={colors.success} />
            </View>
            <Text style={styles.summaryEyebrow}>VISITS</Text>
          </View>
          <Text style={styles.summaryValue}>{txnCount}</Text>
        </View>
      </View>

      {/* Transaction list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text.tertiary} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  navBar: {
    paddingHorizontal: H,
    paddingTop: 56,
    paddingBottom: spacing['4'],
  },
  navTitle: { fontSize: 32, fontWeight: fontWeight.bold, color: colors.text.primary, letterSpacing: -0.6 },

  filterContainer: { marginBottom: spacing['6'] },

  summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: H, marginBottom: spacing['8'] },
  summaryTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing['3'],
    ...shadows.card,
    justifyContent: 'space-between',
    minHeight: 84,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  iconBox: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  summaryEyebrow: { fontSize: 9, fontWeight: fontWeight.bold, color: colors.text.tertiary, letterSpacing: 1 },
  summaryValue: { fontSize: 17, fontWeight: fontWeight.bold, color: colors.text.primary },
  summaryValueGold: { fontSize: 17, fontWeight: fontWeight.bold, color: colors.accent.text },

  dateHeader: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.text.tertiary,
    letterSpacing: 1,
    paddingHorizontal: H,
    marginBottom: spacing['3'],
    marginTop: spacing['2'],
    textTransform: 'uppercase',
  },
  txnCard: {
    marginHorizontal: H,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    ...shadows.card,
    overflow: 'hidden',
    marginBottom: spacing['6'],
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
  txnAvatarText: { fontSize: 14, fontWeight: fontWeight.bold, color: '#FFFFFF' },
  txnCenter: { flex: 1 },
  txnStore: { fontSize: 16, fontWeight: fontWeight.semibold, color: colors.text.primary },
  txnMeta: { fontSize: 12, color: colors.text.tertiary, marginTop: 2 },
  txnRight: { alignItems: 'flex-end', marginLeft: spacing['3'] },
  txnTotal: { fontSize: 16, fontWeight: fontWeight.bold, color: colors.text.primary },
  txnSaved: { fontSize: 12, fontWeight: fontWeight.semibold, color: colors.accent.text, marginTop: 2 },
  txnDivider: { height: 1, backgroundColor: colors.border.subtle, marginLeft: 72 },
});
