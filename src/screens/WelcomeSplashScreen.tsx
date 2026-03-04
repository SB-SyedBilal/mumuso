import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/colors';
import { spacing, fontWeight } from '../constants/dimensions';

interface WelcomeSplashScreenProps {
  userName: string;
  onFinish: () => void;
}

export default function WelcomeSplashScreen({ userName, onFinish }: WelcomeSplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  const firstName = userName.split(' ')[0];

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <View style={styles.iconContainer}>
          <Text style={styles.emoji}>👋</Text>
        </View>
        <Text style={styles.welcomeText}>Welcome</Text>
        <Text style={styles.nameText}>{firstName}!</Text>
        <Text style={styles.subText}>Let's get you started</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.accent.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing['6'],
  },
  iconContainer: {
    marginBottom: spacing['6'],
  },
  emoji: {
    fontSize: 80,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: fontWeight.medium,
    color: '#FFFFFF',
    marginBottom: spacing['2'],
    letterSpacing: 0.5,
  },
  nameText: {
    fontSize: 42,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing['4'],
    letterSpacing: -0.5,
  },
  subText: {
    fontSize: 16,
    fontWeight: fontWeight.medium,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.3,
  },
});
