import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import { formatDate } from '../utils';
import Button from '../components/Button';

const H = 24;

interface ProfileScreenProps { navigation: NativeStackNavigationProp<RootStackParamList>; }

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, dashboard, memberStatus, logout } = useAuth();
  const daysRemaining = dashboard?.days_remaining || 0;
  const isActive = dashboard?.status === 'active' && daysRemaining > 0;
  const initials = (user?.full_name || 'M').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const SettingRow = ({ label, value, onPress, danger }: { label: string; value?: string; onPress?: () => void; danger?: boolean }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {onPress ? <Text style={styles.chevron}>{'\u203A'}</Text> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Nav */}
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.editLink}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.full_name || 'Member'}</Text>
        <Text style={styles.memberId}>{dashboard?.member_id || 'MUM-XXXXX'}</Text>
        <Text style={styles.since}>Member since {dashboard?.membership?.activated_at ? formatDate(dashboard.membership.activated_at) : 'N/A'}</Text>
      </View>

      {/* Membership status */}
      <View style={styles.statusCard}>
        <View style={styles.statusTopRow}>
          <View>
            <Text style={styles.statusEyebrow}>MEMBERSHIP</Text>
            <Text style={[styles.statusValue, isActive ? styles.activeText : styles.expiredText]}>
              {isActive ? (daysRemaining <= 30 ? `Expiring in ${daysRemaining} days` : 'Active') : 'Expired'}
            </Text>
          </View>
          <View style={[styles.statusDot, isActive ? (daysRemaining <= 30 ? styles.warningDot : styles.activeDot) : styles.expiredDot]} />
        </View>
        <Text style={styles.validUntil}>Valid until {dashboard?.expiry_date ? formatDate(dashboard.expiry_date) : 'N/A'}</Text>
        {daysRemaining <= 30 && daysRemaining > 0 && (
          <Button title="Renew" onPress={() => navigation.navigate('RenewalScreen')} variant="gold" style={styles.renewBtn} />
        )}
      </View>

      {/* Personal info */}
      <Text style={styles.sectionLabel}>PERSONAL INFORMATION</Text>
      <View style={styles.settingsCard}>
        <SettingRow label="Email" value={user?.email || 'N/A'} />
        <View style={styles.divider} />
        <SettingRow label="Phone" value={user?.phone || 'N/A'} />
      </View>

      {/* Membership settings */}
      <Text style={styles.sectionLabel}>MEMBERSHIP</Text>
      <View style={styles.settingsCard}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Auto-Renew</Text>
          <Switch
            value={dashboard?.membership?.auto_renew || false}
            onValueChange={() => {}}
            trackColor={{ false: colors.border.default, true: colors.accent.default }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* App settings */}
      <Text style={styles.sectionLabel}>APP</Text>
      <View style={styles.settingsCard}>
        <SettingRow label="Notifications" onPress={() => navigation.navigate('Notifications')} />
        <View style={styles.divider} />
        <SettingRow label="Help & Support" onPress={() => navigation.navigate('HelpSupport')} />
        <View style={styles.divider} />
        <SettingRow label="About" value="v1.0.0" />
      </View>

      {/* Account / Danger */}
      <Text style={styles.sectionLabel}>ACCOUNT</Text>
      <View style={styles.settingsCard}>
        <SettingRow label="Change Password" onPress={() => navigation.navigate('ChangePassword')} />
        <View style={styles.divider} />
        <SettingRow
          label="Delete Account"
          danger
          onPress={() => Alert.alert('Delete Account', 'NOT SUPPORTED YET: Requires backend API integration.', [{ text: 'OK' }])}
        />
      </View>

      <Button
        title="Sign Out"
        onPress={handleLogout}
        variant="danger"
        style={styles.logoutBtn}
      />

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: H,
    paddingTop: 56,
    paddingBottom: spacing['2'],
  },
  navTitle: { fontSize: 30, fontWeight: fontWeight.semibold, color: colors.text.primary, letterSpacing: -0.3 },
  editLink: { fontSize: 14, color: colors.accent.text, fontWeight: fontWeight.medium },

  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing['6'],
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['4'],
  },
  avatarText: { fontSize: 26, fontWeight: fontWeight.semibold, color: '#FFFFFF' },
  name: { fontSize: 22, fontWeight: fontWeight.semibold, color: colors.text.primary },
  memberId: { fontSize: 13, color: colors.text.tertiary, marginTop: spacing['1'], letterSpacing: 0.5 },
  since: { fontSize: 12, color: colors.text.tertiary, marginTop: spacing['1'] },

  statusCard: {
    marginHorizontal: H,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing['5'],
    ...shadows.card,
    marginBottom: spacing['6'],
  },
  statusTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statusEyebrow: { fontSize: 10, fontWeight: fontWeight.medium, color: colors.text.tertiary, letterSpacing: 10 * 0.1, marginBottom: spacing['1'] },
  statusValue: { fontSize: 17, fontWeight: fontWeight.semibold },
  activeText: { color: colors.success },
  expiredText: { color: colors.error },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: spacing['1'] },
  activeDot: { backgroundColor: colors.success },
  warningDot: { backgroundColor: colors.warning },
  expiredDot: { backgroundColor: colors.error },
  validUntil: { fontSize: 13, color: colors.text.tertiary, marginTop: spacing['2'] },
  renewBtn: { marginTop: spacing['4'], alignSelf: 'flex-start', height: 40, paddingHorizontal: spacing['5'] },

  sectionLabel: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
    letterSpacing: 11 * 0.08,
    paddingHorizontal: H,
    marginBottom: spacing['2'],
  },
  settingsCard: {
    marginHorizontal: H,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing['5'],
    marginBottom: spacing['6'],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
  },
  rowLabel: { fontSize: 15, color: colors.text.primary },
  rowLabelDanger: { color: colors.error },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  rowValue: { fontSize: 14, color: colors.text.tertiary },
  chevron: { fontSize: 18, color: colors.text.tertiary },
  divider: { height: 1, backgroundColor: colors.border.subtle },

  logoutBtn: {
    marginHorizontal: H,
    marginTop: spacing['2'],
  },
});
