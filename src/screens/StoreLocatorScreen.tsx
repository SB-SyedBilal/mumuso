import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, shadows } from '../constants/dimensions';
import { RootStackParamList, Store } from '../types';
import { api } from '../services/apiClient';
import Input from '../components/Input';

const H = 24;

interface Props { navigation: NativeStackNavigationProp<RootStackParamList, 'StoreLocator'>; }

export default function StoreLocatorScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadStores = async (searchTerm?: string) => {
    const query: Record<string, string | undefined> = {};
    if (searchTerm) query.search = searchTerm;
    const res = await api.get<{ stores: Store[] }>('/stores', query);
    if (res.success && res.data) setStores(res.data.stores || (res.data as any));
  };

  useEffect(() => { loadStores(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => { loadStores(search || undefined); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = async () => { setRefreshing(true); await loadStores(search || undefined); setRefreshing(false); };

  const filtered = stores;

  return (
    <View style={styles.screen}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Store Locator</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.searchWrap}>
        <Input placeholder="Search by area or store name" value={search} onChangeText={setSearch} containerStyle={{ marginBottom: 0 }} />
      </View>

      {/* NOT SUPPORTED YET: Map view requires Google Maps API key integration */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Map view coming soon</Text>
      </View>

      <Text style={styles.count}>{filtered.length} store{filtered.length !== 1 ? 's' : ''}</Text>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text.tertiary} />}>
        {filtered.map(store => {
          return (
            <View key={store.id} style={styles.storeCard}>
              <Text style={styles.storeName}>{store.name}</Text>
              <Text style={styles.storeAddr}>{store.address}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badge}><Text style={styles.badgeText}>{store.discount_pct}% off</Text></View>
                <View style={[styles.badge, store.is_open_now ? styles.openBadge : styles.closedBadge]}>
                  <Text style={[styles.badgeText, store.is_open_now ? styles.openText : styles.closedText]}>{store.is_open_now ? 'Open' : 'Closed'}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.actionRow}>
                {store.latitude && store.longitude && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`).catch(() => Alert.alert('Error', 'Could not open maps.'))}>
                    <Text style={styles.actionText}>Directions</Text>
                  </TouchableOpacity>
                )}
                {store.phone && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${store.phone}`).catch(() => Alert.alert('Error', 'Could not open dialer.'))}>
                    <Text style={styles.actionText}>Call</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: H, paddingTop: 56, paddingBottom: spacing['2'] },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: colors.text.primary },
  navTitle: { fontSize: 17, fontWeight: fontWeight.semibold, color: colors.text.primary },
  searchWrap: { paddingHorizontal: H, paddingBottom: spacing['3'] },
  mapPlaceholder: { height: 80, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center', marginHorizontal: H, borderRadius: radius.xl, marginBottom: spacing['4'] },
  mapText: { fontSize: 13, color: colors.text.tertiary, fontWeight: fontWeight.medium },
  count: { fontSize: 11, color: colors.text.tertiary, letterSpacing: 11 * 0.08, fontWeight: fontWeight.medium, paddingHorizontal: H, marginBottom: spacing['2'] },
  storeCard: { marginHorizontal: H, marginBottom: spacing['3'], backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing['5'], ...shadows.card },
  storeName: { fontSize: 16, fontWeight: fontWeight.semibold, color: colors.text.primary, marginBottom: 2 },
  storeAddr: { fontSize: 13, color: colors.text.secondary, lineHeight: 20 },
  badgeRow: { flexDirection: 'row', gap: spacing['2'], marginTop: spacing['3'] },
  badge: { paddingVertical: spacing['1'], paddingHorizontal: spacing['3'], borderRadius: radius.full, backgroundColor: colors.surfaceRaised },
  openBadge: { backgroundColor: 'rgba(74,155,127,0.12)' },
  closedBadge: { backgroundColor: colors.errorBg },
  badgeText: { fontSize: 11, color: colors.text.secondary, fontWeight: fontWeight.medium },
  openText: { color: colors.success },
  closedText: { color: colors.error },
  divider: { height: 1, backgroundColor: colors.border.subtle, marginVertical: spacing['3'] },
  actionRow: { flexDirection: 'row', gap: spacing['6'] },
  actionBtn: { paddingVertical: spacing['1'] },
  actionText: { fontSize: 14, color: colors.accent.text, fontWeight: fontWeight.medium },
});
