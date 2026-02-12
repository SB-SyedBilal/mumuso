import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
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
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCityPicker, setShowCityPicker] = useState(false);

  const pwStrength = getPasswordStrength(password);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName || fullName.length < 2) e.fullName = 'Name must be at least 2 characters';
    if (!validatePhoneNumber(phone)) e.phone = 'Enter a valid Pakistani phone number';
    if (!validateEmail(email)) e.email = 'Enter a valid email address';
    if (!dob) e.dob = 'Date of birth is required';
    if (!city) e.city = 'Please select your city';
    const pwResult = validatePassword(password);
    if (!pwResult.valid) e.password = 'Missing: ' + pwResult.errors.join(', ');
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!agreeTerms) e.terms = 'You must agree to the terms';
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {errors.general && <Text style={styles.generalError}>{errors.general}</Text>}

        <Input label="Full Name" required value={fullName} onChangeText={setFullName} error={errors.fullName} autoCapitalize="words" placeholder="Enter your full name" />
        <Input label="Phone Number" required value={phone} onChangeText={setPhone} error={errors.phone} keyboardType="phone-pad" placeholder="+92 3XX XXXXXXX" />
        <Input label="Email" required value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" placeholder="your@email.com" />
        <Input label="Date of Birth" required value={dob} onChangeText={setDob} error={errors.dob} placeholder="YYYY-MM-DD" />

        {/* Gender */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.chipRow}>
            {['male', 'female', 'other', 'prefer_not_to_say'].map(g => (
              <TouchableOpacity key={g} style={[styles.chip, gender === g && styles.chipActive]} onPress={() => setGender(g)}>
                <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>
                  {g === 'prefer_not_to_say' ? 'N/A' : g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* City */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>City <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity style={[styles.pickerButton, errors.city ? styles.pickerError : null]} onPress={() => setShowCityPicker(!showCityPicker)}>
            <Text style={styles.pickerText}>{city || 'Select your city'}</Text>
            <Text style={styles.chevron}>{showCityPicker ? '\u25B2' : '\u25BC'}</Text>
          </TouchableOpacity>
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          {showCityPicker && (
            <View style={styles.dropdown}>
              <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                {PAKISTANI_CITIES.map(c => (
                  <TouchableOpacity key={c} style={[styles.dropdownItem, city === c && styles.dropdownItemActive]} onPress={() => { setCity(c); setShowCityPicker(false); }}>
                    <Text style={[styles.dropdownText, city === c && styles.dropdownTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <Input label="Password" required value={password} onChangeText={setPassword} error={errors.password} secureTextEntry showPasswordToggle autoCapitalize="none" placeholder="Create a password" />
        {password.length > 0 && (
          <View style={styles.strengthRow}>
            <View style={styles.strengthBar}><View style={[styles.strengthFill, { width: pwStrength.width as any, backgroundColor: pwStrength.color }]} /></View>
            <Text style={[styles.strengthText, { color: pwStrength.color }]}>{pwStrength.level}</Text>
          </View>
        )}
        <Input label="Confirm Password" required value={confirmPassword} onChangeText={setConfirmPassword} error={errors.confirmPassword} secureTextEntry showPasswordToggle autoCapitalize="none" placeholder="Re-enter password" />

        {/* Terms */}
        <TouchableOpacity style={styles.termsRow} onPress={() => setAgreeTerms(!agreeTerms)}>
          <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
            {agreeTerms && <Text style={styles.checkmark}>{'\u2713'}</Text>}
          </View>
          <Text style={styles.termsText}>I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text> and <Text style={styles.termsLink}>Privacy Policy</Text></Text>
        </TouchableOpacity>
        {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

        <Button title="Create Account" onPress={handleRegister} variant="primary" size="large" loading={loading} style={styles.submitButton} />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  backText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  content: { padding: spacing.lg, paddingBottom: 40 },
  generalError: { backgroundColor: '#FEE2E2', color: colors.error, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md, fontSize: fontSize.sm, textAlign: 'center' },
  fieldContainer: { marginBottom: spacing.md },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.xs + 2 },
  required: { color: colors.error },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.full, backgroundColor: colors.neutral[100] },
  chipActive: { backgroundColor: colors.primary[600] },
  chipText: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: fontWeight.medium },
  chipTextActive: { color: '#ffffff' },
  pickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.neutral[200], borderRadius: borderRadius.md, paddingVertical: spacing.md - 4, paddingHorizontal: spacing.md },
  pickerError: { borderColor: colors.error, borderWidth: 2 },
  pickerText: { fontSize: fontSize.md, color: colors.text.primary },
  chevron: { fontSize: 10, color: colors.neutral[400] },
  dropdown: { marginTop: spacing.xs, borderWidth: 1, borderColor: colors.neutral[200], borderRadius: borderRadius.md, backgroundColor: '#ffffff', overflow: 'hidden' },
  dropdownItem: { paddingVertical: spacing.md - 4, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  dropdownItemActive: { backgroundColor: colors.primary[50] },
  dropdownText: { fontSize: fontSize.md, color: colors.text.primary },
  dropdownTextActive: { color: colors.primary[600], fontWeight: fontWeight.semibold },
  errorText: { fontSize: fontSize.xs, color: colors.error, marginTop: spacing.xs },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md, marginTop: -spacing.sm },
  strengthBar: { flex: 1, height: 4, backgroundColor: colors.neutral[200], borderRadius: 2, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md, marginTop: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: colors.neutral[300], alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary[600], borderColor: colors.primary[600] },
  checkmark: { color: '#ffffff', fontSize: 14, fontWeight: fontWeight.bold },
  termsText: { flex: 1, fontSize: fontSize.sm, color: colors.text.secondary, lineHeight: 20 },
  termsLink: { color: colors.primary[600], fontWeight: fontWeight.semibold },
  submitButton: { marginTop: spacing.md, borderRadius: borderRadius.lg },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  loginText: { fontSize: fontSize.md, color: colors.text.secondary },
  loginLink: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.bold },
});
