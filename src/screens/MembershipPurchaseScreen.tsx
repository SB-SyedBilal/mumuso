import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { formatCurrency } from '../utils';
import { MEMBERSHIP_FEE, DISCOUNT_PERCENTAGE } from '../services/mockData';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

interface MembershipPurchaseScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MembershipPurchase'>;
}

const PAYMENT_METHODS = [
  { id: 'jazzcash', name: 'JazzCash', icon: '\u{1F4F1}' },
  { id: 'easypaisa', name: 'EasyPaisa', icon: '\u{1F4B3}' },
  { id: 'card', name: 'Credit/Debit Card', icon: '\u{1F4B3}' },
  { id: 'bank', name: 'Bank Transfer', icon: '\u{1F3E6}' },
];

const BENEFITS = [
  '10% instant discount on every purchase',
  'Valid at all Mumuso stores nationwide',
  'Digital membership card with QR code',
  'Purchase history & savings tracking',
  'Member-only promotions & offers',
  'Priority customer support',
];

export default function MembershipPurchaseScreen({ navigation }: MembershipPurchaseScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [showPromo, setShowPromo] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const finalAmount = MEMBERSHIP_FEE - promoDiscount;
  const monthlyBreakdown = Math.round(finalAmount / 12);
  const breakEvenSpend = Math.round(finalAmount / (DISCOUNT_PERCENTAGE / 100));

  const handleApplyPromo = () => {
    // NOT SUPPORTED YET: Real promo code validation via backend API.
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setPromoDiscount(200);
      setPromoApplied(true);
    } else {
      Alert.alert('Invalid Code', 'This promo code is not valid or has expired.');
      setPromoApplied(false);
      setPromoDiscount(0);
    }
  };

  const handleProceed = () => {
    if (!selectedMethod) { Alert.alert('Error', 'Please select a payment method'); return; }
    if (!agreeTerms) { Alert.alert('Error', 'Please agree to the terms & conditions'); return; }
    navigation.navigate('PaymentProcessing', { method: selectedMethod, amount: finalAmount });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membership</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Card style={styles.priceCard} variant="elevated">
          <Text style={styles.priceLabel}>Annual Membership</Text>
          <Text style={styles.price}>{formatCurrency(finalAmount)}</Text>
          {promoApplied && <Text style={styles.originalPrice}>Was {formatCurrency(MEMBERSHIP_FEE)}</Text>}
          <Text style={styles.priceBreakdown}>Just {formatCurrency(monthlyBreakdown)}/month</Text>
          <Text style={styles.breakEven}>Break even after spending {formatCurrency(breakEvenSpend)}</Text>
        </Card>

        <Text style={styles.sectionTitle}>Benefits</Text>
        {BENEFITS.map((b, i) => (
          <View key={i} style={styles.benefitRow}>
            <Text style={styles.benefitCheck}>{'\u2713'}</Text>
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Payment Method</Text>
        {PAYMENT_METHODS.map(m => (
          <TouchableOpacity key={m.id} style={[styles.methodCard, selectedMethod === m.id && styles.methodCardActive]} onPress={() => setSelectedMethod(m.id)}>
            <Text style={styles.methodIcon}>{m.icon}</Text>
            <Text style={styles.methodName}>{m.name}</Text>
            <View style={[styles.radio, selectedMethod === m.id && styles.radioActive]} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={() => setShowPromo(!showPromo)} style={styles.promoToggle}>
          <Text style={styles.promoToggleText}>{showPromo ? 'Hide' : 'Have a'} Promo Code{showPromo ? '' : '?'}</Text>
        </TouchableOpacity>
        {showPromo && (
          <View style={styles.promoRow}>
            <Input value={promoCode} onChangeText={setPromoCode} placeholder="Enter code" containerStyle={styles.promoInput} autoCapitalize="characters" />
            <Button title="Apply" onPress={handleApplyPromo} variant="secondary" size="small" />
          </View>
        )}
        {promoApplied && <Text style={styles.promoSuccess}>Promo applied! You save {formatCurrency(promoDiscount)}</Text>}

        <TouchableOpacity style={styles.termsRow} onPress={() => setAgreeTerms(!agreeTerms)}>
          <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
            {agreeTerms && <Text style={styles.checkmark}>{'\u2713'}</Text>}
          </View>
          <Text style={styles.termsText}>I agree to the membership Terms & Conditions</Text>
        </TouchableOpacity>

        <Button title={`Pay ${formatCurrency(finalAmount)}`} onPress={handleProceed} variant="primary" size="large" style={styles.payButton} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  backText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  content: { padding: spacing.lg, paddingBottom: 40 },
  priceCard: { alignItems: 'center', marginBottom: spacing.lg, backgroundColor: colors.primary[50] },
  priceLabel: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  price: { fontSize: 36, fontWeight: fontWeight.bold, color: colors.primary[700], marginVertical: spacing.sm },
  originalPrice: { fontSize: fontSize.md, color: colors.neutral[400], textDecorationLine: 'line-through' },
  priceBreakdown: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: spacing.xs },
  breakEven: { fontSize: fontSize.xs, color: colors.neutral[400], marginTop: 2 },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.md, marginTop: spacing.lg },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  benefitCheck: { fontSize: fontSize.md, color: colors.success, fontWeight: fontWeight.bold },
  benefitText: { fontSize: fontSize.md, color: colors.text.primary, flex: 1 },
  methodCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderWidth: 1, borderColor: colors.neutral[200], borderRadius: borderRadius.md, marginBottom: spacing.sm },
  methodCardActive: { borderColor: colors.primary[600], backgroundColor: colors.primary[50] },
  methodIcon: { fontSize: 20, marginRight: spacing.md },
  methodName: { flex: 1, fontSize: fontSize.md, color: colors.text.primary, fontWeight: fontWeight.medium },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.neutral[300] },
  radioActive: { borderColor: colors.primary[600], backgroundColor: colors.primary[600] },
  promoToggle: { marginTop: spacing.md, marginBottom: spacing.sm },
  promoToggleText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  promoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  promoInput: { flex: 1, marginBottom: 0 },
  promoSuccess: { fontSize: fontSize.sm, color: colors.success, fontWeight: fontWeight.semibold, marginTop: spacing.xs },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.md },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: colors.neutral[300], alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary[600], borderColor: colors.primary[600] },
  checkmark: { color: '#ffffff', fontSize: 14, fontWeight: fontWeight.bold },
  termsText: { flex: 1, fontSize: fontSize.sm, color: colors.text.secondary },
  payButton: { borderRadius: borderRadius.lg },
});
