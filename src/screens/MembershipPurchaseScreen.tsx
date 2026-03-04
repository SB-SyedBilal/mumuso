import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList, MembershipPlan } from '../types';
import { useAuth } from '../services/AuthContext';
import { formatCurrency } from '../utils';
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
  const { fetchPlans, createMembershipOrder } = useAuth();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    const load = async () => {
      const result = await fetchPlans();
      if (result.success && result.plans) {
        setPlans(result.plans);
        setSelectedPlan(result.plans[0] || null);
      }
      setLoading(false);
    };
    load();
  }, []);

  const finalAmount = (selectedPlan?.price || 0) - promoDiscount;
  const monthlyBreakdown = Math.round(finalAmount / (selectedPlan?.duration_months || 12));
  const breakEvenSpend = Math.round(finalAmount / 0.1);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setPromoDiscount(200);
      setPromoApplied(true);
    } else {
      Alert.alert('Invalid code', 'This promo code is not valid or has expired.');
      setPromoApplied(false);
      setPromoDiscount(0);
    }
  };

  const handleProceed = async () => {
    if (!selectedMethod) { Alert.alert('Select payment', 'Please choose a payment method'); return; }
    if (!selectedPlan) { Alert.alert('Error', 'No plan selected'); return; }
    setLoading(true);
    const result = await createMembershipOrder(selectedPlan.id);
    setLoading(false);
    if (result.success && result.data) {
      navigation.navigate('PaymentProcessing', { method: selectedMethod, amount: finalAmount, payment_id: result.data.payment_id, gateway_token: result.data.gateway_token });
    } else {
      Alert.alert('Error', result.error || 'Failed to create order');
    }
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator size="large" color={colors.accent.default} style={{ marginTop: 100 }} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.inverted} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Upgrade</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.heroZone}>
        <Text style={styles.heroLabel}>ANNUAL MEMBERSHIP</Text>
        <Text style={styles.heroPrice}>{formatCurrency(finalAmount)}</Text>
        {promoApplied && <Text style={styles.heroOriginal}>Was {formatCurrency((selectedPlan?.price || 0))}</Text>}
        <Text style={styles.heroBreakdown}>Just {formatCurrency(monthlyBreakdown)}/month \u2022 Break even at {formatCurrency(breakEvenSpend)}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Benefits */}
        <Text style={styles.sectionLabel}>WHAT YOU GET</Text>
        <View style={styles.benefitsCard}>
          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
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
        {promoApplied && <Text style={styles.promoSuccess}><Ionicons name="checkmark" size={16} /> Promo applied \u2014 you save {formatCurrency(promoDiscount)}</Text>}

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
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: H,
    paddingTop: 56,
    paddingBottom: spacing['4'],
    backgroundColor: colors.surfaceDarker,
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -spacing['2'] },
  navTitle: { fontSize: 17, fontWeight: fontWeight.semibold, color: colors.text.inverted },

  heroZone: {
    backgroundColor: colors.surfaceDarker,
    paddingHorizontal: H,
    paddingTop: spacing['2'],
    paddingBottom: spacing['8'],
    borderBottomLeftRadius: radius['3xl'],
    borderBottomRightRadius: radius['3xl'],
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.accent.default,
    letterSpacing: 1.5,
    marginBottom: spacing['2'],
    textTransform: 'uppercase',
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
    fontWeight: fontWeight.medium,
  },

  content: { paddingHorizontal: H, paddingTop: spacing['6'] },

  sectionLabel: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.text.tertiary,
    letterSpacing: 1.2,
    marginBottom: spacing['3'],
    marginTop: spacing['4'],
    textTransform: 'uppercase',
  },

  benefitsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing['5'],
    ...shadows.card,
    marginBottom: spacing['2'],
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['3'], marginBottom: spacing['3'] },
  benefitText: { fontSize: 15, color: colors.text.primary, flex: 1, fontWeight: fontWeight.medium },

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
  promoToggleText: { fontSize: 14, color: colors.accent.text, fontWeight: fontWeight.bold },
  promoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing['2'] },
  promoInput: { flex: 1, marginBottom: 0 },
  promoBtn: { height: 56, paddingHorizontal: spacing['5'] },
  promoSuccess: { fontSize: 13, color: colors.success, fontWeight: fontWeight.bold, marginTop: spacing['2'], marginBottom: spacing['2'] },

  termsText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: spacing['6'],
    marginBottom: spacing['4'],
    fontWeight: fontWeight.medium,
  },
  termsLink: { color: colors.accent.text, fontWeight: fontWeight.bold },

  payButton: { marginBottom: spacing['4'] },
});
