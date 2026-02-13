import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';

const H = 24;

interface Props { navigation: NativeStackNavigationProp<RootStackParamList, 'QRHelp'>; }

const STEPS = [
  { text: 'Increase screen brightness to maximum' },
  { text: 'Make sure your screen is clean' },
  { text: 'Hold your phone steady while cashier scans' },
  { text: 'If problem persists, show Member ID manually' },
];

export default function QRHelpScreen({ navigation }: Props) {
  const { membership } = useAuth();

  return (
    <View style={styles.screen}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backIcon}>{'\u2039'}</Text></TouchableOpacity>
        <Text style={styles.navTitle}>QR Help</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>QR code not scanning?</Text>
        <Text style={styles.subheadline}>Try these steps</Text>

        <View style={styles.stepsCard}>
          {STEPS.map((item, i) => (
            <View key={i}>
              <View style={styles.stepRow}>
                <View style={styles.stepCircle}><Text style={styles.stepNum}>{i + 1}</Text></View>
                <Text style={styles.stepText}>{item.text}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={styles.idCard}>
          <Text style={styles.idEyebrow}>YOUR MEMBER ID</Text>
          <Text style={styles.idValue}>{membership?.member_id || 'MUM-XXXXX'}</Text>
          <Text style={styles.idHint}>Show this to the cashier for manual entry</Text>
        </View>

        <TouchableOpacity style={styles.supportLink} onPress={() => Linking.openURL('tel:111-686876')}>
          <Text style={styles.supportText}>Still having issues? Call 111-MUMUSO</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: H, paddingTop: 56, paddingBottom: spacing['2'] },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: colors.text.primary },
  navTitle: { fontSize: 17, fontWeight: fontWeight.semibold, color: colors.text.primary },

  content: { paddingHorizontal: H, paddingTop: spacing['6'] },

  headline: { fontSize: 26, fontWeight: fontWeight.semibold, color: colors.text.primary, letterSpacing: -0.3 },
  subheadline: { fontSize: 15, color: colors.text.secondary, marginTop: spacing['1'], marginBottom: spacing['6'] },

  stepsCard: { backgroundColor: colors.surface, borderRadius: radius.xl, paddingHorizontal: spacing['5'], ...shadows.card, marginBottom: spacing['6'] },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['4'], paddingVertical: spacing['4'] },
  stepCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 15, fontWeight: fontWeight.semibold, color: colors.text.primary },
  stepText: { flex: 1, fontSize: 15, color: colors.text.primary, lineHeight: 22 },
  divider: { height: 1, backgroundColor: colors.border.subtle },

  idCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceDark,
    borderRadius: radius['2xl'],
    padding: spacing['6'],
    marginBottom: spacing['6'],
    ...shadows.membership,
  },
  idEyebrow: { fontSize: 10, fontWeight: fontWeight.medium, color: colors.text.invertedMuted, letterSpacing: 10 * 0.14, marginBottom: spacing['2'] },
  idValue: { fontSize: 28, fontWeight: fontWeight.bold, color: colors.text.inverted, letterSpacing: 3 },
  idHint: { fontSize: 13, color: colors.text.invertedMuted, textAlign: 'center', marginTop: spacing['3'] },

  supportLink: { alignItems: 'center', paddingVertical: spacing['4'] },
  supportText: { fontSize: 14, color: colors.accent.text, fontWeight: fontWeight.medium },
});
