import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import Button from '../components/Button';

interface AuthChoiceScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AuthChoice'>;
}

export default function AuthChoiceScreen({ navigation }: AuthChoiceScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.brand}>MUMUSO</Text>
        <Text style={styles.tagline}>Love Life, Love Mumuso</Text>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.title}>Join the Mumuso Family</Text>
        <Text style={styles.subtitle}>Get 10% off on every purchase with our membership card</Text>
        <Button
          title="Create Account"
          onPress={() => navigation.navigate('Register')}
          variant="primary"
          size="large"
          style={styles.button}
        />
        <Button
          title="I Already Have an Account"
          onPress={() => navigation.navigate('Login')}
          variant="secondary"
          size="large"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 42, fontWeight: fontWeight.bold, color: colors.primary[600], letterSpacing: 6 },
  tagline: { fontSize: fontSize.md, color: colors.text.secondary, marginTop: 8 },
  bottom: { paddingHorizontal: spacing.lg, paddingBottom: 50 },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: fontSize.md, color: colors.text.secondary, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xl },
  button: { marginBottom: spacing.md, borderRadius: borderRadius.lg },
});
