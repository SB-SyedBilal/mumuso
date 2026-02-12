import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>{'\u2190'} Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}><Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('tel:111-686876').catch(() => {})}><Text style={{ fontSize: 28 }}>{'\u{1F4DE}'}</Text><Text style={styles.contactLabel}>Phone</Text><Text style={styles.contactSub}>111-MUMUSO</Text></TouchableOpacity>
            <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('mailto:support@mumuso.com.pk').catch(() => {})}><Text style={{ fontSize: 28 }}>{'\u{2709}'}</Text><Text style={styles.contactLabel}>Email</Text><Text style={styles.contactSub}>support@mumuso.com.pk</Text></TouchableOpacity>
          </View>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>FAQ</Text>
          {FAQ.map((item, i) => (
            <TouchableOpacity key={i} style={styles.faqItem} onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}>
              <View style={styles.faqHeader}><Text style={styles.faqQ}>{item.q}</Text><Text style={{ fontSize: 10, color: colors.neutral[400] }}>{expandedFaq === i ? '\u25B2' : '\u25BC'}</Text></View>
              {expandedFaq === i && <Text style={styles.faqA}>{item.a}</Text>}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Report a Problem</Text>
          {!showReport ? <Button title="Report a Problem" onPress={() => setShowReport(true)} variant="secondary" size="medium" /> : (
            <Card variant="outlined">
              <Text style={styles.formLabel}>Issue Type</Text>
              <View style={styles.chipRow}>
                {['Discount not applied', 'QR code issue', 'Payment problem', 'App bug', 'Other'].map(t => (
                  <TouchableOpacity key={t} style={[styles.chip, issueType === t && styles.chipActive]} onPress={() => setIssueType(t)}>
                    <Text style={[styles.chipText, issueType === t && { color: '#ffffff' }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput style={styles.textArea} placeholder="Describe your issue..." placeholderTextColor={colors.neutral[400]} value={issueDesc} onChangeText={setIssueDesc} multiline numberOfLines={4} textAlignVertical="top" />
              <View style={styles.formActions}>
                <Button title="Cancel" onPress={() => setShowReport(false)} variant="text" size="small" />
                <Button title="Submit" onPress={() => { if (!issueType || !issueDesc) { Alert.alert('Error', 'Please fill in all fields.'); return; } Alert.alert('Submitted', 'Our team will get back to you within 24 hours.'); setShowReport(false); setIssueType(''); setIssueDesc(''); }} variant="primary" size="small" />
              </View>
            </Card>
          )}
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
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.md },
  contactGrid: { flexDirection: 'row', gap: spacing.sm + 2 },
  contactCard: { flex: 1, backgroundColor: '#ffffff', borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', elevation: 2 },
  contactLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text.primary, marginTop: spacing.sm },
  contactSub: { fontSize: fontSize.xs, color: colors.text.secondary, marginTop: 2, textAlign: 'center' },
  faqItem: { backgroundColor: '#ffffff', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.neutral[100] },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  faqQ: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text.primary, flex: 1, marginRight: spacing.sm },
  faqA: { fontSize: fontSize.sm, color: colors.text.secondary, lineHeight: 22, marginTop: spacing.sm },
  formLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.sm, marginTop: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md, borderRadius: borderRadius.full, backgroundColor: colors.neutral[100] },
  chipActive: { backgroundColor: colors.primary[600] },
  chipText: { fontSize: fontSize.sm, color: colors.text.secondary },
  textArea: { borderWidth: 1, borderColor: colors.neutral[200], borderRadius: borderRadius.md, padding: spacing.md, fontSize: fontSize.md, color: colors.text.primary, minHeight: 100 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
});
