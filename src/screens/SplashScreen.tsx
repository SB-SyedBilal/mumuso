import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';
import { fontSize, fontWeight } from '../constants/dimensions';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => onFinish(), 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>MUMUSO</Text>
      <Text style={styles.tagline}>Love Life, Love Mumuso</Text>
      <ActivityIndicator color={colors.primary[600]} size="large" style={styles.loader} />
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 42, fontWeight: fontWeight.bold, color: colors.primary[600], letterSpacing: 6 },
  tagline: { fontSize: fontSize.md, color: colors.text.secondary, marginTop: 8 },
  loader: { marginTop: 40 },
  version: { position: 'absolute', bottom: 40, fontSize: fontSize.sm, color: colors.neutral[400] },
});
