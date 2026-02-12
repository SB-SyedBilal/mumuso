import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { formatCurrency, formatDateTime } from '../utils';
import { MOCK_TRANSACTIONS } from '../services/mockData';
import Card from '../components/Card';
import Button from '../components/Button';

interface TransactionDetailScreenProps { navigation: NativeStackNavigationProp<RootStackParamList, 'TransactionDetail'>; }

export default function TransactionDetailScreen({ navigation }: TransactionDetailScreenProps) {
  const route = useRoute<RouteProp<RootStackParamList, 'TransactionDetail'>>();
  const txn = MOCK_TRANSACTIONS.find(t => t.id === route.params.transaction_id);
  if (!txn) return <View style={styles.container}><Text style={styles.errorText}>Transaction not found</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>{'\u2190'} Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Receipt</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.storeSection}>
          <Text style={styles.storeName}>{txn.store_name}</Text>
          <Text style={styles.txnDate}>{formatDateTime(txn.date)}</Text>
          <Text style={styles.txnId}>Transaction: {txn.id.toUpperCase()}</Text>
        </View>
        <Card variant="outlined" style={styles.itemsCard}>
          <View style={styles.itemHeader}><Text style={styles.itemHeaderText}>Item</Text><Text style={styles.itemHeaderText}>Qty</Text><Text style={styles.itemHeaderText}>Price</Text><Text style={styles.itemHeaderText}>Total</Text></View>
          {txn.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={[styles.itemText, { flex: 2 }]}>{item.name}</Text>
              <Text style={styles.itemText}>{item.quantity}</Text>
              <Text style={styles.itemText}>{formatCurrency(item.unit_price)}</Text>
              <Text style={[styles.itemText, styles.itemBold]}>{formatCurrency(item.total_price)}</Text>
            </View>
          ))}
        </Card>
        <Card variant="outlined" style={styles.calcCard}>
          <View style={styles.calcRow}><Text style={styles.calcLabel}>Subtotal</Text><Text style={styles.calcValue}>{formatCurrency(txn.subtotal)}</Text></View>
          <View style={styles.calcRow}><Text style={[styles.calcLabel, { color: colors.success }]}>Discount ({txn.discount_percentage}%)</Text><Text style={[styles.calcValue, { color: colors.success }]}>-{formatCurrency(txn.discount_amount)}</Text></View>
          {txn.tax > 0 && <View style={styles.calcRow}><Text style={styles.calcLabel}>Tax</Text><Text style={styles.calcValue}>{formatCurrency(txn.tax)}</Text></View>}
          <View style={[styles.calcRow, styles.totalRow]}><Text style={styles.totalLabel}>Total Paid</Text><Text style={styles.totalValue}>{formatCurrency(txn.total)}</Text></View>
        </Card>
        <Card style={styles.savingsCard} variant="elevated">
          <Text style={styles.savingsTitle}>You Saved!</Text>
          <Text style={styles.savingsAmount}>{formatCurrency(txn.discount_amount)}</Text>
          <Text style={styles.savingsNote}>with your Mumuso membership</Text>
        </Card>
        <Card variant="outlined" style={styles.metaCard}>
          <View style={styles.metaRow}><Text style={styles.metaLabel}>Payment Method</Text><Text style={styles.metaValue}>{txn.payment_method}</Text></View>
          <View style={styles.metaRow}><Text style={styles.metaLabel}>Member ID</Text><Text style={styles.metaValue}>{txn.member_id}</Text></View>
        </Card>
        {/* NOT SUPPORTED YET: PDF receipt download and email receipt require backend integration. */}
        <View style={styles.actionRow}>
          <Button title="Download Receipt" onPress={() => Alert.alert('Coming Soon', 'PDF receipt download will be available once backend is connected.')} variant="secondary" size="medium" />
          <Button title="Email Receipt" onPress={() => Alert.alert('Coming Soon', 'Email receipt will be available once backend is connected.')} variant="text" size="medium" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  backText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  errorText: { fontSize: fontSize.md, color: colors.error, textAlign: 'center', marginTop: 100 },
  content: { padding: spacing.lg, paddingBottom: 40 },
  storeSection: { alignItems: 'center', marginBottom: spacing.lg, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  storeName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  txnDate: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: spacing.xs },
  txnId: { fontSize: fontSize.xs, color: colors.neutral[400], marginTop: 2 },
  itemsCard: { marginBottom: spacing.md },
  itemHeader: { flexDirection: 'row', paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.neutral[100], marginBottom: spacing.sm },
  itemHeaderText: { flex: 1, fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.text.secondary, textTransform: 'uppercase' },
  itemRow: { flexDirection: 'row', paddingVertical: spacing.xs + 2 },
  itemText: { flex: 1, fontSize: fontSize.sm, color: colors.text.primary },
  itemBold: { fontWeight: fontWeight.semibold },
  calcCard: { marginBottom: spacing.md },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs + 2 },
  calcLabel: { fontSize: fontSize.md, color: colors.text.secondary },
  calcValue: { fontSize: fontSize.md, color: colors.text.primary, fontWeight: fontWeight.medium },
  totalRow: { borderTopWidth: 2, borderTopColor: colors.neutral[200], marginTop: spacing.sm, paddingTop: spacing.sm },
  totalLabel: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  totalValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  savingsCard: { marginBottom: spacing.md, alignItems: 'center', backgroundColor: '#D1FAE5' },
  savingsTitle: { fontSize: fontSize.sm, color: '#065F46', fontWeight: fontWeight.semibold },
  savingsAmount: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: '#065F46', marginVertical: spacing.xs },
  savingsNote: { fontSize: fontSize.xs, color: '#065F46' },
  metaCard: { marginBottom: spacing.lg },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.neutral[50] },
  metaLabel: { fontSize: fontSize.sm, color: colors.text.secondary },
  metaValue: { fontSize: fontSize.sm, color: colors.text.primary, fontWeight: fontWeight.semibold },
  actionRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
});
