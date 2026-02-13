import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { MOCK_REFERRAL_STATS } from '../services/mockData';
import { formatDate } from '../utils';
import Button from '../components/Button';

const H = 24;

interface Props { navigation: NativeStackNavigationProp<RootStackParamList, 'ReferralScreen'>; }

export default function ReferralScreen({ navigation }: Props) {
  const stats = MOCK_REFERRAL_STATS;

  return (
    <View style={styles.screen}>
      {/* Dark hero */}
      <View style={styles.heroZone}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backIcon}>{'\u2039'}</Text></TouchableOpacity>
        <Text style={styles.heroLabel}>REFER & EARN</Text>
        <Text style={styles.heroTitle}>Share the love</Text>
        <Text style={styles.heroSub}>Give Rs. 200 off, get 1 month free extension</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statTile}><Text style={styles.statEyebrow}>REFERRED</Text><Text style={styles.statVal}>{stats.friends_referred}</Text></View>
          <View style={styles.statTile}><Text style={styles.statEyebrow}>MONTHS</Text><Text style={styles.statValGold}>{stats.months_earned}</Text></View>
          <View style={styles.statTile}><Text style={styles.statEyebrow}>PENDING</Text><Text style={styles.statVal}>{stats.pending_referrals}</Text></View>
        </View>

        {/* Code */}
        <Text style={styles.sectionLabel}>YOUR CODE</Text>
        <View style={styles.codeCard}>
          <Text style={styles.codeText}>{stats.referral_code}</Text>
          <Button title="Copy" onPress={() => Alert.alert('Referral Code', `Your code: ${stats.referral_code}\n\nNOT SUPPORTED YET: Clipboard copy requires native integration.`)} variant="gold" style={styles.copyBtn} />
        </View>

        {/* Share */}
        <Text style={styles.sectionLabel}>SHARE VIA</Text>
        <View style={styles.shareRow}>
          {['WhatsApp', 'SMS', 'Email', 'Copy'].map(label => (
            <TouchableOpacity key={label} style={styles.shareChip} onPress={() => Alert.alert('Coming Soon', `NOT SUPPORTED YET: Sharing via ${label} requires native integration.`)}>
              <Text style={styles.shareChipText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* History */}
        <Text style={styles.sectionLabel}>HISTORY</Text>
        <View style={styles.historyCard}>
          {stats.referrals.map((ref, idx) => (
            <View key={ref.id}>
              <View style={styles.refRow}>
                <View>
                  <Text style={styles.refName}>{ref.referred_name}</Text>
                  <Text style={styles.refDate}>{formatDate(ref.date_referred)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={[styles.refBadge, ref.status === 'completed' ? styles.completedBadge : styles.pendingBadge]}>
                    <Text style={[styles.refBadgeText, ref.status === 'completed' ? styles.completedText : styles.pendingText]}>{ref.status === 'completed' ? 'Completed' : 'Pending'}</Text>
                  </View>
                  {ref.reward_earned && <Text style={styles.refReward}>{ref.reward_earned}</Text>}
                </View>
              </View>
              {idx < stats.referrals.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  heroZone: { backgroundColor: colors.surfaceDarker, paddingHorizontal: H, paddingTop: 56, paddingBottom: spacing['8'], borderBottomLeftRadius: radius['3xl'], borderBottomRightRadius: radius['3xl'] },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -spacing['2'], marginBottom: spacing['4'] },
  backIcon: { fontSize: 28, color: colors.text.inverted },
  heroLabel: { fontSize: 11, fontWeight: fontWeight.medium, color: colors.accent.default, letterSpacing: 11 * 0.14, marginBottom: spacing['2'] },
  heroTitle: { fontSize: 30, fontWeight: fontWeight.semibold, color: colors.text.inverted, letterSpacing: -0.3 },
  heroSub: { fontSize: 14, color: colors.text.invertedMuted, marginTop: spacing['2'] },

  content: { paddingHorizontal: H, paddingTop: spacing['6'] },

  statsRow: { flexDirection: 'row', gap: spacing['3'], marginBottom: spacing['6'] },
  statTile: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing['4'], ...shadows.card },
  statEyebrow: { fontSize: 10, fontWeight: fontWeight.medium, color: colors.text.tertiary, letterSpacing: 10 * 0.1, marginBottom: spacing['1'] },
  statVal: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.text.primary },
  statValGold: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.accent.text },

  sectionLabel: { fontSize: 11, fontWeight: fontWeight.medium, color: colors.text.tertiary, letterSpacing: 11 * 0.08, marginBottom: spacing['3'] },

  codeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing['5'], ...shadows.card, marginBottom: spacing['6'] },
  codeText: { fontSize: 22, fontWeight: fontWeight.bold, color: colors.text.primary, letterSpacing: 2 },
  copyBtn: { height: 40, paddingHorizontal: spacing['5'] },

  shareRow: { flexDirection: 'row', gap: spacing['2'], marginBottom: spacing['6'] },
  shareChip: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: spacing['3'], alignItems: 'center', ...shadows.card },
  shareChipText: { fontSize: 13, color: colors.text.secondary, fontWeight: fontWeight.medium },

  historyCard: { backgroundColor: colors.surface, borderRadius: radius.xl, paddingHorizontal: spacing['5'], ...shadows.card },
  refRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing['4'] },
  refName: { fontSize: 15, fontWeight: fontWeight.medium, color: colors.text.primary },
  refDate: { fontSize: 12, color: colors.text.tertiary, marginTop: 2 },
  refBadge: { paddingVertical: spacing['1'], paddingHorizontal: spacing['3'], borderRadius: radius.full },
  completedBadge: { backgroundColor: 'rgba(74,155,127,0.12)' },
  pendingBadge: { backgroundColor: 'rgba(200,169,110,0.12)' },
  refBadgeText: { fontSize: 11, fontWeight: fontWeight.semibold },
  completedText: { color: colors.success },
  pendingText: { color: colors.warning },
  refReward: { fontSize: 11, color: colors.accent.text, fontWeight: fontWeight.medium, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border.subtle },
});
