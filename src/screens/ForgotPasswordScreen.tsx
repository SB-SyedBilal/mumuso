import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { useAuth } from '../services/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

interface ForgotPasswordScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const { forgotPassword } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!identifier) { Alert.alert('Required', 'Please enter your email'); return; }
    setLoading(true);
    setError('');
    const result = await forgotPassword(identifier);
    setLoading(false);
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error || 'Failed to send reset link');
    }
  };

  if (sent) {
    return (
      <View style={styles.screen}>
        <View style={styles.successContent}>
          <View style={styles.checkCircle}>
            <Ionicons name="mail-outline" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.headline}>Check your inbox</Text>
          <Text style={styles.subheadline}>We sent a password reset link to your registered email or phone. Follow the instructions to reset your password.</Text>
          <Button title="Back to Sign In" onPress={() => navigation.navigate('Login')} variant="primary" style={styles.button} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.headline}>Forgot password?</Text>
        <Text style={styles.subheadline}>Enter your registered phone number or email and we'll send you a reset link.</Text>
        <View style={styles.formCard}>
          <Input label="Phone or Email" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" placeholder="Enter phone number or email" containerStyle={{ marginBottom: 0 }} />
        </View>
        <Button title="Send Reset Link" onPress={handleSend} variant="primary" loading={loading} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  navBar: { paddingHorizontal: spacing['6'], paddingTop: 56, paddingBottom: spacing['2'] },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -spacing['2'] },
  backIcon: { fontSize: 28, color: colors.text.primary },
  content: { paddingHorizontal: spacing['6'] },
  headline: { fontSize: 30, fontWeight: fontWeight.semibold, color: colors.text.primary, lineHeight: 38, letterSpacing: -0.3, marginTop: spacing['8'] },
  subheadline: { fontSize: 15, color: colors.text.secondary, lineHeight: 24, marginTop: spacing['1'], marginBottom: spacing['6'] },
  formCard: { backgroundColor: colors.surface, borderRadius: radius.xl, paddingHorizontal: spacing['5'], paddingVertical: spacing['4'], marginBottom: spacing['4'] },
  button: { marginTop: spacing['2'] },
  successContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing['6'] },
  checkCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accent.default, alignItems: 'center', justifyContent: 'center', marginBottom: spacing['6'] },
  checkMark: { fontSize: 32, color: '#FFFFFF', fontWeight: fontWeight.bold },
});
