import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import { formatDate } from '../utils';
import Button from '../components/Button';

const H = 24;

interface ProfileScreenProps { navigation: NativeStackNavigationProp<RootStackParamList>; }

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, dashboard, logout } = useAuth();
  const daysRemaining = dashboard?.days_remaining || 0;
  const isActive = dashboard?.status === 'active' && daysRemaining > 0;
  const initials = (user?.full_name || 'M').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const SettingRow = ({
    label,
    value,
    icon,
    onPress,
    danger
  }: {
    label: string;
    value?: string;
    icon?: string;
    onPress?: () => void;
    danger?: boolean
  }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.rowLeft}>
        {icon && (
          <View style={[styles.rowIconBox, danger && { backgroundColor: 'rgba(192,84,74,0.1)' }]}>
            <Ionicons name={icon as any} size={18} color={danger ? colors.error : colors.text.secondary} />
          </View>
        )}
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} /> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Nav */}
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>Profile</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="create-outline" size={20} color={colors.accent.default} />
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
            <Text style={styles.statusEyebrow}>MEMBERSHIP STATUS</Text>
            <Text style={[styles.statusValue, isActive ? styles.activeText : styles.expiredText]}>
              {isActive ? (daysRemaining <= 30 ? `Expiring in ${daysRemaining} days` : 'Active') : 'Expired'}
            </Text>
          </View>
          <View style={[styles.statusDot, isActive ? (daysRemaining <= 30 ? styles.warningDot : styles.activeDot) : styles.expiredDot]} />
        </View>
        <View style={styles.statusBottomRow}>
          <Text style={styles.validUntil}>Valid until {dashboard?.expiry_date ? formatDate(dashboard.expiry_date) : 'N/A'}</Text>
          {daysRemaining <= 30 && (
            <TouchableOpacity onPress={() => navigation.navigate('RenewalScreen')}>
              <Text style={styles.renewLink}>Renew Now \u203A</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Account actions */}
      <Text style={styles.sectionLabel}>ACCOUNT</Text>
      <View style={styles.settingsCard}>
        <SettingRow icon="at-outline" label="Email" value={user?.email || 'N/A'} />
        <View style={styles.divider} />
        <SettingRow icon="phone-portrait-outline" label="Phone" value={user?.phone || 'N/A'} />
        <View style={styles.divider} />
        <SettingRow icon="lock-closed-outline" label="Change Password" onPress={() => navigation.navigate('ChangePassword')} />
      </View>

      {/* App settings */}
      <Text style={styles.sectionLabel}>PREFERENCES</Text>
      <View style={styles.settingsCard}>
        <SettingRow icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('Notifications')} />
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={styles.rowIconBox}>
              <Ionicons name="refresh-outline" size={18} color={colors.text.secondary} />
            </View>
            <Text style={styles.rowLabel}>Auto-Renew</Text>
          </View>
          <Switch
            value={dashboard?.membership?.auto_renew || false}
            onValueChange={() => { }}
            trackColor={{ false: colors.border.default, true: colors.accent.default }}
            thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
          />
        </View>
      </View>

      {/* Help & About */}
      <Text style={styles.sectionLabel}>SUPPORT</Text>
      <View style={styles.settingsCard}>
        <SettingRow icon="help-buoy-outline" label="Help & Support" onPress={() => navigation.navigate('HelpSupport')} />
        <View style={styles.divider} />
        <SettingRow icon="information-circle-outline" label="About MUMUSO" value="v1.0.0" />
      </View>

      {/* Danger Zone */}
      <Text style={styles.sectionLabel}>DANGER ZONE</Text>
      <View style={styles.settingsCard}>
        <SettingRow
          icon="trash-outline"
          label="Delete Account"
          danger
          onPress={() => Alert.alert('Delete Account', 'Are you sure you want to delete your account? This action cannot be undone.', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive' }])}
        />
      </View>

      <Button
        title="Sign Out"
        onPress={handleLogout}
        variant="secondary"
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
    paddingBottom: spacing['4'],
  },
  navTitle: { fontSize: 28, fontWeight: fontWeight.bold, color: colors.text.primary, letterSpacing: -0.5 },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },

  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing['6'],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['4'],
    ...shadows.sm,
  },
  avatarText: { fontSize: 28, fontWeight: fontWeight.bold, color: '#FFFFFF' },
  name: { fontSize: 22, fontWeight: fontWeight.bold, color: colors.text.primary },
  memberId: { fontSize: 13, color: colors.text.tertiary, marginTop: spacing['1'], letterSpacing: 0.5, fontWeight: fontWeight.medium },
  since: { fontSize: 12, color: colors.text.tertiary, marginTop: spacing['1'], fontWeight: fontWeight.medium },

  statusCard: {
    marginHorizontal: H,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing['5'],
    ...shadows.card,
    marginBottom: spacing['8'],
  },
  statusTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statusEyebrow: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.text.tertiary,
    letterSpacing: 1.2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statusValue: { fontSize: 18, fontWeight: fontWeight.bold },
  activeText: { color: colors.success },
  expiredText: { color: colors.error },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  activeDot: { backgroundColor: colors.success },
  warningDot: { backgroundColor: colors.warning },
  expiredDot: { backgroundColor: colors.error },
  statusBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing['3'],
  },
  validUntil: { fontSize: 13, color: colors.text.tertiary, fontWeight: fontWeight.medium },
  renewLink: { fontSize: 13, color: colors.accent.default, fontWeight: fontWeight.bold },

  sectionLabel: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.text.tertiary,
    letterSpacing: 1.2,
    paddingHorizontal: H,
    marginBottom: spacing['2'],
    textTransform: 'uppercase',
  },
  settingsCard: {
    marginHorizontal: H,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing['4'],
    marginBottom: spacing['8'],
    ...shadows.card,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing['3'],
  },
  rowLabel: { fontSize: 15, color: colors.text.primary, fontWeight: fontWeight.medium },
  rowLabelDanger: { color: colors.error },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  rowValue: { fontSize: 14, color: colors.text.tertiary, fontWeight: fontWeight.medium },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.03)' },

  logoutBtn: {
    marginHorizontal: H,
    marginTop: spacing['2'],
  },
});
