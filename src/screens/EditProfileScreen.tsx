import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import { validateEmail } from '../utils';
import { PAKISTANI_CITIES } from '../services/mockData';
import Button from '../components/Button';
import Input from '../components/Input';

interface EditProfileScreenProps { navigation: NativeStackNavigationProp<RootStackParamList, 'EditProfile'>; }

export default function EditProfileScreen({ navigation }: EditProfileScreenProps) {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dob, setDob] = useState(user?.date_of_birth || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [city, setCity] = useState(user?.city || '');
  const [loading, setLoading] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasChanges = fullName !== user?.full_name || email !== user?.email || dob !== user?.date_of_birth || gender !== (user?.gender || '') || city !== user?.city;

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!fullName || fullName.length < 2) e.fullName = 'Name must be at least 2 characters';
    if (!validateEmail(email)) e.email = 'Enter a valid email';
    if (!city) e.city = 'Please select your city';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    updateUser({ full_name: fullName, email, date_of_birth: dob, gender: gender as any, city });
    setLoading(false);
    Alert.alert('Success', 'Profile updated successfully');
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>{'\u2190'} Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={!hasChanges || loading}><Text style={[styles.saveText, (!hasChanges || loading) && { opacity: 0.4 }]}>Save</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{fullName?.charAt(0)?.toUpperCase() || 'M'}</Text></View>
          <Text style={styles.changePhoto}>Change Photo (Coming Soon)</Text>
        </View>
        <Input label="Full Name" required value={fullName} onChangeText={setFullName} error={errors.fullName} autoCapitalize="words" />
        <Input label="Email" required value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Date of Birth" required value={dob} onChangeText={setDob} error={errors.dob} placeholder="YYYY-MM-DD" />
        <View style={styles.field}><Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.chipRow}>
            {['male', 'female', 'other', 'prefer_not_to_say'].map(g => (
              <TouchableOpacity key={g} style={[styles.chip, gender === g && styles.chipActive]} onPress={() => setGender(g)}>
                <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>{g === 'prefer_not_to_say' ? 'N/A' : g.charAt(0).toUpperCase() + g.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.field}><Text style={styles.fieldLabel}>City <Text style={{ color: colors.error }}>*</Text></Text>
          <TouchableOpacity style={[styles.picker, errors.city && { borderColor: colors.error, borderWidth: 2 }]} onPress={() => setShowCityPicker(!showCityPicker)}>
            <Text>{city || 'Select your city'}</Text><Text style={{ fontSize: 10, color: colors.neutral[400] }}>{showCityPicker ? '\u25B2' : '\u25BC'}</Text>
          </TouchableOpacity>
          {showCityPicker && <View style={styles.dropdown}><ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
            {PAKISTANI_CITIES.map(c => (
              <TouchableOpacity key={c} style={[styles.dropItem, city === c && { backgroundColor: colors.primary[50] }]} onPress={() => { setCity(c); setShowCityPicker(false); }}>
                <Text style={[{ fontSize: fontSize.md }, city === c && { color: colors.primary[600], fontWeight: fontWeight.semibold }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView></View>}
        </View>
        <Button title="Save Changes" onPress={handleSave} variant="primary" size="large" loading={loading} disabled={!hasChanges} style={{ marginTop: spacing.lg, borderRadius: borderRadius.lg }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  backText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  saveText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.bold },
  content: { padding: spacing.lg, paddingBottom: 40 },
  photoSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary[600], alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { fontSize: 32, fontWeight: fontWeight.bold, color: '#ffffff' },
  changePhoto: { fontSize: fontSize.sm, color: colors.text.secondary },
  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.xs + 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.full, backgroundColor: colors.neutral[100] },
  chipActive: { backgroundColor: colors.primary[600] },
  chipText: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: fontWeight.medium },
  chipTextActive: { color: '#ffffff' },
  picker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.neutral[200], borderRadius: borderRadius.md, paddingVertical: spacing.md - 4, paddingHorizontal: spacing.md },
  dropdown: { marginTop: spacing.xs, borderWidth: 1, borderColor: colors.neutral[200], borderRadius: borderRadius.md, overflow: 'hidden' },
  dropItem: { paddingVertical: spacing.md - 4, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
});
