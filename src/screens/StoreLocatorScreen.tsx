import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList } from '../types';
import { MOCK_STORES } from '../services/mockData';
import { getOpeningStatus } from '../utils';
import Card from '../components/Card';
import Input from '../components/Input';

interface Props { navigation: NativeStackNavigationProp<RootStackParamList, 'StoreLocator'>; }

export default function StoreLocatorScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const filtered = MOCK_STORES.filter(s => s.store_name.toLowerCase().includes(search.toLowerCase()) || s.address.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>{'\u2190'} Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Stores</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={{ paddingHorizontal: spacing.lg, backgroundColor: '#ffffff', paddingBottom: spacing.sm }}>
        <Input placeholder="Search by area or store name" value={search} onChangeText={setSearch} containerStyle={{ marginBottom: 0 }} />
      </View>
      <View style={styles.mapPlaceholder}><Text style={{ fontSize: 32 }}>{'\u{1F5FA}'}</Text><Text style={styles.mapText}>Map View (Coming Soon)</Text></View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.count}>{filtered.length} store{filtered.length !== 1 ? 's' : ''} found</Text>
        {filtered.map(store => {
          const status = getOpeningStatus(store.opening_hours);
          return (
            <Card key={store.id} style={styles.storeCard} variant="outlined">
              <Text style={styles.storeName}>{store.store_name}</Text>
              <Text style={styles.storeAddr}>{store.address}</Text>
              <View style={styles.metaRow}>
                {store.distance !== undefined && <View style={styles.badge}><Text style={styles.badgeText}>{store.distance} km</Text></View>}
                <View style={[styles.badge, status.isOpen ? styles.openBadge : styles.closedBadge]}>
                  <Text style={[styles.badgeText, status.isOpen ? styles.openText : styles.closedText]}>{status.text}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`).catch(() => Alert.alert('Error', 'Could not open maps.'))}>
                  <Text style={styles.actionIcon}>{'\u{1F4CD}'}</Text><Text style={styles.actionText}>Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${store.phone_number}`).catch(() => Alert.alert('Error', 'Could not open dialer.'))}>
                  <Text style={styles.actionIcon}>{'\u{1F4DE}'}</Text><Text style={styles.actionText}>Call</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, backgroundColor: '#ffffff' },
  backText: { fontSize: fontSize.md, color: colors.primary[600], fontWeight: fontWeight.semibold },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  mapPlaceholder: { height: 100, backgroundColor: colors.neutral[100], alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.lg, marginTop: spacing.md, borderRadius: borderRadius.lg },
  mapText: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: fontWeight.semibold },
  count: { fontSize: fontSize.sm, color: colors.text.secondary, paddingHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm },
  storeCard: { marginHorizontal: spacing.lg, marginBottom: spacing.sm + 2 },
  storeName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: 2 },
  storeAddr: { fontSize: fontSize.sm, color: colors.text.secondary, lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  badge: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm + 2, borderRadius: borderRadius.full, backgroundColor: colors.neutral[100] },
  openBadge: { backgroundColor: '#D1FAE5' },
  closedBadge: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: fontSize.xs, color: colors.text.secondary, fontWeight: fontWeight.medium },
  openText: { color: '#065F46' },
  closedText: { color: '#991B1B' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.neutral[100], paddingTop: spacing.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionIcon: { fontSize: 16 },
  actionText: { fontSize: fontSize.sm, color: colors.primary[600], fontWeight: fontWeight.semibold },
});
