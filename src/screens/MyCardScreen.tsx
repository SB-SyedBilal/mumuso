import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
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

  const renderQR = (size: number) => {
    if (isExpired) {
      return (
        <View style={[styles.qrContainer, { width: size, height: size }]}>
          <Text style={styles.expiredStamp}>EXPIRED</Text>
        </View>
      );
    }
    if (qrData) {
      let QRCode: any = null;
      try {
        QRCode = require('react-native-qrcode-svg').default;
      } catch (e) {
        console.warn('QR Code library not available:', e);
      }
      
      if (QRCode) {
        return (
          <View style={[styles.qrContainer, { width: size, height: size }]}>
            <QRCode value={qrData} size={size - 32} backgroundColor="#FFFFFF" color="#000000" />
          </View>
        );
      }
    }
    return (
      <View style={[styles.qrContainer, { width: size, height: size }]}>
        <Text style={styles.qrFallbackId}>{dashboard?.member_id || 'MUM-XXXXX'}</Text>
        <Text style={styles.qrFallbackSub}>QR Code</Text>
      </View>
    );
  };

  const handleCardTap = () => {
    setShowBack(!showBack);
  };

  return (
    <View style={styles.screen}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.inverted} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Member Card</Text>
        <TouchableOpacity onPress={() => setShowQRModal(true)} style={styles.expandBtn}>
          <Ionicons name="expand-outline" size={20} color={colors.text.inverted} />
        </TouchableOpacity>
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

      <Text style={styles.tapHint}>
        {showBack ? 'Tap to show front' : 'Tap to show QR code'}
      </Text>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <View style={styles.actionIconBox}>
            <Ionicons name="download-outline" size={20} color={colors.text.inverted} />
          </View>
          <Text style={styles.actionBtnText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <View style={styles.actionIconBox}>
            <Ionicons name="wallet-outline" size={20} color={colors.text.inverted} />
          </View>
          <Text style={styles.actionBtnText}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <View style={styles.actionIconBox}>
            <Ionicons name="share-outline" size={20} color={colors.text.inverted} />
          </View>
          <Text style={styles.actionBtnText}>Share</Text>
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
        <TouchableOpacity onPress={() => navigation.navigate('QRHelp')} style={styles.helpLink}>
          <Ionicons name="help-circle-outline" size={16} color="#6B6361" style={{ marginRight: 6 }} />
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
            <TouchableOpacity style={styles.closeModal} onPress={() => setShowQRModal(false)}>
              <Ionicons name="close-circle" size={44} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A0A' },

  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: spacing['4'],
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  expandBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 17, fontWeight: fontWeight.bold, color: colors.text.inverted },

  cardArea: {
    alignItems: 'center',
    paddingHorizontal: spacing['6'],
    marginTop: spacing['8'],
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
    borderColor: '#2A2A2E',
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.text.invertedMuted,
    letterSpacing: 1.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusActive: { backgroundColor: 'rgba(74,155,127,0.15)' },
  statusExpired: { backgroundColor: 'rgba(192,84,74,0.15)' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: fontWeight.bold },
  statusActiveText: { color: colors.success },
  statusExpiredText: { color: colors.error },
  cardName: { fontSize: 28, fontWeight: fontWeight.bold, color: colors.text.inverted, letterSpacing: -0.5 },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardId: { fontSize: 13, color: '#8E8E93', fontWeight: fontWeight.medium, letterSpacing: 1 },
  cardValidCol: { alignItems: 'flex-end' },
  cardValidLabel: { fontSize: 9, color: colors.text.invertedMuted, fontWeight: fontWeight.bold, letterSpacing: 0.8 },
  cardValidDate: { fontSize: 14, color: colors.text.inverted, fontWeight: fontWeight.medium, marginTop: 2 },

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
  qrMemberId: { fontSize: 14, color: colors.text.invertedMuted, marginTop: spacing['4'], letterSpacing: 0.5 },
  showToCashier: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.accent.default,
    letterSpacing: 1.5,
    marginTop: spacing['2'],
    textTransform: 'uppercase',
  },
  tapHint: {
    fontSize: 13,
    color: colors.text.invertedMuted,
    textAlign: 'center',
    marginTop: spacing['6'],
    fontWeight: fontWeight.medium,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: spacing['8'],
    marginTop: spacing['12'],
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: fontWeight.bold,
    color: colors.text.invertedMuted,
    letterSpacing: 0.5,
  },

  renewButton: {
    marginHorizontal: spacing['6'],
    marginTop: spacing['10'],
  },

  bottomArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing['12'],
  },
  helpLink: { flexDirection: 'row', alignItems: 'center', opacity: 0.8 },
  helpText: { fontSize: 13, color: '#6B6361', fontWeight: fontWeight.medium },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' },
  modalContent: { alignItems: 'center' },
  modalId: { fontSize: 20, fontWeight: fontWeight.bold, color: '#FFFFFF', marginTop: spacing['6'], letterSpacing: 2 },
  modalHint: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: spacing['2'] },
  closeModal: { marginTop: spacing['10'] },
});
