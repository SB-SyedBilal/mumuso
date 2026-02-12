import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { MOCK_TRANSACTIONS } from '../services/mockData';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';

interface HistoryScreenProps { navigation: NativeStackNavigationProp<RootStackParamList>; }

type FilterPeriod = '7d' | '30d' | '3m' | 'all';

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const [filter, setFilter] = useState<FilterPeriod>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const filtered = MOCK_TRANSACTIONS.filter(t => {
    if (filter === 'all') return true;
    const d = new Date(t.date);
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (filter === '7d') return diffDays <= 7;
    if (filter === '30d') return diffDays <= 30;
    if (filter === '3m') return diffDays <= 90;
    return true;
  }).sort((a, b) => sortBy === 'date' ? new Date(b.date).getTime() - new Date(a.date).getTime() : b.total - a.total);

  const totalSpent = filtered.reduce((s, t) => s + t.total, 0);
  const totalSaved = filtered.reduce((s, t) => s + t.discount_amount, 0);

  const onRefresh = async () => { setRefreshing(true); await new Promise(r => setTimeout(r, 1000)); setRefreshing(false); };

  const FILTERS: { key: FilterPeriod; label: string }[] = [
    { key: '7d', label: '7 Days' }, { key: '30d', label: '30 Days' }, { key: '3m', label: '3 Months' }, { key: 'all', label: 'All' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Purchase History</Text>
        <TouchableOpacity onPress={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}>
          <Text style={styles.sortText}>Sort: {sortBy === 'date' ? 'Date' : 'Amount'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key} style={[styles.filterChip, filter === f.key && styles.filterChipActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}><Text style={styles.summaryValue}>{formatCurrency(totalSpent)}</Text><Text style={styles.summaryLabel}>Total Spent</Text></Card>
        <Card style={styles.summaryCard}><Text style={[styles.summaryValue, { color: colors.success }]}>{formatCurrency(totalSaved)}</Text><Text style={styles.summaryLabel}>Total Saved</Text></Card>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {filtered.length === 0 ? (
          <EmptyState icon={'\u{1F6CD}'} title="No purchases yet" message="Your purchase history will appear here after your first transaction" />
        ) : (
          filtered.map(txn => (
            <TouchableOpacity key={txn.id} onPress={() => navigation.navigate('TransactionDetail', { transaction_id: txn.id })}>
              <Card style={styles.txnCard} variant="outlined">
                <View style={styles.txnRow}>
                  <View><Text style={styles.txnStore}>{txn.store_name}</Text><Text style={styles.txnDate}>{formatDate(txn.date)} \u00B7 {txn.items.length} items</Text></View>
                  <View style={styles.txnRight}><Text style={styles.txnTotal}>{formatCurrency(txn.total)}</Text><Text style={styles.txnSaved}>-{formatCurrency(txn.discount_amount)}</Text></View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, backgroundColor: '#ffffff' },
  headerTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary },
  sortText: { fontSize: fontSize.sm, color: colors.primary[600], fontWeight: fontWeight.semibold },
  filterRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2, backgroundColor: '#ffffff', gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  filterChip: { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md, borderRadius: borderRadius.full, backgroundColor: colors.neutral[100] },
  filterChipActive: { backgroundColor: colors.primary[600] },
  filterText: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: fontWeight.medium },
  filterTextActive: { color: '#ffffff' },
  summaryRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  summaryCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  summaryValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  summaryLabel: { fontSize: fontSize.xs, color: colors.text.secondary, marginTop: spacing.xs },
  txnCard: { marginHorizontal: spacing.lg, marginTop: spacing.sm },
  txnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  txnStore: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text.primary },
  txnDate: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 2 },
  txnRight: { alignItems: 'flex-end' },
  txnTotal: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text.primary },
  txnSaved: { fontSize: fontSize.sm, color: colors.success, marginTop: 2 },
});
