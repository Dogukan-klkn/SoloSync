// src/screens/main/HomeScreen.js — Freelancer Dashboard Ana Sayfası
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { projectApi } from '../../services/projectApi';
import { customerApi } from '../../services/customerApi';
import { invoiceApi } from '../../services/invoiceApi';
import { timeEntryApi } from '../../services/timeEntryApi';
import * as SecureStore from 'expo-secure-store';

const STATUS_MAP = {
  Pending: { label: 'Beklemede', color: '#d97706', bg: '#fffbeb' },
  InProgress: { label: 'Devam Ediyor', color: '#2563eb', bg: '#eff6ff' },
  InRevision: { label: 'Revizyon', color: '#7c3aed', bg: '#f5f3ff' },
  Completed: { label: 'Tamamlandı', color: '#059669', bg: '#ecfdf5' },
};

function startEndOfLocalDayISO() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return { from: start.toISOString(), to: end.toISOString() };
}

function isOverdueInvoice(inv) {
  if (inv.status === 'Overdue') return true;
  if (inv.status === 'Paid' || inv.status === 'Draft') return false;
  const due = new Date(inv.dueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (due >= today) return false;
  return ['Sent', 'ClientApproved', 'RevisionRequested'].includes(inv.status);
}

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

/** Bugünkü çalışma — sayı + sağda küçük «sa» */
function KpiHoursCard({ hours, label, color, onPress }) {
  const h = Number(hours) || 0;
  const display = (Math.round(h * 10) / 10).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  return (
    <TouchableOpacity
      style={[styles.kpiCard, { borderTopColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.kpiValueRow}>
        <Text style={[styles.kpiValue, { color }]}>{display}</Text>
        <Text style={styles.kpiSuffix}>sa</Text>
      </View>
      <Text style={styles.kpiLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function QuickAction({ emoji, label, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.quickBtn, { borderColor: `${color}30`, backgroundColor: `${color}10` }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.quickEmoji}>{emoji}</Text>
      <Text style={[styles.quickLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ProjectMiniCard({ project, onPress }) {
  const st = STATUS_MAP[project.status] ?? STATUS_MAP.Pending;
  const pct =
    project.milestoneCount > 0
      ? Math.round((project.completedMilestoneCount / project.milestoneCount) * 100)
      : 0;

  return (
    <TouchableOpacity style={styles.projectMini} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.projectMiniHeader}>
        <Text style={styles.projectMiniName} numberOfLines={1}>
          {project.name}
        </Text>
        <View style={[styles.smallBadge, { backgroundColor: st.bg }]}>
          <Text style={[styles.smallBadgeText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
      <Text style={styles.projectMiniCustomer} numberOfLines={1}>
        {project.customerName}
      </Text>
      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.progressPct}>{pct}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState({
    active: 0,
    total: 0,
    customers: 0,
    completed: 0,
    overdueInvoices: 0,
    todayHours: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await SecureStore.getItemAsync('user');
      if (raw) setUser(JSON.parse(raw));

      const { from, to } = startEndOfLocalDayISO();

      const [projRes, custRes, invRes, sumRes] = await Promise.all([
        projectApi.getAll(),
        customerApi.getAll(),
        invoiceApi.getAll().catch(() => ({ data: [] })),
        timeEntryApi.getSummary({ from, to }).catch(() => ({ data: { totalSeconds: 0 } })),
      ]);

      const projects = Array.isArray(projRes.data) ? projRes.data : [];
      const customers = Array.isArray(custRes.data) ? custRes.data : [];
      const invoices = Array.isArray(invRes.data) ? invRes.data : [];

      const active = projects.filter((p) => p.status === 'InProgress' || p.status === 'Pending').length;
      const completed = projects.filter((p) => p.status === 'Completed').length;
      const overdueInvoices = invoices.filter(isOverdueInvoice).length;
      const totalSeconds = sumRes.data?.totalSeconds ?? 0;
      const todayHours = totalSeconds / 3600;

      setStats({
        active,
        total: projects.length,
        customers: customers.length,
        completed,
        overdueInvoices,
        todayHours,
      });

      const sortedProjects = [...projects]
        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
        .slice(0, 5);
      setRecentProjects(sortedProjects);
    } catch (e) {
      console.log('[HomeScreen] loadData error:', e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const firstName = user?.fullName?.split(' ')[0] ?? 'Freelancer';
  const bottomPad = 88 + Math.max(insets.bottom, 14);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Merhaba 👋</Text>
          <Text style={styles.userName}>{firstName}</Text>
          <Text style={styles.subtitle}>İşlerinize genel bakış</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('Settings')} accessibilityLabel="Ayarlar">
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 40 }} />
      ) : (
        <>
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
            <KpiCard
              value={stats.overdueInvoices}
              label="Gecikmiş Fatura"
              color="#dc2626"
              onPress={() => navigation.navigate('Invoices')}
            />
            <KpiHoursCard
              hours={stats.todayHours}
              label="Bugünkü Çalışma"
              color="#0d9488"
              onPress={() => navigation.navigate('TimeTracker')}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Projeler</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
              <Text style={styles.seeAll}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          {recentProjects.length === 0 ? (
            <Text style={styles.emptyHint}>Henüz proje yok. Hızlı işlemlerden yeni proje oluşturabilirsiniz.</Text>
          ) : (
            recentProjects.map((p) => (
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
            ))
          )}

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Hızlı İşlemler</Text>
          <View style={styles.quickWrap}>
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
              emoji="🧾"
              label="Faturalar"
              color="#6366f1"
              onPress={() => navigation.navigate('Invoices')}
            />
            <QuickAction
              emoji="⏱"
              label="Süre Takibi"
              color="#f59e0b"
              onPress={() => navigation.navigate('TimeTracker')}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 20, paddingTop: 10 },

  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, marginTop: 10 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 14, color: '#64748b', fontWeight: '600', marginBottom: 2 },
  userName: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8' },
  avatarBtn: { paddingTop: 4 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff' },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  kpiCard: {
    width: '47.5%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  kpiValueRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
  kpiValue: { fontSize: 28, fontWeight: '800' },
  kpiSuffix: { fontSize: 12, color: '#94a3b8', fontWeight: '700', marginLeft: 3, marginBottom: 4 },
  kpiLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', textAlign: 'center' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  seeAll: { fontSize: 13, color: '#0ea5e9', fontWeight: '700' },
  emptyHint: { fontSize: 13, color: '#94a3b8', marginBottom: 16, lineHeight: 20 },

  quickWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  quickBtn: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  quickEmoji: { fontSize: 22 },
  quickLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  projectMini: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  projectMiniHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  projectMiniName: { fontSize: 15, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 8 },
  projectMiniCustomer: { fontSize: 12, color: '#64748b', marginBottom: 10 },
  smallBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  smallBadgeText: { fontSize: 10, fontWeight: '700' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBar: { flex: 1, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0ea5e9', borderRadius: 3 },
  progressPct: { fontSize: 11, color: '#64748b', minWidth: 32, textAlign: 'right' },
});

export default HomeScreen;
