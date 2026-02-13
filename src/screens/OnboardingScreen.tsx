import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';
import { spacing, fontWeight } from '../constants/dimensions';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    id: '1',
    label: 'BENEFIT 01',
    title: 'Save 10% on every purchase',
    body: 'One membership card. Instant discounts at checkout. No coupons, no codes — just savings.',
    icon: '\u2606',
  },
  {
    id: '2',
    label: 'BENEFIT 02',
    title: 'Show your card, that\u2019s it',
    body: 'Open the app, show your QR code at the register, and your discount is applied automatically.',
    icon: '\u25A1',
  },
  {
    id: '3',
    label: 'BENEFIT 03',
    title: 'Watch your savings grow',
    body: 'Track every purchase, see exactly how much you\u2019ve saved, and know your membership pays for itself.',
    icon: '\u25B3',
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isLast = currentIndex === SLIDES.length - 1;

  const goToNext = () => {
    if (!isLast) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <View style={styles.container}>
      {/* Top zone — illustration area */}
      <View style={styles.topZone}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          renderItem={({ item }) => (
            <View style={[styles.slideTop, { width }]}>
              <View style={styles.illustrationCircle}>
                <Text style={styles.illustrationIcon}>{item.icon}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      {/* Bottom zone — white card */}
      <View style={styles.bottomZone}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / SLIDES.length) * 100}%` }]} />
        </View>

        <Text style={styles.benefitLabel}>{currentSlide.label}</Text>
        <Text style={styles.headline}>{currentSlide.title}</Text>
        <Text style={styles.body}>{currentSlide.body}</Text>

        <View style={styles.navRow}>
          {!isLast ? (
            <TouchableOpacity onPress={onComplete} style={styles.skipTouch}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
          <TouchableOpacity onPress={goToNext} style={styles.nextCircle} activeOpacity={0.7}>
            <Text style={styles.nextArrow}>{isLast ? '\u2192' : '\u203A'}</Text>
          </TouchableOpacity>
        </View>

        {isLast && (
          <TouchableOpacity onPress={onComplete} style={styles.getStartedTouch} activeOpacity={0.7}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  topZone: {
    height: SCREEN_HEIGHT * 0.52,
    backgroundColor: colors.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideTop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  illustrationIcon: {
    fontSize: 64,
    color: colors.border.default,
  },
  bottomZone: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 48,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.border.subtle,
    borderRadius: 2,
    marginBottom: spacing['6'],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.text.primary,
    borderRadius: 2,
  },
  benefitLabel: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: colors.accent.text,
    letterSpacing: 11 * 0.08,
    marginBottom: spacing['3'],
  },
  headline: {
    fontSize: 30,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    lineHeight: 38,
    letterSpacing: -0.3,
    marginBottom: spacing['3'],
  },
  body: {
    fontSize: 15,
    fontWeight: fontWeight.regular,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  skipTouch: {
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['1'],
  },
  skipText: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  nextCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextArrow: {
    fontSize: 22,
    color: colors.text.inverted,
    fontWeight: fontWeight.bold,
  },
  getStartedTouch: {
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing['4'],
  },
  getStartedText: {
    fontSize: 15,
    fontWeight: fontWeight.semibold,
    color: colors.text.inverted,
    letterSpacing: 0.01,
  },
});
