import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import Button from '../components/Button';

const H = 24;

interface Props { navigation: NativeStackNavigationProp<RootStackParamList, 'HelpSupport'>; }

const FAQ = [
  { q: 'How do I use my membership card?', a: 'Open the app, go to "My Card" tab, and show the QR code to the cashier at checkout.' },
  { q: 'What if my QR code doesn\'t scan?', a: 'Try increasing screen brightness. If it still doesn\'t work, show your Member ID for manual entry.' },
  { q: 'How do I renew my membership?', a: 'Go to Profile > Renew Membership, or you\'ll see a renewal prompt when expiring.' },
  { q: 'Can I share my membership?', a: 'No, memberships are personal and tied to your phone number.' },
];

export default function HelpSupportScreen({ navigation }: Props) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [issueDesc, setIssueDesc] = useState('');

  return (
    <View style={styles.screen}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Help & Support</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Contact */}
        <Text style={styles.sectionLabel}>CONTACT US</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('tel:111-686876').catch(() => { })}>
            <Text style={styles.contactTitle}>Phone</Text>
            <Text style={styles.contactSub}>111-MUMUSO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('mailto:support@mumuso.com.pk').catch(() => { })}>
            <Text style={styles.contactTitle}>Email</Text>
            <Text style={styles.contactSub}>support@mumuso.com.pk</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <Text style={styles.sectionLabel}>FREQUENTLY ASKED</Text>
        <View style={styles.faqCard}>
          {FAQ.map((item, i) => (
            <View key={i}>
              <TouchableOpacity style={styles.faqRow} onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                <Text style={styles.faqQ}>{item.q}</Text>
                <Ionicons
                  name={expandedFaq === i ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.text.tertiary}
                />
              </TouchableOpacity>
              {expandedFaq === i && <Text style={styles.faqA}>{item.a}</Text>}
              {i < FAQ.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Report */}
        <Text style={styles.sectionLabel}>REPORT A PROBLEM</Text>
        {!showReport ? (
          <Button title="Report a Problem" onPress={() => setShowReport(true)} variant="secondary" />
        ) : (
          <View style={styles.reportCard}>
            <Text style={styles.fieldLabel}>Issue type</Text>
            <View style={styles.chipRow}>
              {['Discount not applied', 'QR code issue', 'Payment problem', 'App bug', 'Other'].map(t => (
                <TouchableOpacity key={t} style={[styles.chip, issueType === t && styles.chipActive]} onPress={() => setIssueType(t)}>
                  <Text style={[styles.chipText, issueType === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.fieldLabel, { marginTop: spacing['4'] }]}>Description</Text>
            <TextInput style={styles.textArea} placeholder="Describe your issue..." placeholderTextColor={colors.text.tertiary} value={issueDesc} onChangeText={setIssueDesc} multiline numberOfLines={4} textAlignVertical="top" />
            <View style={styles.formActions}>
              <Button title="Cancel" onPress={() => setShowReport(false)} variant="text" />
              <Button title="Submit" onPress={() => {
                if (!issueType || !issueDesc) { Alert.alert('Required', 'Please fill in all fields.'); return; }
                // NOT SUPPORTED YET: Real issue reporting requires backend API.
                Alert.alert('Submitted', 'Our team will get back to you within 24 hours.');
                setShowReport(false); setIssueType(''); setIssueDesc('');
              }} variant="primary" />
            </View>
          </View>
        )}

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
  content: { paddingHorizontal: H },

  sectionLabel: { fontSize: 11, fontWeight: fontWeight.medium, color: colors.text.tertiary, letterSpacing: 11 * 0.08, marginBottom: spacing['3'], marginTop: spacing['6'] },

  contactRow: { flexDirection: 'row', gap: spacing['3'] },
  contactCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing['5'], alignItems: 'center', ...shadows.card },
  contactTitle: { fontSize: 15, fontWeight: fontWeight.semibold, color: colors.text.primary, marginBottom: spacing['1'] },
  contactSub: { fontSize: 12, color: colors.text.tertiary, textAlign: 'center' },

  faqCard: { backgroundColor: colors.surface, borderRadius: radius.xl, paddingHorizontal: spacing['5'], ...shadows.card },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: spacing['4'] },
  faqQ: { fontSize: 15, fontWeight: fontWeight.medium, color: colors.text.primary, flex: 1, marginRight: spacing['3'] },
  faqChevron: { fontSize: 14, color: colors.text.tertiary },
  faqA: { fontSize: 14, color: colors.text.secondary, lineHeight: 22, paddingBottom: spacing['4'] },
  divider: { height: 1, backgroundColor: colors.border.subtle },

  reportCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing['5'], ...shadows.card },
  fieldLabel: { fontSize: 11, fontWeight: fontWeight.medium, color: colors.text.tertiary, letterSpacing: 11 * 0.08, marginBottom: spacing['2'] },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] },
  chip: { paddingVertical: spacing['2'], paddingHorizontal: spacing['4'], borderRadius: radius.full, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border.subtle },
  chipActive: { backgroundColor: colors.text.primary, borderColor: colors.text.primary },
  chipText: { fontSize: 13, color: colors.text.secondary, fontWeight: fontWeight.medium },
  chipTextActive: { color: colors.text.inverted },
  textArea: { borderWidth: 1.5, borderColor: colors.border.subtle, borderRadius: radius.md, padding: spacing['4'], fontSize: 15, color: colors.text.primary, minHeight: 100, backgroundColor: colors.canvas },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing['2'], marginTop: spacing['4'] },
});
