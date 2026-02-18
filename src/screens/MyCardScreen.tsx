import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList, QRTokenResponse } from '../types';
import { useAuth } from '../services/AuthContext';
import { formatDate } from '../utils';
import { api } from '../services/apiClient';
import Button from '../components/Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MyCardScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function MyCardScreen({ navigation }: MyCardScreenProps) {
  const { user, dashboard } = useAuth();
  const [showBack, setShowBack] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const daysRemaining = dashboard?.days_remaining || 0;
  const isExpired = dashboard?.status !== 'active' || daysRemaining <= 0;

  const fetchQRToken = useCallback(async () => {
    if (isExpired) return;
    const res = await api.get<QRTokenResponse>('/member/qr-token');
    if (res.success && res.data) {
      setQrData(res.data.token);
      // Auto-refresh before expiry
      const expiresIn = (res.data.expires_at * 1000) - Date.now() - 5000;
      if (expiresIn > 0) setTimeout(fetchQRToken, expiresIn);
    }
  }, [isExpired]);

  useEffect(() => { fetchQRToken(); }, [fetchQRToken]);

  let QRCode: any = null;
  try { QRCode = require('react-native-qrcode-svg').default; } catch (e) { /* fallback */ }

  const renderQR = (size: number) => {
    if (isExpired) {
      return (
        <View style={[styles.qrContainer, { width: size, height: size }]}>
          <Text style={styles.expiredStamp}>EXPIRED</Text>
        </View>
      );
    }
    if (QRCode && qrData) {
      return (
        <View style={[styles.qrContainer, { width: size, height: size }]}>
          <QRCode value={qrData} size={size - 32} backgroundColor="#FFFFFF" />
        </View>
      );
    }
    return (
      <View style={[styles.qrContainer, { width: size, height: size }]}>
        <Text style={styles.qrFallbackId}>{dashboard?.member_id || 'MUM-XXXXX'}</Text>
        <Text style={styles.qrFallbackSub}>QR Code</Text>
      </View>
    );
  };

  const handleCardTap = () => {
    if (showBack) {
      setShowBack(false);
    } else {
      setShowBack(true);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>{'\u2039'}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Card</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Card */}
      <View style={styles.cardArea}>
        {!showBack ? (
          // FRONT
          <TouchableOpacity style={styles.card} onPress={handleCardTap} activeOpacity={0.95}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardLabel}>MUMUSO MEMBER</Text>
              <View style={[styles.statusBadge, isExpired ? styles.statusExpired : styles.statusActive]}>
                {!isExpired && <View style={styles.statusDot} />}
                <Text style={[styles.statusText, isExpired ? styles.statusExpiredText : styles.statusActiveText]}>
                  {isExpired ? 'EXPIRED' : 'ACTIVE'}
                </Text>
              </View>
            </View>
            <Text style={styles.cardName}>{user?.full_name || 'Member'}</Text>
            <View style={styles.cardBottomRow}>
              <Text style={styles.cardId}>{dashboard?.member_id?.replace('-', ' \u00B7 ') || 'MUM \u00B7 XXXXX'}</Text>
              <View style={styles.cardValidCol}>
                <Text style={styles.cardValidLabel}>VALID UNTIL</Text>
                <Text style={styles.cardValidDate}>{dashboard?.expiry_date ? formatDate(dashboard.expiry_date) : 'N/A'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          // BACK — QR
          <TouchableOpacity style={styles.card} onPress={handleCardTap} activeOpacity={0.95}>
            <View style={styles.qrBackCenter}>
              {renderQR(160)}
              <Text style={styles.qrMemberId}>{dashboard?.member_id || 'MUM-XXXXX'}</Text>
              <Text style={styles.showToCashier}>SHOW TO CASHIER</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {showBack && !isExpired && (
        <Text style={styles.holdSteady}>Hold steady \u00B7 Cashier will scan</Text>
      )}

      {/* Ghost buttons */}
      <View style={styles.actionsRow}>
        {/* NOT SUPPORTED YET: Save Photo requires react-native-view-shot + media library permissions */}
        <TouchableOpacity style={styles.ghostButton} activeOpacity={0.7}>
          <Text style={styles.ghostButtonText}>Save Photo</Text>
        </TouchableOpacity>
        {/* NOT SUPPORTED YET: Add to Wallet requires Apple/Google Wallet SDK */}
        <TouchableOpacity style={styles.ghostButton} activeOpacity={0.7}>
          <Text style={styles.ghostButtonText}>Add to Wallet</Text>
        </TouchableOpacity>
        {/* NOT SUPPORTED YET: Share requires react-native-share */}
        <TouchableOpacity style={styles.ghostButton} activeOpacity={0.7}>
          <Text style={styles.ghostButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      {isExpired && (
        <Button
          title="Renew Membership"
          onPress={() => navigation.navigate('RenewalScreen')}
          variant="gold"
          style={styles.renewButton}
        />
      )}

      <View style={styles.bottomArea}>
        <TouchableOpacity onPress={() => navigation.navigate('QRHelp')}>
          <Text style={styles.helpText}>QR not scanning? Get help</Text>
        </TouchableOpacity>
      </View>

      {/* Full-screen QR Modal */}
      <Modal visible={showQRModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowQRModal(false)}>
          <View style={styles.modalContent}>
            {renderQR(SCREEN_WIDTH - 100)}
            <Text style={styles.modalId}>{dashboard?.member_id}</Text>
            <Text style={styles.modalHint}>Show this to the cashier</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0F0F0F' },

  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['6'],
    paddingTop: 56,
    paddingBottom: spacing['4'],
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: colors.text.inverted },
  navTitle: { fontSize: 17, fontWeight: fontWeight.semibold, color: colors.text.inverted },

  cardArea: {
    alignItems: 'center',
    paddingHorizontal: spacing['6'],
    marginTop: spacing['4'],
  },
  card: {
    width: SCREEN_WIDTH - 48,
    height: 208,
    borderRadius: radius['2xl'],
    backgroundColor: colors.surfaceDark,
    padding: spacing['6'],
    justifyContent: 'space-between',
    ...shadows.membership,
    borderWidth: 1,
    borderColor: '#3A3A3E',
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: {
    fontSize: 10,
    fontWeight: fontWeight.medium,
    color: colors.text.invertedMuted,
    letterSpacing: 10 * 0.14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  statusActive: { backgroundColor: 'rgba(74,155,127,0.12)' },
  statusExpired: { backgroundColor: 'rgba(192,84,74,0.10)' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: fontWeight.semibold },
  statusActiveText: { color: colors.success },
  statusExpiredText: { color: colors.error },
  cardName: { fontSize: 26, fontWeight: fontWeight.semibold, color: colors.text.inverted },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardId: { fontSize: 12, color: '#6B6361', letterSpacing: 0.5 },
  cardValidCol: { alignItems: 'flex-end' },
  cardValidLabel: { fontSize: 10, color: colors.text.invertedMuted, letterSpacing: 10 * 0.06 },
  cardValidDate: { fontSize: 14, color: colors.text.invertedMuted, marginTop: 2 },

  // QR back
  qrBackCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing['4'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiredStamp: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.error,
    transform: [{ rotate: '-15deg' }],
    opacity: 0.85,
  },
  qrFallbackId: { fontSize: 16, fontWeight: fontWeight.bold, color: colors.text.primary },
  qrFallbackSub: { fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  qrMemberId: { fontSize: 14, color: colors.text.invertedMuted, marginTop: spacing['3'], letterSpacing: 0.5 },
  showToCashier: {
    fontSize: 10,
    fontWeight: fontWeight.medium,
    color: colors.accent.default,
    letterSpacing: 10 * 0.14,
    marginTop: spacing['2'],
  },
  holdSteady: {
    fontSize: 13,
    color: colors.text.invertedMuted,
    textAlign: 'center',
    marginTop: spacing['4'],
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['3'],
    paddingHorizontal: spacing['6'],
    marginTop: spacing['12'],
  },
  ghostButton: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#3A3A3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: { fontSize: 13, fontWeight: fontWeight.medium, color: colors.text.inverted },

  renewButton: {
    marginHorizontal: spacing['6'],
    marginTop: spacing['6'],
  },

  bottomArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing['10'],
  },
  helpText: { fontSize: 12, color: '#6B6361', textAlign: 'center' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center' },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: radius.lg, padding: spacing['6'], alignItems: 'center' },
  modalId: { fontSize: 18, fontWeight: fontWeight.bold, color: colors.text.primary, marginTop: spacing['4'], letterSpacing: 1 },
  modalHint: { fontSize: 13, color: colors.text.secondary, marginTop: spacing['2'] },
});
