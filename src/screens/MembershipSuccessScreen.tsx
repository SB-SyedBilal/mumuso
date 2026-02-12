import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import { formatCurrency, formatDate } from '../utils';
import Card from '../components/Card';
import Button from '../components/Button';

interface MembershipSuccessScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MembershipSuccess'>;
}

export default function MembershipSuccessScreen({ navigation }: MembershipSuccessScreenProps) {
  const { membership } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('MainTabs'), 10000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.successIcon}>{'\u{1F389}'}</Text>
      <Text style={styles.title}>Welcome to Mumuso!</Text>
      <Text style={styles.subtitle}>Your membership is now active</Text>

      <Card style={styles.idCard} variant="elevated">
        <Text style={styles.idLabel}>Your Member ID</Text>
        <Text style={styles.idValue}>{membership?.member_id || 'MUM-XXXXX'}</Text>
      </Card>

      <Card style={styles.detailsCard} variant="outlined">
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Member Since</Text>
          <Text style={styles.detailValue}>{membership ? formatDate(membership.purchase_date) : 'Today'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Valid Until</Text>
          <Text style={styles.detailValue}>{membership ? formatDate(membership.expiry_date) : 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount Paid</Text>
          <Text style={styles.detailValue}>{formatCurrency(membership?.amount_paid || 2000)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Discount</Text>
          <Text style={styles.detailValue}>10% on all purchases</Text>
        </View>
      </Card>

      <Text style={styles.nextStepsTitle}>Next Steps</Text>
      {['Visit any Mumuso store', 'Show your QR code at checkout', 'Enjoy 10% off instantly!'].map((step, i) => (
        <View key={i} style={styles.stepRow}>
          <View style={styles.stepCircle}><Text style={styles.stepNum}>{i + 1}</Text></View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}

      <Button title="Go to Home" onPress={() => navigation.replace('MainTabs')} variant="primary" size="large" style={styles.homeButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { alignItems: 'center', padding: spacing.lg, paddingTop: 60, paddingBottom: 40 },
  successIcon: { fontSize: 64, marginBottom: spacing.md },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary, textAlign: 'center' },
  subtitle: { fontSize: fontSize.md, color: colors.success, fontWeight: fontWeight.semibold, marginTop: spacing.xs, marginBottom: spacing.lg },
  idCard: { width: '100%', alignItems: 'center', backgroundColor: colors.primary[50], borderWidth: 2, borderColor: colors.primary[200], marginBottom: spacing.lg },
  idLabel: { fontSize: fontSize.sm, color: colors.primary[600], fontWeight: fontWeight.semibold },
  idValue: { fontSize: 28, fontWeight: fontWeight.bold, color: colors.primary[700], letterSpacing: 3, marginTop: spacing.sm },
  detailsCard: { width: '100%', marginBottom: spacing.lg },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.neutral[50] },
  detailLabel: { fontSize: fontSize.sm, color: colors.text.secondary },
  detailValue: { fontSize: fontSize.sm, color: colors.text.primary, fontWeight: fontWeight.semibold },
  nextStepsTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary, alignSelf: 'flex-start', marginBottom: spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md, alignSelf: 'flex-start' },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary[100], alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary[600] },
  stepText: { fontSize: fontSize.md, color: colors.text.primary },
  homeButton: { width: '100%', marginTop: spacing.lg, borderRadius: borderRadius.lg },
});
