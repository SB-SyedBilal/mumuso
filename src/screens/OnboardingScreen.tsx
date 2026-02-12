import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const SLIDES = [
  { id: '1', title: 'Welcome to Mumuso', subtitle: 'Your favorite lifestyle store, now with exclusive member benefits', icon: '\u{1F381}' },
  { id: '2', title: 'Save 10% Every Time', subtitle: 'Get an instant 10% discount on every purchase at any Mumuso store', icon: '\u{1F4B0}' },
  { id: '3', title: 'Track Your Savings', subtitle: 'View purchase history, track savings, and manage your membership digitally', icon: '\u{1F4CA}' },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const goToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.slideIcon}>{item.icon}</Text>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>
        <Button
          title={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={goToNext}
          variant="primary"
          size="large"
          style={styles.nextButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  skipButton: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
  skipText: { fontSize: fontSize.md, color: colors.text.secondary, fontWeight: fontWeight.semibold },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  slideIcon: { fontSize: 80, marginBottom: spacing.xl },
  slideTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary, textAlign: 'center', marginBottom: spacing.md },
  slideSubtitle: { fontSize: fontSize.md, color: colors.text.secondary, textAlign: 'center', lineHeight: 24 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.neutral[200], marginHorizontal: 4 },
  dotActive: { width: 24, backgroundColor: colors.primary[600] },
  nextButton: { borderRadius: borderRadius.lg },
});
