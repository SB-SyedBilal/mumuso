import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import { validateEmail } from '../utils';
import { PAKISTANI_CITIES } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';

interface EditProfileScreenProps { navigation: NativeStackNavigationProp<RootStackParamList, 'EditProfile'>; }

export default function EditProfileScreen({ navigation }: EditProfileScreenProps) {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasChanges = fullName !== user?.full_name || email !== user?.email || dob !== '' || gender !== '' || city !== '';

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!fullName || fullName.length < 2) e.fullName = 'Name must be at least 2 characters';
    if (!validateEmail(email)) e.email = 'Enter a valid email';
    if (!city) e.city = 'Please select your city';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setLoading(true);
    const result = await updateUser({ full_name: fullName });
    setLoading(false);
    if (result.success) {
      Alert.alert('Saved', 'Profile updated successfully');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error || 'Failed to update profile');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.navRight} onPress={handleSave} disabled={!hasChanges || loading}>
          <Text style={[styles.saveLink, (!hasChanges || loading) && { opacity: 0.3 }]}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{fullName?.charAt(0)?.toUpperCase() || 'M'}</Text></View>
          <Text style={styles.changePhoto}>Change photo (coming soon)</Text>
        </View>

        <View style={styles.formCard}>
          <Input label="Full Name" value={fullName} onChangeText={setFullName} error={errors.fullName} autoCapitalize="words" containerStyle={{ marginBottom: 0 }} />
          <View style={styles.divider} />
          <Input label="Email" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" containerStyle={{ marginBottom: 0 }} />
          <View style={styles.divider} />
          <Input label="Date of Birth" value={dob} onChangeText={setDob} error={errors.dob} placeholder="DD / MM / YYYY" containerStyle={{ marginBottom: 0 }} />
        </View>

        <View style={styles.formCard}>
          <View>
            <Text style={styles.fieldLabel}>GENDER</Text>
            <View style={styles.chipRow}>
              {[{ key: 'male', label: 'Male' }, { key: 'female', label: 'Female' }, { key: 'other', label: 'Other' }, { key: 'prefer_not_to_say', label: 'N/A' }].map(g => (
                <TouchableOpacity key={g.key} style={[styles.chip, gender === g.key && styles.chipActive]} onPress={() => setGender(g.key)}>
                  <Text style={[styles.chipText, gender === g.key && styles.chipTextActive]}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.fieldLabel}>CITY</Text>
            <TouchableOpacity style={[styles.pickerButton, errors.city && { borderColor: colors.error }]} onPress={() => setShowCityPicker(!showCityPicker)}>
              <Text style={[styles.pickerText, !city && { color: colors.text.tertiary }]}>{city || 'Select your city'}</Text>
              <Text style={styles.chevron}>{'\u203A'}</Text>
            </TouchableOpacity>
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            {showCityPicker && (
              <View style={styles.dropdown}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                  {PAKISTANI_CITIES.map(c => (
                    <TouchableOpacity key={c} style={[styles.dropItem, city === c && styles.dropItemActive]} onPress={() => { setCity(c); setShowCityPicker(false); }}>
                      <Text style={[styles.dropText, city === c && styles.dropTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        <Button title="Save Changes" onPress={handleSave} variant="primary" loading={loading} disabled={!hasChanges} style={styles.saveButton} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing['6'], paddingTop: 56, paddingBottom: spacing['2'] },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: colors.text.primary },
  navTitle: { fontSize: 17, fontWeight: fontWeight.semibold, color: colors.text.primary },
  navRight: { width: 44, alignItems: 'flex-end', justifyContent: 'center' },
  saveLink: { fontSize: 14, color: colors.accent.text, fontWeight: fontWeight.semibold },
  content: { paddingHorizontal: spacing['6'] },
  photoSection: { alignItems: 'center', paddingVertical: spacing['6'] },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accent.default, alignItems: 'center', justifyContent: 'center', marginBottom: spacing['3'] },
  avatarText: { fontSize: 26, fontWeight: fontWeight.semibold, color: '#FFFFFF' },
  changePhoto: { fontSize: 13, color: colors.text.tertiary },
  formCard: { backgroundColor: colors.surface, borderRadius: radius.xl, paddingHorizontal: spacing['5'], paddingVertical: spacing['4'], marginBottom: spacing['4'] },
  divider: { height: 1, backgroundColor: colors.border.subtle, marginVertical: spacing['3'] },
  fieldLabel: { fontSize: 11, fontWeight: fontWeight.medium, color: colors.text.tertiary, letterSpacing: 11 * 0.08, marginBottom: spacing['2'] },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] },
  chip: { paddingVertical: spacing['2'], paddingHorizontal: spacing['4'], borderRadius: radius.full, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border.subtle },
  chipActive: { backgroundColor: colors.text.primary, borderColor: colors.text.primary },
  chipText: { fontSize: 13, color: colors.text.secondary, fontWeight: fontWeight.medium },
  chipTextActive: { color: colors.text.inverted },
  pickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, borderWidth: 1.5, borderColor: colors.border.subtle, borderRadius: 14, paddingHorizontal: spacing['5'] },
  pickerText: { fontSize: 16, color: colors.text.primary },
  chevron: { fontSize: 18, color: colors.text.tertiary },
  errorText: { fontSize: 12, color: colors.error, marginTop: spacing['1'] },
  dropdown: { marginTop: spacing['2'], borderWidth: 1, borderColor: colors.border.subtle, borderRadius: radius.md, backgroundColor: colors.surface, overflow: 'hidden' },
  dropItem: { paddingVertical: spacing['3'], paddingHorizontal: spacing['4'], borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  dropItemActive: { backgroundColor: colors.surfaceRaised },
  dropText: { fontSize: 15, color: colors.text.primary },
  dropTextActive: { fontWeight: fontWeight.semibold },
  saveButton: { marginTop: spacing['4'] },
});
