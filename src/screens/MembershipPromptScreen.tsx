import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import Button from '../components/Button';

interface MembershipPromptScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const BENEFITS = [
  { icon: 'pricetag', title: 'Exclusive Discounts', desc: 'Save on every purchase' },
  { icon: 'gift', title: 'Special Offers', desc: 'Members-only deals' },
  { icon: 'star', title: 'Priority Access', desc: 'Early access to sales' },
  { icon: 'trophy', title: 'Rewards Program', desc: 'Earn points on purchases' },
];

export default function MembershipPromptScreen({ navigation }: MembershipPromptScreenProps) {
  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="diamond" size={48} color={colors.accent.default} />
          </View>
          <Text style={styles.headline}>Unlock Premium Benefits</Text>
          <Text style={styles.subheadline}>
            Join Mumuso Membership and start saving on every purchase
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Ionicons name={benefit.icon as any} size={24} color={colors.accent.default} />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDesc}>{benefit.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.ctaContainer}>
          <Button
            title="Get Membership Now"
            onPress={() => navigation.navigate('MembershipPurchase')}
            variant="gold"
            style={styles.primaryButton}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs')}
            style={styles.skipButton}>
            <Text style={styles.skipText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing['6'],
    paddingTop: 80,
    paddingBottom: spacing['8'],
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(155,123,63,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['6'],
  },
  headline: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing['3'],
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsContainer: {
    paddingHorizontal: spacing['6'],
    gap: spacing['3'],
    marginBottom: spacing['8'],
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing['4'],
    alignItems: 'center',
    ...shadows.card,
  },
  benefitIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(155,123,63,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing['4'],
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  ctaContainer: {
    paddingHorizontal: spacing['6'],
    paddingBottom: spacing['8'],
  },
  primaryButton: {
    marginBottom: spacing['4'],
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing['4'],
  },
  skipText: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
  },
});
