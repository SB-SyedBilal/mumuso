import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList, TransactionDetail } from '../types';
import { formatCurrency, formatDateTime } from '../utils';
import { api } from '../services/apiClient';
import Button from '../components/Button';

const H = 24;

interface TransactionDetailScreenProps { navigation: NativeStackNavigationProp<RootStackParamList, 'TransactionDetail'>; }

export default function TransactionDetailScreen({ navigation }: TransactionDetailScreenProps) {
  const route = useRoute<RouteProp<RootStackParamList, 'TransactionDetail'>>();
  const [txn, setTxn] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await api.get<TransactionDetail>(`/member/transactions/${route.params.transaction_id}`);
      if (res.success && res.data) setTxn(res.data);
      setLoading(false);
    };
    load();
  }, [route.params.transaction_id]);

  if (loading) return <View style={styles.screen}><ActivityIndicator size="large" color={colors.accent.default} style={{ marginTop: 100 }} /></View>;
  if (!txn) return <View style={styles.screen}><Text style={styles.errorText}>Transaction not found</Text></View>;

  return (
    <View style={styles.screen}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Receipt</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Store header */}
        <View style={styles.storeHeader}>
          <Text style={styles.storeName}>{txn.store_name}</Text>
          <Text style={styles.txnDate}>{formatDateTime(txn.date)}</Text>
          <Text style={styles.txnId}>{txn.id.toUpperCase()}</Text>
        </View>

        {/* Calculation */}
        <View style={styles.card}>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Original Amount</Text>
            <Text style={styles.calcValue}>{formatCurrency(txn.original_amount)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.calcRow}>
            <Text style={styles.calcLabelGold}>Discount ({txn.discount_pct}%)</Text>
            <Text style={styles.calcValueGold}>{'\u2013'}{formatCurrency(txn.discount_amount)}</Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.calcRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>{formatCurrency(txn.final_amount)}</Text>
          </View>
        </View>

        {/* Savings highlight */}
        <View style={styles.savingsCard}>
          <Text style={styles.savingsEyebrow}>YOU SAVED</Text>
          <Text style={styles.savingsAmount}>{formatCurrency(txn.discount_amount)}</Text>
          <Text style={styles.savingsNote}>with your Mumuso membership</Text>
        </View>

        {/* Meta */}
        <View style={styles.card}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Store</Text>
            <Text style={styles.metaValue}>{txn.store_name}, {txn.store_city}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Member ID</Text>
            <Text style={styles.metaValue}>{txn.member_id}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Discount Type</Text>
            <Text style={styles.metaValue}>{txn.discount_type}</Text>
          </View>
        </View>

        {/* NOT SUPPORTED YET: PDF receipt download and email receipt require backend integration. */}
        <View style={styles.actionRow}>
          <Button title="Download Receipt" onPress={() => Alert.alert('Coming Soon', 'NOT SUPPORTED YET: Requires backend integration.')} variant="secondary" style={styles.actionBtn} />
          <Button title="Email Receipt" onPress={() => Alert.alert('Coming Soon', 'NOT SUPPORTED YET: Requires backend integration.')} variant="text" style={styles.actionBtn} />
        </View>

        <View style={{ height: 40 }} />
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
    paddingHorizontal: H,
    paddingTop: 56,
    paddingBottom: spacing['2'],
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: colors.text.primary },
  navTitle: { fontSize: 17, fontWeight: fontWeight.semibold, color: colors.text.primary },
  errorText: { fontSize: 15, color: colors.error, textAlign: 'center', marginTop: 100 },

  content: { paddingHorizontal: H },

  storeHeader: { alignItems: 'center', paddingVertical: spacing['6'] },
  storeName: { fontSize: 22, fontWeight: fontWeight.semibold, color: colors.text.primary },
  txnDate: { fontSize: 13, color: colors.text.secondary, marginTop: spacing['1'] },
  txnId: { fontSize: 11, color: colors.text.tertiary, marginTop: 2, letterSpacing: 0.5 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['4'],
    ...shadows.card,
    marginBottom: spacing['4'],
  },
  divider: { height: 1, backgroundColor: colors.border.subtle },

  itemHeader: { flexDirection: 'row', marginBottom: spacing['3'] },
  itemHeaderText: { flex: 1, fontSize: 10, fontWeight: fontWeight.medium, color: colors.text.tertiary, letterSpacing: 10 * 0.1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing['3'] },
  itemName: { fontSize: 15, color: colors.text.primary },
  itemQty: { flex: 1, fontSize: 14, color: colors.text.tertiary, textAlign: 'center' },
  itemTotal: { flex: 1, fontSize: 15, fontWeight: fontWeight.medium, color: colors.text.primary, textAlign: 'right' },

  calcRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 44 },
  calcLabel: { fontSize: 14, color: colors.text.secondary },
  calcValue: { fontSize: 14, color: colors.text.primary, fontWeight: fontWeight.medium },
  calcLabelGold: { fontSize: 14, color: colors.accent.text },
  calcValueGold: { fontSize: 14, color: colors.accent.text, fontWeight: fontWeight.semibold },
  totalDivider: { height: 2, backgroundColor: colors.border.default, marginVertical: spacing['1'] },
  totalLabel: { fontSize: 17, fontWeight: fontWeight.semibold, color: colors.text.primary },
  totalValue: { fontSize: 17, fontWeight: fontWeight.bold, color: colors.text.primary },

  savingsCard: {
    backgroundColor: 'rgba(200,169,110,0.08)',
    borderRadius: radius.xl,
    padding: spacing['5'],
    alignItems: 'center',
    marginBottom: spacing['4'],
    borderWidth: 1,
    borderColor: 'rgba(200,169,110,0.2)',
  },
  savingsEyebrow: { fontSize: 10, fontWeight: fontWeight.medium, color: colors.accent.text, letterSpacing: 10 * 0.14 },
  savingsAmount: { fontSize: 32, fontWeight: fontWeight.bold, color: colors.accent.text, marginVertical: spacing['1'] },
  savingsNote: { fontSize: 13, color: colors.text.secondary },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 44 },
  metaLabel: { fontSize: 14, color: colors.text.tertiary },
  metaValue: { fontSize: 14, color: colors.text.primary, fontWeight: fontWeight.medium },

  actionRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing['3'], marginTop: spacing['2'] },
  actionBtn: { flex: 1 },
});
