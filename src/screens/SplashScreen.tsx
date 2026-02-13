import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/colors';
import { fontWeight } from '../constants/dimensions';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const memberOpacity = useRef(new Animated.Value(0)).current;
  const allOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // t=0→100: wordmark fades in 700ms
    // t=600: gold line draws from center out 400ms
    // t=900: MEMBER fades in 400ms
    // t=1800: all fades → transition
    Animated.sequence([
      Animated.delay(100),
      Animated.timing(wordmarkOpacity, { toValue: 1, duration: 700, useNativeDriver: false }),
      Animated.delay(0),
      Animated.timing(lineWidth, { toValue: 36, duration: 400, useNativeDriver: false }),
      Animated.delay(100),
      Animated.timing(memberOpacity, { toValue: 1, duration: 400, useNativeDriver: false }),
      Animated.delay(500),
      Animated.timing(allOpacity, { toValue: 0, duration: 400, useNativeDriver: false }),
    ]).start(() => onFinish());
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.center, { opacity: allOpacity }]}>
        <Animated.Text style={[styles.wordmark, { opacity: wordmarkOpacity }]}>
          MUMUSO
        </Animated.Text>
        <Animated.View style={[styles.goldLine, { width: lineWidth }]} />
        <Animated.Text style={[styles.memberLabel, { opacity: memberOpacity }]}>
          MEMBER
        </Animated.Text>
      </Animated.View>
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceDarker,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  wordmark: {
    fontSize: 38,
    fontWeight: fontWeight.bold,
    color: colors.text.inverted,
    letterSpacing: 38 * 0.18,
  },
  goldLine: {
    height: 1,
    backgroundColor: colors.accent.default,
    marginTop: 16,
    marginBottom: 12,
  },
  memberLabel: {
    fontSize: 10,
    fontWeight: fontWeight.medium,
    color: colors.text.invertedMuted,
    letterSpacing: 10 * 0.22,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: '#4A4A4E',
  },
});
