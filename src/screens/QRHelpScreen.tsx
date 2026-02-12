import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import Card from '../components/Card';

interface Props { navigation: NativeStackNavigationProp<RootStackParamList, 'QRHelp'>; }

export default function QRHelpScreen({ navigation }: Props) {
  const { membership } = useAuth();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>{'\u2190'} Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>QR Code Help</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>QR Code Not Scanning?</Text>
        <Text style={styles.subtitle}>Try these steps:</Text>
        {[
          { step: '1', text: 'Increase screen brightness to maximum', icon: '\u2600' },
          { step: '2', text: 'Make sure your screen is clean', icon: '\u2728' },
          { step: '3', text: 'Hold your phone steady while cashier scans', icon: '\u{1F4F1}' },
          { step: '4', text: 'If problem persists, show Member ID manually', icon: '\u{1F4CB}' },
        ].map(item => (
          <Card key={item.step} style={{ marginBottom: spacing.sm + 2 }} variant="outlined">
            <View style={styles.stepRow}>
              <View style={styles.stepCircle}><Text style={{ fontSize: 22 }}>{item.icon}</Text></View>
              <View style={{ flex: 1 }}><Text style={styles.stepNum}>Step {item.step}</Text><Text style={styles.stepText}>{item.text}</Text></View>
            </View>
          </Card>
        ))}
        <Card style={styles.idCard} variant="elevated">
          <Text style={styles.idLabel}>Your Member ID</Text>
          <Text style={styles.idValue}>{membership?.member_id || 'MUM-XXXXX'}</Text>
          <Text style={styles.idHint}>Show this ID to the cashier for manual entry</Text>
        </Card>
        <TouchableOpacity style={styles.supportLink} onPress={() => Linking.openURL('tel:111-686876')}>
          <Text style={{ fontSize: 18 }}>{'\u{1F4DE}'}</Text>
          <Text style={styles.supportText}>Still having issues? Call 111-MUMUSO</Text>
        </TouchableOpacity>
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
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.md, color: colors.text.secondary, marginBottom: spacing.lg },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary[50], alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: fontSize.xs, color: colors.primary[600], fontWeight: fontWeight.bold, marginBottom: 2 },
  stepText: { fontSize: fontSize.md, color: colors.text.primary, lineHeight: 22 },
  idCard: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.primary[50], borderWidth: 2, borderColor: colors.primary[200] },
  idLabel: { fontSize: fontSize.sm, color: colors.primary[600], fontWeight: fontWeight.semibold },
  idValue: { fontSize: 28, fontWeight: fontWeight.bold, color: colors.primary[700], letterSpacing: 3, marginVertical: spacing.sm },
  idHint: { fontSize: fontSize.sm, color: colors.primary[500], textAlign: 'center' },
  supportLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  supportText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
});
