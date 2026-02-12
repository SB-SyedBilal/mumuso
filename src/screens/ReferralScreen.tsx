import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { MOCK_REFERRAL_STATS } from '../services/mockData';
import { formatDate } from '../utils';
import Card from '../components/Card';
import Button from '../components/Button';

interface Props { navigation: NativeStackNavigationProp<RootStackParamList, 'ReferralScreen'>; }

export default function ReferralScreen({ navigation }: Props) {
  const stats = MOCK_REFERRAL_STATS;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>{'\u2190'} Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}><Text style={{ fontSize: 48 }}>{'\u{1F91D}'}</Text><Text style={styles.heroTitle}>Refer Friends & Earn</Text><Text style={styles.heroSub}>Give Rs. 200 off, Get 1 month free extension</Text></View>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}><Text style={styles.statVal}>{stats.friends_referred}</Text><Text style={styles.statLabel}>Referred</Text></Card>
          <Card style={styles.statCard}><Text style={styles.statVal}>{stats.months_earned}</Text><Text style={styles.statLabel}>Months Earned</Text></Card>
          <Card style={styles.statCard}><Text style={styles.statVal}>{stats.pending_referrals}</Text><Text style={styles.statLabel}>Pending</Text></Card>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Your Referral Code</Text>
          <Card style={styles.codeCard} variant="elevated">
            <Text style={styles.codeText}>{stats.referral_code}</Text>
            <Button title="Copy Code" onPress={() => Alert.alert('Referral Code', `Your code: ${stats.referral_code}\n\nClipboard copy coming soon.`)} variant="primary" size="small" />
          </Card>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Share Via</Text>
          <View style={styles.shareRow}>
            {[{ label: 'WhatsApp', icon: '\u{1F4F1}' }, { label: 'SMS', icon: '\u{1F4AC}' }, { label: 'Email', icon: '\u{2709}' }, { label: 'Copy', icon: '\u{1F517}' }].map(o => (
              <TouchableOpacity key={o.label} style={styles.shareBtn} onPress={() => Alert.alert('Coming Soon', `Sharing via ${o.label} will be available soon.`)}>
                <Text style={{ fontSize: 24 }}>{o.icon}</Text><Text style={styles.shareLabel}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Referral History</Text>
          {stats.referrals.map(ref => (
            <Card key={ref.id} style={{ marginBottom: spacing.sm + 2 }} variant="outlined">
              <View style={styles.refRow}>
                <View><Text style={styles.refName}>{ref.referred_name}</Text><Text style={styles.refDate}>{formatDate(ref.date_referred)}</Text></View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={[styles.refBadge, ref.status === 'completed' ? styles.completedBadge : styles.pendingBadge]}>
                    <Text style={[styles.refBadgeText, ref.status === 'completed' ? { color: '#065F46' } : { color: '#92400E' }]}>{ref.status === 'completed' ? 'Completed' : 'Pending'}</Text>
                  </View>
                  {ref.reward_earned && <Text style={styles.refReward}>{ref.reward_earned}</Text>}
                </View>
              </View>
            </Card>
          ))}
        </View>
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
  hero: { alignItems: 'center', paddingVertical: spacing.xl, backgroundColor: colors.primary[600], borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  heroTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: '#ffffff', marginTop: spacing.md },
  heroSub: { fontSize: fontSize.md, color: colors.primary[200], marginTop: spacing.xs },
  statsRow: { flexDirection: 'row', gap: spacing.sm + 2, paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statVal: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.primary[600] },
  statLabel: { fontSize: fontSize.xs, color: colors.text.secondary, marginTop: spacing.xs, textAlign: 'center' },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.md },
  codeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primary[50], borderWidth: 2, borderColor: colors.primary[200] },
  codeText: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary[700], letterSpacing: 2 },
  shareRow: { flexDirection: 'row', gap: spacing.md },
  shareBtn: { flex: 1, alignItems: 'center', backgroundColor: '#ffffff', paddingVertical: spacing.md, borderRadius: borderRadius.lg, elevation: 2 },
  shareLabel: { fontSize: fontSize.xs, color: colors.text.secondary, fontWeight: fontWeight.medium, marginTop: spacing.xs },
  refRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  refName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text.primary },
  refDate: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 2 },
  refBadge: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm + 2, borderRadius: borderRadius.full },
  completedBadge: { backgroundColor: '#D1FAE5' },
  pendingBadge: { backgroundColor: '#FEF3C7' },
  refBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  refReward: { fontSize: fontSize.xs, color: colors.success, fontWeight: fontWeight.medium, marginTop: 2 },
});
