// mobile/src/screens/client/ClientProjectListScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { clientPortalApi } from '../../services/clientPortalApi';

const STATUS = {
  Pending:    { label: 'Beklemede',    color: '#d97706', bg: '#fffbeb' },
  InProgress: { label: 'Devam ediyor', color: '#2563eb', bg: '#eff6ff' },
  InRevision: { label: 'Revizyon',     color: '#7c3aed', bg: '#f5f3ff' },
  Completed:  { label: 'Tamamlandı',  color: '#059669', bg: '#ecfdf5' },
};

const TABS = ['Tümü', 'Aktif', 'Tamamlandı'];

export default function ClientProjectListScreen({ navigation }) {
  const [projects,   setProjects]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab,  setActiveTab]  = useState(0);
  const [search,     setSearch]     = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await clientPortalApi.getMyProjects();
      setProjects(data);
    } catch {
      // hata sessizce geçilir
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(true); };

  const filtered = projects
    .filter(p => {
      if (activeTab === 1) return p.status !== 'Completed';
      if (activeTab === 2) return p.status === 'Completed';
      return true;
    })
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} />;

  return (
    <View style={styles.container}>
      {/* Arama */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Proje ara..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tab filtre */}
      <View style={styles.tabBar}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setActiveTab(i)}
            style={[styles.tab, activeTab === i && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>Proje bulunamadı</Text>
          </View>
        }
        renderItem={({ item: p }) => {
          const st = STATUS[p.status] ?? STATUS.Pending;
          const progress = p.milestoneCount > 0
            ? Math.round((p.completedMilestoneCount / p.milestoneCount) * 100)
            : 0;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ClientProjectDetail', { projectId: p.id, projectName: p.name })}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardName} numberOfLines={2}>{p.name}</Text>
                <View style={[styles.badge, { backgroundColor: st.bg }]}>
                  <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>

              {p.budget != null && (
                <Text style={styles.budget}>Bütçe: ₺{p.budget.toLocaleString('tr-TR')}</Text>
              )}

              <View style={styles.progressSection}>
                <View style={styles.progressRow}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.progressPct}>{progress}%</Text>
                </View>
                <Text style={styles.milestoneCount}>
                  {p.completedMilestoneCount}/{p.milestoneCount} km taşı
                </Text>
              </View>

              {(p.pendingRequestCount ?? 0) > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>
                    {p.pendingRequestCount} bekleyen istek
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f1f5f9' },
  searchContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  searchInput:     { backgroundColor: '#f8fafc', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0' },
  tabBar:          { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingHorizontal: 12 },
  tab:             { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:       { borderBottomColor: '#7c3aed' },
  tabText:         { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive:   { color: '#7c3aed' },
  list:            { padding: 16, gap: 12, paddingBottom: 40 },
  empty:           { alignItems: 'center', paddingTop: 60 },
  emptyIcon:       { fontSize: 48, marginBottom: 12 },
  emptyText:       { fontSize: 14, color: '#94a3b8' },
  card:            { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  cardName:        { fontSize: 16, fontWeight: '700', color: '#0f172a', flex: 1 },
  badge:           { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, flexShrink: 0 },
  badgeText:       { fontSize: 11, fontWeight: '700' },
  budget:          { fontSize: 13, color: '#64748b', marginBottom: 10 },
  progressSection: { gap: 4 },
  progressRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBar:     { flex: 1, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  progressFill:    { height: '100%', backgroundColor: '#7c3aed', borderRadius: 3 },
  progressPct:     { fontSize: 12, color: '#64748b', minWidth: 32 },
  milestoneCount:  { fontSize: 11, color: '#94a3b8' },
  pendingBadge:    { marginTop: 10, backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  pendingBadgeText:{ fontSize: 12, fontWeight: '600', color: '#92400e' },
});
