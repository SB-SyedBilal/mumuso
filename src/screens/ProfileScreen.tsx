import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import { formatDate, getDaysRemaining } from '../utils';
import Card from '../components/Card';
import Button from '../components/Button';

interface ProfileScreenProps { navigation: NativeStackNavigationProp<RootStackParamList>; }

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, membership, logout, updateMembership } = useAuth();
  const daysRemaining = membership ? getDaysRemaining(membership.expiry_date) : 0;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const renderRow = (label: string, value?: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {onPress && <Text style={styles.chevron}>{'\u203A'}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}><Text style={styles.editBtn}>Edit</Text></TouchableOpacity>
      </View>
      <View style={styles.profileSection}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user?.full_name?.charAt(0)?.toUpperCase() || 'M'}</Text></View>
        <Text style={styles.name}>{user?.full_name || 'Member'}</Text>
        <Text style={styles.memberId}>{membership?.member_id || 'MUM-XXXXX'}</Text>
        <Text style={styles.since}>Member since {user ? formatDate(user.created_at) : 'N/A'}</Text>
      </View>
      <Card style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View><Text style={styles.statusLabel}>Membership Status</Text>
            <Text style={[styles.statusValue, membership?.status === 'active' ? styles.activeText : styles.expiredText]}>
              {membership?.status === 'active' ? (daysRemaining <= 30 ? `Expiring Soon (${daysRemaining} days)` : 'Active') : 'Expired'}
            </Text></View>
          <View style={[styles.dot, membership?.status === 'active' ? (daysRemaining <= 30 ? styles.warningDot : styles.activeDot) : styles.expiredDot]} />
        </View>
        <Text style={styles.expiry}>Valid until: {membership ? formatDate(membership.expiry_date) : 'N/A'}</Text>
        {daysRemaining <= 30 && <Button title="Renew Now" onPress={() => navigation.navigate('RenewalScreen')} variant="primary" size="small" style={{ marginTop: spacing.md, alignSelf: 'flex-start' }} />}
      </Card>
      <View style={styles.section}><Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
        <Card variant="outlined">
          {renderRow('Email', user?.email || 'N/A')}
          {renderRow('Phone', user?.phone_number || 'N/A')}
          {renderRow('Date of Birth', user?.date_of_birth ? formatDate(user.date_of_birth) : 'N/A')}
          {renderRow('City', user?.city || 'N/A')}
        </Card>
      </View>
      <View style={styles.section}><Text style={styles.sectionTitle}>MEMBERSHIP SETTINGS</Text>
        <Card variant="outlined">
          <View style={styles.row}><Text style={styles.rowLabel}>Auto-Renew</Text>
            <Switch value={membership?.auto_renew || false} onValueChange={(v) => updateMembership({ auto_renew: v })} trackColor={{ false: colors.neutral[200], true: colors.primary[400] }} thumbColor={membership?.auto_renew ? colors.primary[600] : colors.neutral[400]} />
          </View>
        </Card>
      </View>
      <View style={styles.section}><Text style={styles.sectionTitle}>APP SETTINGS</Text>
        <Card variant="outlined">
          {renderRow('Notifications', undefined, () => navigation.navigate('Notifications'))}
          {renderRow('Help & Support', undefined, () => navigation.navigate('HelpSupport'))}
          {renderRow('About App', 'v1.0.0')}
        </Card>
      </View>
      <View style={styles.section}><Text style={styles.sectionTitle}>ACCOUNT</Text>
        <Card variant="outlined">
          {renderRow('Change Password', undefined, () => navigation.navigate('ChangePassword'))}
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Delete Account', 'This feature will be available once backend is connected.', [{ text: 'OK' }])}>
            <Text style={styles.dangerText}>Delete Account</Text><Text style={styles.chevron}>{'\u203A'}</Text>
          </TouchableOpacity>
        </Card>
      </View>
      <View style={styles.logoutSection}>
        <Button title="Logout" onPress={handleLogout} variant="secondary" size="large" style={styles.logoutBtn} textStyle={{ color: colors.error }} />
      </View>
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, backgroundColor: '#ffffff' },
  headerTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary },
  editBtn: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  profileSection: { alignItems: 'center', paddingVertical: spacing.lg, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary[600], alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: 32, fontWeight: fontWeight.bold, color: '#ffffff' },
  name: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  memberId: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold, marginTop: spacing.xs },
  since: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: spacing.xs },
  statusCard: { marginHorizontal: spacing.lg, marginTop: spacing.md },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statusLabel: { fontSize: fontSize.sm, color: colors.text.secondary, marginBottom: spacing.xs },
  statusValue: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  activeText: { color: colors.success },
  expiredText: { color: colors.error },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: spacing.xs },
  activeDot: { backgroundColor: colors.success },
  warningDot: { backgroundColor: '#F59E0B' },
  expiredDot: { backgroundColor: colors.error },
  expiry: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: spacing.sm },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text.secondary, marginBottom: spacing.sm, letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md - 2, borderBottomWidth: 1, borderBottomColor: colors.neutral[50] },
  rowLabel: { fontSize: fontSize.md, color: colors.text.primary },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowValue: { fontSize: fontSize.md, color: colors.text.secondary },
  chevron: { fontSize: 20, color: colors.neutral[400] },
  dangerText: { fontSize: fontSize.md, color: colors.error, fontWeight: fontWeight.medium },
  logoutSection: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  logoutBtn: { borderColor: colors.error, borderRadius: borderRadius.lg },
});
