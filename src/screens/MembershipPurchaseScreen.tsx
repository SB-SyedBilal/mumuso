import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { formatCurrency } from '../utils';
import { MEMBERSHIP_FEE, DISCOUNT_PERCENTAGE } from '../services/mockData';
import Button from '../components/Button';
import Input from '../components/Input';

const H = 24;

interface MembershipPurchaseScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MembershipPurchase'>;
}

const PAYMENT_METHODS = [
  { id: 'jazzcash', name: 'JazzCash' },
  { id: 'easypaisa', name: 'EasyPaisa' },
  { id: 'card', name: 'Card' },
  { id: 'bank', name: 'Bank' },
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

  const finalAmount = MEMBERSHIP_FEE - promoDiscount;
  const monthlyBreakdown = Math.round(finalAmount / 12);
  const breakEvenSpend = Math.round(finalAmount / (DISCOUNT_PERCENTAGE / 100));

  const handleApplyPromo = () => {
    // NOT SUPPORTED YET: Real promo code validation via backend API.
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setPromoDiscount(200);
      setPromoApplied(true);
    } else {
      Alert.alert('Invalid code', 'This promo code is not valid or has expired.');
      setPromoApplied(false);
      setPromoDiscount(0);
    }
  };

  const handleProceed = () => {
    if (!selectedMethod) { Alert.alert('Select payment', 'Please choose a payment method'); return; }
    navigation.navigate('PaymentProcessing', { method: selectedMethod, amount: finalAmount });
  };

  return (
    <View style={styles.screen}>
      {/* Dark hero zone */}
      <View style={styles.heroZone}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>{'\u2039'}</Text>
        </TouchableOpacity>
        <Text style={styles.heroLabel}>ANNUAL MEMBERSHIP</Text>
        <Text style={styles.heroPrice}>{formatCurrency(finalAmount)}</Text>
        {promoApplied && <Text style={styles.heroOriginal}>Was {formatCurrency(MEMBERSHIP_FEE)}</Text>}
        <Text style={styles.heroBreakdown}>Just {formatCurrency(monthlyBreakdown)}/month \u00B7 Break even at {formatCurrency(breakEvenSpend)}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Benefits */}
        <Text style={styles.sectionLabel}>WHAT YOU GET</Text>
        <View style={styles.benefitsCard}>
          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <Text style={styles.benefitCheck}>{'\u2713'}</Text>
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Payment method */}
        <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>
        <View style={styles.methodRow}>
          {PAYMENT_METHODS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.methodChip, selectedMethod === m.id && styles.methodChipActive]}
              onPress={() => setSelectedMethod(m.id)}>
              <Text style={[styles.methodText, selectedMethod === m.id && styles.methodTextActive]}>{m.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* NOT SUPPORTED YET: Actual payment processing requires payment gateway integration */}

        {/* Promo */}
        <TouchableOpacity onPress={() => setShowPromo(!showPromo)} style={styles.promoToggle}>
          <Text style={styles.promoToggleText}>{showPromo ? 'Hide promo code' : 'Have a promo code?'}</Text>
        </TouchableOpacity>
        {showPromo && (
          <View style={styles.promoRow}>
            <Input value={promoCode} onChangeText={setPromoCode} placeholder="Enter code" containerStyle={styles.promoInput} autoCapitalize="characters" />
            <Button title="Apply" onPress={handleApplyPromo} variant="secondary" style={styles.promoBtn} />
          </View>
        )}
        {promoApplied && <Text style={styles.promoSuccess}>{'\u2713'} Promo applied \u2014 you save {formatCurrency(promoDiscount)}</Text>}

        {/* Terms */}
        <Text style={styles.termsText}>
          By purchasing you agree to the{' '}
          <Text style={styles.termsLink}>Membership Terms</Text>.{'\n'}
          Auto-renewal can be managed in your profile.
        </Text>

        <Button title={`Pay ${formatCurrency(finalAmount)}`} onPress={handleProceed} variant="gold" style={styles.payButton} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },

  heroZone: {
    backgroundColor: colors.surfaceDarker,
    paddingHorizontal: H,
    paddingTop: 56,
    paddingBottom: spacing['8'],
    borderBottomLeftRadius: radius['3xl'],
    borderBottomRightRadius: radius['3xl'],
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -spacing['2'], marginBottom: spacing['4'] },
  backIcon: { fontSize: 28, color: colors.text.inverted },
  heroLabel: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: colors.accent.default,
    letterSpacing: 11 * 0.14,
    marginBottom: spacing['2'],
  },
  heroPrice: {
    fontSize: 48,
    fontWeight: fontWeight.bold,
    color: colors.text.inverted,
    letterSpacing: -1,
  },
  heroOriginal: {
    fontSize: 15,
    color: colors.text.invertedMuted,
    textDecorationLine: 'line-through',
    marginTop: spacing['1'],
  },
  heroBreakdown: {
    fontSize: 13,
    color: colors.text.invertedMuted,
    marginTop: spacing['2'],
  },

  content: { paddingHorizontal: H, paddingTop: spacing['6'] },

  sectionLabel: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
    letterSpacing: 11 * 0.08,
    marginBottom: spacing['3'],
    marginTop: spacing['4'],
  },

  benefitsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing['5'],
    ...shadows.card,
    marginBottom: spacing['2'],
  },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing['3'], marginBottom: spacing['3'] },
  benefitCheck: { fontSize: 14, color: colors.success, fontWeight: fontWeight.bold, marginTop: 2 },
  benefitText: { fontSize: 15, color: colors.text.primary, flex: 1, lineHeight: 22 },

  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'], marginBottom: spacing['2'] },
  methodChip: {
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['5'],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
  },
  methodChipActive: { backgroundColor: colors.text.primary, borderColor: colors.text.primary },
  methodText: { fontSize: 14, color: colors.text.secondary, fontWeight: fontWeight.medium },
  methodTextActive: { color: colors.text.inverted },

  promoToggle: { paddingVertical: spacing['3'] },
  promoToggleText: { fontSize: 14, color: colors.accent.text, fontWeight: fontWeight.medium },
  promoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing['2'] },
  promoInput: { flex: 1, marginBottom: 0 },
  promoBtn: { height: 56, paddingHorizontal: spacing['5'] },
  promoSuccess: { fontSize: 13, color: colors.success, fontWeight: fontWeight.medium, marginTop: spacing['2'], marginBottom: spacing['2'] },

  termsText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: spacing['6'],
    marginBottom: spacing['4'],
  },
  termsLink: { color: colors.accent.text },

  payButton: { marginBottom: spacing['4'] },
});
