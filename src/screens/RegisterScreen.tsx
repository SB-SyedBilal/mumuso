import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import { validatePhoneNumber, validateEmail, validatePassword, getPasswordStrength } from '../utils';
import { PAKISTANI_CITIES } from '../services/mockData';
import Button from '../components/Button';
import Input from '../components/Input';

interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCityPicker, setShowCityPicker] = useState(false);

  const pwStrength = getPasswordStrength(password);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName || fullName.length < 2) e.fullName = 'Please enter your full name (at least 2 characters)';
    if (/\d/.test(fullName)) e.fullName = 'Names can only contain letters';
    if (!validatePhoneNumber(phone)) e.phone = 'Enter a valid Pakistani number starting with 03';
    if (!validateEmail(email)) e.email = "That doesn't look like a valid email address";
    if (!dob) e.dob = 'Date of birth is required';
    if (!city) e.city = 'Please select your city';
    const pwResult = validatePassword(password);
    if (!pwResult.valid) e.password = 'Password needs at least 8 characters, a number, and one uppercase letter';
    if (password !== confirmPassword) e.confirmPassword = "Passwords don't match. Please try again.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await register({ full_name: fullName, phone_number: phone, email, date_of_birth: dob, gender: gender as any, city, password });
    setLoading(false);
    if (result.success) {
      navigation.navigate('OTPVerification', { phone_number: phone, from: 'register' });
    } else {
      setErrors({ general: result.error || 'Registration failed' });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>{'\u2039'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.stepLabel}>STEP 1 OF 2</Text>
        <Text style={styles.headline}>Create Your Account</Text>
        <Text style={styles.subheadline}>Join thousands of members saving every day.</Text>

        {errors.general && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        )}

        {/* Card 1 — Personal */}
        <View style={styles.formCard}>
          <Input label="Full Name" value={fullName} onChangeText={setFullName} error={errors.fullName} autoCapitalize="words" placeholder="Your full name" containerStyle={styles.cardInput} />
          <View style={styles.cardDivider} />
          <Input label="Phone Number" value={phone} onChangeText={setPhone} error={errors.phone} keyboardType="phone-pad" placeholder="03XX XXXXXXX" hint="We'll send a verification code" containerStyle={styles.cardInput} />
          <View style={styles.cardDivider} />
          <Input label="Email Address" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" placeholder="name@email.com" hint="For receipts and reminders" containerStyle={styles.cardInput} />
        </View>

        {/* Card 2 — Profile */}
        <View style={styles.formCard}>
          <Input label="Date of Birth" value={dob} onChangeText={setDob} error={errors.dob} placeholder="DD / MM / YYYY" hint="For birthday surprises" containerStyle={styles.cardInput} />
          <View style={styles.cardDivider} />

          {/* Gender */}
          <View style={styles.cardInput}>
            <Text style={styles.fieldLabel}>GENDER (OPTIONAL)</Text>
            <View style={styles.chipRow}>
              {[
                { key: 'male', label: 'Male' },
                { key: 'female', label: 'Female' },
                { key: 'other', label: 'Other' },
                { key: 'prefer_not_to_say', label: 'Prefer not to say' },
              ].map(g => (
                <TouchableOpacity key={g.key} style={[styles.chip, gender === g.key && styles.chipActive]} onPress={() => setGender(g.key)}>
                  <Text style={[styles.chipText, gender === g.key && styles.chipTextActive]}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.cardDivider} />

          {/* City */}
          <View style={styles.cardInput}>
            <Text style={styles.fieldLabel}>CITY</Text>
            <TouchableOpacity style={[styles.pickerButton, errors.city ? styles.pickerError : null]} onPress={() => setShowCityPicker(!showCityPicker)}>
              <Text style={[styles.pickerText, !city && styles.pickerPlaceholder]}>{city || 'Select your city'}</Text>
              <Text style={styles.chevron}>{'\u203A'}</Text>
            </TouchableOpacity>
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            {showCityPicker && (
              <View style={styles.dropdown}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                  {PAKISTANI_CITIES.map(c => (
                    <TouchableOpacity key={c} style={[styles.dropdownItem, city === c && styles.dropdownItemActive]} onPress={() => { setCity(c); setShowCityPicker(false); }}>
                      <Text style={[styles.dropdownText, city === c && styles.dropdownTextActive]}>{c}</Text>
                      {city === c && <Text style={styles.dropdownCheck}>{'\u2713'}</Text>}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        {/* Card 3 — Security */}
        <View style={styles.formCard}>
          <Input label="Password" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry showPasswordToggle autoCapitalize="none" placeholder="Create a strong password" hint="At least 8 characters" containerStyle={styles.cardInput} />
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              <View style={styles.strengthTrack}>
                {[0, 1, 2, 3].map(i => (
                  <View key={i} style={[
                    styles.strengthSegment,
                    {
                      backgroundColor: i < (pwStrength.width === '25%' ? 1 : pwStrength.width === '50%' ? 2 : pwStrength.width === '75%' ? 3 : 4)
                        ? pwStrength.color : colors.border.subtle,
                    },
                  ]} />
                ))}
              </View>
              <Text style={[styles.strengthLabel, { color: pwStrength.color }]}>{pwStrength.level}</Text>
            </View>
          )}
          <View style={styles.cardDivider} />
          <Input label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} error={errors.confirmPassword} secureTextEntry showPasswordToggle autoCapitalize="none" placeholder="Repeat your password" containerStyle={styles.cardInput} />
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          By creating an account you agree to our{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text> and{' '}
          <Text style={styles.termsLink}>Terms of Use</Text>.
        </Text>

        {/* Submit */}
        <Button title="Continue" onPress={handleRegister} variant="primary" loading={loading} style={styles.submitButton} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  navBar: {
    paddingHorizontal: spacing['6'],
    paddingTop: 56,
    paddingBottom: spacing['2'],
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -spacing['2'] },
  backIcon: { fontSize: 28, color: colors.text.primary },

  content: { paddingHorizontal: spacing['6'] },

  stepLabel: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: colors.accent.text,
    letterSpacing: 11 * 0.08,
    marginTop: spacing['8'],
  },
  headline: {
    fontSize: 30,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    lineHeight: 38,
    letterSpacing: -0.3,
    marginTop: spacing['2'],
  },
  subheadline: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    marginTop: spacing['1'],
    marginBottom: spacing['6'],
  },

  errorBanner: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    padding: spacing['4'],
    marginBottom: spacing['4'],
  },
  errorBannerText: { fontSize: 14, color: colors.error, textAlign: 'center' },

  // Form cards
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['4'],
    marginBottom: spacing['4'],
  },
  cardInput: { marginBottom: 0 },
  cardDivider: { height: 1, backgroundColor: colors.border.subtle, marginVertical: spacing['3'] },

  // Field label
  fieldLabel: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
    letterSpacing: 11 * 0.08,
    marginBottom: spacing['2'],
  },

  // Gender chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] },
  chip: {
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  chipActive: { backgroundColor: colors.text.primary, borderColor: colors.text.primary },
  chipText: { fontSize: 13, color: colors.text.secondary, fontWeight: fontWeight.medium },
  chipTextActive: { color: colors.text.inverted },

  // City picker
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    borderRadius: 14,
    paddingHorizontal: spacing['5'],
    backgroundColor: colors.surface,
  },
  pickerError: { borderColor: colors.error },
  pickerText: { fontSize: 16, color: colors.text.primary },
  pickerPlaceholder: { color: colors.text.tertiary },
  chevron: { fontSize: 18, color: colors.text.tertiary },
  dropdown: {
    marginTop: spacing['2'],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  dropdownItemActive: { backgroundColor: colors.surfaceRaised },
  dropdownText: { fontSize: 15, color: colors.text.primary },
  dropdownTextActive: { fontWeight: fontWeight.semibold },
  dropdownCheck: { fontSize: 14, color: colors.accent.text },
  errorText: { fontSize: 12, color: colors.error, marginTop: spacing['1'] },

  // Password strength
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginTop: spacing['2'],
    marginBottom: spacing['2'],
  },
  strengthTrack: { flex: 1, flexDirection: 'row', gap: 4 },
  strengthSegment: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: fontWeight.semibold },

  // Terms
  termsText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing['4'],
  },
  termsLink: { color: colors.accent.text },

  submitButton: { marginBottom: spacing['4'] },
});
