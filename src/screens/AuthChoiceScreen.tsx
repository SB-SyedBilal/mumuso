import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import Button from '../components/Button';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AuthChoiceScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AuthChoice'>;
}

export default function AuthChoiceScreen({ navigation }: AuthChoiceScreenProps) {
  return (
    <View style={styles.container}>
      {/* Top zone — abstract warm illustration */}
      <View style={styles.topZone}>
        <View style={styles.artCircle1} />
        <View style={styles.artCircle2} />
        <View style={styles.artCircle3} />
      </View>

      {/* Bottom zone — white card */}
      <View style={styles.bottomZone}>
        <Text style={styles.wordmark}>MUMUSO</Text>
        <Text style={styles.tagline}>Save smarter. Every visit.</Text>

        <View style={styles.divider} />

        <Button
          title="Create Account"
          onPress={() => navigation.navigate('Register')}
          variant="primary"
          style={styles.button}
        />
        <Button
          title="I Already Have an Account"
          onPress={() => navigation.navigate('Login')}
          variant="secondary"
          style={styles.button}
        />

        <Text style={styles.legal}>
          By continuing you agree to our{' '}
          <Text style={styles.legalLink}>Terms</Text>
          {' \u2022 '}
          <Text style={styles.legalLink}>Privacy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  topZone: {
    height: SCREEN_HEIGHT * 0.42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artCircle1: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.border.subtle,
    opacity: 0.5,
    top: 60,
    left: -20,
  },
  artCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.accent.light,
    opacity: 0.4,
    top: 40,
    right: 20,
  },
  artCircle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceRaised,
    opacity: 0.7,
    bottom: 30,
    right: 80,
  },
  bottomZone: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing['6'],
    paddingTop: spacing['8'],
    paddingBottom: spacing['10'],
    alignItems: 'center',
  },
  wordmark: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: 24 * 0.16,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 6,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: 28,
  },
  button: {
    width: '100%',
    marginBottom: spacing['3'],
  },
  legal: {
    fontSize: 11,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: 'auto',
    lineHeight: 16,
  },
  legalLink: {
    color: colors.accent.text,
  },
});
