import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import { formatDate, getDaysRemaining } from '../utils';
import Card from '../components/Card';
import Button from '../components/Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MyCardScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function MyCardScreen({ navigation }: MyCardScreenProps) {
  const { user, membership } = useAuth();
  const [showBack, setShowBack] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const daysRemaining = membership ? getDaysRemaining(membership.expiry_date) : 0;
  const isExpired = membership?.status !== 'active' || daysRemaining <= 0;

  // NOTE: QR code rendering uses react-native-qrcode-svg.
  // If the library fails to load, we show a text-based fallback.
  let QRCode: any = null;
  try { QRCode = require('react-native-qrcode-svg').default; } catch (e) { /* fallback */ }

  const renderQR = (size: number) => {
    if (isExpired) {
      return (
        <View style={[styles.qrPlaceholder, { width: size, height: size }]}>
          <Text style={styles.expiredOverlay}>EXPIRED</Text>
        </View>
      );
    }
    if (QRCode && membership?.qr_code_data) {
      return <QRCode value={membership.qr_code_data} size={size} backgroundColor="transparent" />;
    }
    return (
      <View style={[styles.qrPlaceholder, { width: size, height: size }]}>
        <Text style={styles.qrFallbackText}>{membership?.member_id || 'MUM-XXXXX'}</Text>
        <Text style={styles.qrFallbackSub}>QR Code</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Card</Text>
        <TouchableOpacity onPress={() => setShowBack(!showBack)}>
          <Text style={styles.flipText}>{showBack ? 'Show Front' : 'Show Back'}</Text>
        </TouchableOpacity>
      </View>

      {!showBack ? (
        <View style={styles.cardFront}>
          <Text style={styles.cardBrand}>MUMUSO</Text>
          <TouchableOpacity onPress={() => !isExpired && setShowQRModal(true)} style={styles.qrContainer}>
            {renderQR(180)}
            {!isExpired && <Text style={styles.tapHint}>Tap to enlarge</Text>}
          </TouchableOpacity>
          <Text style={styles.cardName}>{user?.full_name || 'Member'}</Text>
          <Text style={styles.cardId}>{membership?.member_id || 'MUM-XXXXX'}</Text>
          <View style={styles.cardFooter}>
            <View style={[styles.statusBadge, isExpired ? styles.expiredBadge : styles.activeBadge]}>
              <Text style={[styles.statusText, isExpired ? styles.expiredText : styles.activeText]}>
                {isExpired ? 'EXPIRED' : 'ACTIVE'}
              </Text>
            </View>
            <Text style={styles.validText}>Valid until {membership ? formatDate(membership.expiry_date) : 'N/A'}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.cardBack}>
          <Text style={styles.cardBrand}>MUMUSO</Text>
          <Text style={styles.backTitle}>Member Benefits</Text>
          {['10% discount on all purchases', 'Valid at all Mumuso stores', 'Digital receipt tracking', 'Member-only promotions'].map((b, i) => (
            <Text key={i} style={styles.backBenefit}>{'\u2022'} {b}</Text>
          ))}
          <View style={styles.backContact}>
            <Text style={styles.backContactTitle}>Customer Support</Text>
            <Text style={styles.backContactText}>111-MUMUSO (686876)</Text>
            <Text style={styles.backContactText}>support@mumuso.com.pk</Text>
          </View>
        </View>
      )}

      {isExpired && (
        <Button title="Renew Membership" onPress={() => navigation.navigate('RenewalScreen')} variant="primary" size="large" style={styles.renewButton} />
      )}

      <TouchableOpacity style={styles.helpLink} onPress={() => navigation.navigate('QRHelp')}>
        <Text style={styles.helpText}>QR code not scanning? Get help</Text>
      </TouchableOpacity>

      {/* QR Modal */}
      <Modal visible={showQRModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowQRModal(false)}>
          <View style={styles.modalContent}>
            {renderQR(SCREEN_WIDTH - 100)}
            <Text style={styles.modalId}>{membership?.member_id}</Text>
            <Text style={styles.modalHint}>Show this to the cashier</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, backgroundColor: '#ffffff' },
  headerTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary },
  flipText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  cardFront: { marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.xl, borderRadius: borderRadius.lg + 4, backgroundColor: '#ffffff', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  cardBack: { marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.xl, borderRadius: borderRadius.lg + 4, backgroundColor: colors.primary[600], shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  cardBrand: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, letterSpacing: 4, color: colors.primary[600], marginBottom: spacing.lg },
  qrContainer: { alignItems: 'center', marginBottom: spacing.lg },
  qrPlaceholder: { backgroundColor: colors.neutral[100], borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  expiredOverlay: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.error, transform: [{ rotate: '-15deg' }] },
  qrFallbackText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  qrFallbackSub: { fontSize: fontSize.sm, color: colors.text.secondary },
  tapHint: { fontSize: fontSize.xs, color: colors.text.secondary, marginTop: spacing.xs },
  cardName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  cardId: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold, marginTop: spacing.xs, letterSpacing: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: spacing.lg },
  statusBadge: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: borderRadius.full },
  activeBadge: { backgroundColor: '#D1FAE5' },
  expiredBadge: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  activeText: { color: '#065F46' },
  expiredText: { color: '#991B1B' },
  validText: { fontSize: fontSize.sm, color: colors.text.secondary },
  backTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: '#ffffff', marginBottom: spacing.md },
  backBenefit: { fontSize: fontSize.md, color: colors.primary[100], marginBottom: spacing.sm, lineHeight: 22 },
  backContact: { marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.primary[500] },
  backContactTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: '#ffffff', marginBottom: spacing.sm },
  backContactText: { fontSize: fontSize.sm, color: colors.primary[200], marginBottom: 2 },
  renewButton: { marginHorizontal: spacing.lg, marginTop: spacing.lg, borderRadius: borderRadius.lg },
  helpLink: { alignItems: 'center', marginTop: spacing.lg },
  helpText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center' },
  modalContent: { backgroundColor: '#ffffff', borderRadius: borderRadius.lg + 4, padding: spacing.xl, alignItems: 'center' },
  modalId: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary[600], marginTop: spacing.md, letterSpacing: 2 },
  modalHint: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: spacing.sm },
});
