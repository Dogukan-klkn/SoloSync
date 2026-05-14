// src/screens/main/HomeScreen.js — Freelancer Dashboard Ana Sayfası
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, DeviceEventEmitter, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { projectApi }  from '../../services/projectApi';
import { customerApi } from '../../services/customerApi';
import * as SecureStore from 'expo-secure-store';

// Durum etiket haritası
const STATUS_MAP = {
  Pending:    { label: 'Beklemede',    color: '#d97706', bg: '#fffbeb' },
  InProgress: { label: 'Devam Ediyor', color: '#2563eb', bg: '#eff6ff' },
  InRevision: { label: 'Revizyon',     color: '#7c3aed', bg: '#f5f3ff' },
  Completed:  { label: 'Tamamlandı',   color: '#059669', bg: '#ecfdf5' },
};

// ─── KPI Kartı ──────────────────────────────────────────────
function KpiCard({ value, label, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.kpiCard, { borderTopColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Hızlı Aksiyon Butonu ───────────────────────────────────
function QuickAction({ emoji, label, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.quickBtn, { borderColor: color + '30', backgroundColor: color + '10' }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.quickEmoji}>{emoji}</Text>
      <Text style={[styles.quickLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Proje mini kartı ───────────────────────────────────────
function ProjectMiniCard({ project, onPress }) {
  const st  = STATUS_MAP[project.status] ?? STATUS_MAP.Pending;
  const pct = project.milestoneCount > 0
    ? Math.round((project.completedMilestoneCount / project.milestoneCount) * 100)
    : 0;

  return (
    <TouchableOpacity style={styles.projectMini} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.projectMiniHeader}>
        <Text style={styles.projectMiniName} numberOfLines={1}>{project.name}</Text>
        <View style={[styles.smallBadge, { backgroundColor: st.bg }]}>
          <Text style={[styles.smallBadgeText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
      <Text style={styles.projectMiniCustomer} numberOfLines={1}>{project.customerName}</Text>
      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.progressPct}>{pct}%</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Ana Bileşen ────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const [stats,    setStats]   = useState({ active: 0, total: 0, customers: 0, completed: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading,  setLoading] = useState(true);
  const [user,     setUser]    = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await SecureStore.getItemAsync('user');
      if (raw) setUser(JSON.parse(raw));

      const [{ data: projects }, { data: customers }] = await Promise.all([
        projectApi.getAll(),
        customerApi.getAll(),
      ]);

      const active    = projects.filter(p => p.status === 'InProgress' || p.status === 'Pending').length;
      const completed = projects.filter(p => p.status === 'Completed').length;

      setStats({
        active,
        total:     projects.length,
        customers: customers.length,
        completed,
      });

      // Son 3 aktif/bekleyen proje göster
      const sorted = [...projects]
        .filter(p => p.status !== 'Completed')
        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
        .slice(0, 3);
      setRecentProjects(sorted);
    } catch (e) {
      console.log('[HomeScreen] loadData error:', e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleLogout = () => {
    Alert.alert('Çıkış', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: () => DeviceEventEmitter.emit('logout'),
      },
    ]);
  };

  const firstName = user?.fullName?.split(' ')[0] ?? 'Freelancer';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Karşılama başlığı ─── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Merhaba 👋</Text>
          <Text style={styles.userName}>{firstName}</Text>
          <Text style={styles.subtitle}>İşlerinize genel bakış</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* ─── KPI Kartları ─── */}
          <View style={styles.kpiGrid}>
            <KpiCard
              value={stats.active}
              label="Aktif Proje"
              color="#0ea5e9"
              onPress={() => navigation.navigate('Projects')}
            />
            <KpiCard
              value={stats.completed}
              label="Tamamlandı"
              color="#059669"
              onPress={() => navigation.navigate('Projects')}
            />
            <KpiCard
              value={stats.customers}
              label="Müşteri"
              color="#8b5cf6"
              onPress={() => navigation.navigate('Customers')}
            />
            <KpiCard
              value={stats.total}
              label="Toplam Proje"
              color="#f59e0b"
              onPress={() => navigation.navigate('Projects')}
            />
          </View>

          {/* ─── Hızlı Aksiyonlar ─── */}
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickRow}>
            <QuickAction
              emoji="➕"
              label="Yeni Proje"
              color="#0ea5e9"
              onPress={() => navigation.navigate('Projects', { screen: 'ProjectForm', params: { project: null } })}
            />
            <QuickAction
              emoji="👤"
              label="Müşteri Ekle"
              color="#8b5cf6"
              onPress={() => navigation.navigate('Customers', { screen: 'CustomerForm', params: { customer: null } })}
            />
            <QuickAction
              emoji="⏱"
              label="Süre Takibi"
              color="#f59e0b"
              onPress={() => navigation.navigate('TimeTracker')}
            />
          </View>

          {/* ─── Devam eden projeler ─── */}
          {recentProjects.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Devam Eden Projeler</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
                  <Text style={styles.seeAll}>Tümü →</Text>
                </TouchableOpacity>
              </View>
              {recentProjects.map(p => (
                <ProjectMiniCard
                  key={p.id}
                  project={p}
                  onPress={() =>
                    navigation.navigate('Projects', {
                      screen: 'ProjectDetail',
                      params: { projectId: p.id },
                    })
                  }
                />
              ))}
            </>
          )}

          {/* ─── Çıkış butonu ─── */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪  Çıkış Yap</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content:   { padding: 20, paddingBottom: 60 },

  // Başlık
  header:      { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, marginTop: 10 },
  headerLeft:  { flex: 1 },
  greeting:    { fontSize: 14, color: '#64748b', fontWeight: '600', marginBottom: 2 },
  userName:    { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  subtitle:    { fontSize: 14, color: '#94a3b8' },
  avatarBtn:   { paddingTop: 4 },
  avatar:      { width: 48, height: 48, borderRadius: 14, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 20, fontWeight: '800', color: '#fff' },

  // KPI
  kpiGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  kpiCard:   { width: '47.5%', backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', borderTopWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  kpiValue:  { fontSize: 30, fontWeight: '800', marginBottom: 4 },
  kpiLabel:  { fontSize: 12, color: '#64748b', fontWeight: '600', textAlign: 'center' },

  // Hızlı aksiyonlar
  quickRow:  { flexDirection: 'row', gap: 8, marginBottom: 28 },
  quickBtn:  { flex: 1, borderRadius: 14, borderWidth: 1.5, padding: 12, alignItems: 'center', gap: 6 },
  quickEmoji:{ fontSize: 22 },
  quickLabel:{ fontSize: 11, fontWeight: '700', textAlign: 'center' },

  // Bölüm başlıkları
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:  { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  seeAll:        { fontSize: 13, color: '#0ea5e9', fontWeight: '700' },

  // Proje mini kartı
  projectMini:        { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  projectMiniHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  projectMiniName:    { fontSize: 15, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 8 },
  projectMiniCustomer:{ fontSize: 12, color: '#64748b', marginBottom: 10 },
  smallBadge:         { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  smallBadgeText:     { fontSize: 10, fontWeight: '700' },
  progressRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBar:        { flex: 1, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  progressFill:       { height: '100%', backgroundColor: '#0ea5e9', borderRadius: 3 },
  progressPct:        { fontSize: 11, color: '#64748b', minWidth: 32, textAlign: 'right' },

  // Çıkış
  logoutBtn:  { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 16, borderWidth: 1.5, borderColor: '#fca5a5' },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
});

export default HomeScreen;
