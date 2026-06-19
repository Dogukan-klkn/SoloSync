// mobile/src/screens/client/ClientHomeScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { clientPortalApi } from '../../services/clientPortalApi';

const STATUS = {
  Pending:    { label: 'Beklemede',    color: '#d97706', bg: '#fffbeb' },
  InProgress: { label: 'Devam ediyor', color: '#2563eb', bg: '#eff6ff' },
  InRevision: { label: 'Revizyon',     color: '#7c3aed', bg: '#f5f3ff' },
  Completed:  { label: 'Tamamlandı',  color: '#059669', bg: '#ecfdf5' },
};

const INV_STATUS = {
  Draft:             { label: 'Taslak',          color: '#64748b', bg: '#f8fafc' },
  Sent:              { label: 'Onay bekliyor',   color: '#2563eb', bg: '#eff6ff' },
  Paid:              { label: 'Ödendi',           color: '#059669', bg: '#ecfdf5' },
  Overdue:           { label: 'Gecikmiş',         color: '#dc2626', bg: '#fef2f2' },
  ClientApproved:    { label: 'Onaylandı',        color: '#7c3aed', bg: '#f5f3ff' },
  RevisionRequested: { label: 'Revizyon istendi', color: '#d97706', bg: '#fffbeb' },
};

export default function ClientHomeScreen({ navigation }) {
  const [profile,  setProfile]  = useState(null);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [profileRes, projectsRes, invoicesRes] = await Promise.all([
        clientPortalApi.getMyProfile(),
        clientPortalApi.getMyProjects(),
        clientPortalApi.getMyInvoices(),
      ]);
      setProfile(profileRes);
      setProjects(projectsRes);
      setInvoices(invoicesRes);
    } catch (e) {
      if (!silent) Alert.alert('Hata', 'Veriler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(true); };

  if (loading) return <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} />;

  if (!profile) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>📧</Text>
        <Text style={styles.emptyTitle}>Davet bekleniyor</Text>
        <Text style={styles.emptyDesc}>
          Freelancer'ınız sizi sisteme eklediğinde e-posta adresinize bir davet kodu gelecektir.
          Web tarayıcınızdan solosync.app/client-setup adresine giderek hesabınızı aktive edebilirsiniz.
        </Text>
      </View>
    );
  }

  const activeProjects   = projects.filter(p => p.status !== 'Completed');
  const pendingInvoices  = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue');
  const totalBilled      = invoices.reduce((s, i) => s + (i.totalAmount ?? 0), 0);
  const totalPending     = projects.reduce((s, p) => s + (p.pendingRequestCount ?? 0), 0);
  const recentProjects   = projects.slice(0, 3);
  const recentInvoices   = invoices.slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
    >
      {/* Karşılama */}
      <View style={styles.welcomeCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{profile.companyName?.[0] ?? 'M'}</Text>
        </View>
        <View style={styles.welcomeText}>
          <Text style={styles.welcomeHi}>Merhaba 👋</Text>
          <Text style={styles.companyName} numberOfLines={1}>{profile.companyName}</Text>
          <Text style={styles.freelancerName}>{profile.freelancerName} ile çalışıyorsunuz</Text>
        </View>
      </View>

      {/* Bekleyen istek banner */}
      {totalPending > 0 && (
        <TouchableOpacity
          style={styles.pendingBanner}
          onPress={() => navigation.navigate('ClientRequests', { projects })}
        >
          <Text style={styles.pendingBannerIcon}>📋</Text>
          <View style={styles.pendingBannerText}>
            <Text style={styles.pendingBannerTitle}>{totalPending} bekleyen istek</Text>
            <Text style={styles.pendingBannerDesc}>Freelancer'ınız incelemenizi bekliyor</Text>
          </View>
          <Text style={styles.pendingBannerArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* KPI Kartları */}
      <View style={styles.kpiRow}>
        <KpiCard label="Aktif Proje"      value={activeProjects.length}  color="#2563eb" />
        <KpiCard label="Bekleyen Fatura"  value={pendingInvoices.length} color="#d97706" />
        <KpiCard label="Tamamlanan"       value={projects.filter(p => p.status === 'Completed').length} color="#059669" />
        <KpiCard label="Toplam Fatura"    value={`₺${(totalBilled / 1000).toFixed(0)}K`} color="#7c3aed" />
      </View>

      {/* Son Projeler */}
      <SectionCard
        title="Projelerim"
        onSeeAll={() => navigation.navigate('ClientProjects')}
      >
        {recentProjects.length === 0 ? (
          <Text style={styles.emptySection}>Henüz proje yok</Text>
        ) : recentProjects.map(p => {
          const st = STATUS[p.status] ?? STATUS.Pending;
          const progress = p.progressPercentage ?? (
            p.milestoneCount > 0
              ? Math.round((p.completedMilestoneCount / p.milestoneCount) * 100)
              : 0
          );
          return (
            <TouchableOpacity
              key={p.id}
              style={styles.listItem}
              onPress={() => navigation.navigate('ClientProjects', { screen: 'ClientProjectDetail', params: { projectId: p.id, projectName: p.name } })}
            >
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemTitle} numberOfLines={1}>{p.name}</Text>
                <View style={[styles.badge, { backgroundColor: st.bg }]}>
                  <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
              <View style={styles.progressRow}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressPct}>{progress}%</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </SectionCard>

      {/* Son Faturalar */}
      <SectionCard
        title="Son Faturalar"
        onSeeAll={() => navigation.navigate('ClientInvoices')}
      >
        {recentInvoices.length === 0 ? (
          <Text style={styles.emptySection}>Henüz fatura yok</Text>
        ) : recentInvoices.map(inv => {
          const st = INV_STATUS[inv.status] ?? INV_STATUS.Draft;
          return (
            <TouchableOpacity
              key={inv.id}
              style={styles.listItem}
              onPress={() => navigation.navigate('ClientInvoices', { screen: 'ClientInvoiceDetail', params: { invoiceId: inv.id } })}
            >
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemTitle}>{inv.invoiceNumber}</Text>
                <Text style={styles.invoiceAmount}>₺{(inv.totalAmount ?? 0).toLocaleString('tr-TR')}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: st.bg, alignSelf: 'flex-start', marginTop: 4 }]}>
                <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </SectionCard>
    </ScrollView>
  );
}

const KpiCard = ({ label, value, color }) => (
  <View style={[styles.kpiCard, { borderTopColor: color }]}>
    <Text style={[styles.kpiValue, { color }]}>{value}</Text>
    <Text style={styles.kpiLabel}>{label}</Text>
  </View>
);

const SectionCard = ({ title, onSeeAll, children }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAll}>Tümü</Text>
      </TouchableOpacity>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f1f5f9' },
  content:          { padding: 16, paddingBottom: 40 },
  emptyState:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon:        { fontSize: 48, marginBottom: 12 },
  emptyTitle:       { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  emptyDesc:        { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  welcomeCard:      { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  avatarCircle:     { width: 48, height: 48, borderRadius: 24, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  avatarText:       { fontSize: 20, fontWeight: '800', color: '#fff' },
  welcomeText:      { flex: 1 },
  welcomeHi:        { fontSize: 13, color: '#64748b' },
  companyName:      { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  freelancerName:   { fontSize: 12, color: '#7c3aed', fontWeight: '500', marginTop: 2 },
  pendingBanner:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 14, padding: 14, marginBottom: 12 },
  pendingBannerIcon:{ fontSize: 22 },
  pendingBannerText:{ flex: 1 },
  pendingBannerTitle:{ fontSize: 14, fontWeight: '700', color: '#92400e' },
  pendingBannerDesc: { fontSize: 12, color: '#b45309', marginTop: 2 },
  pendingBannerArrow:{ fontSize: 22, color: '#d97706', fontWeight: '300' },
  kpiRow:           { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpiCard:          { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', borderTopWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  kpiValue:         { fontSize: 20, fontWeight: '800', marginBottom: 3 },
  kpiLabel:         { fontSize: 10, color: '#64748b', textAlign: 'center' },
  sectionCard:      { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:     { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  seeAll:           { fontSize: 13, color: '#7c3aed', fontWeight: '600' },
  listItem:         { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  listItemHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  listItemTitle:    { fontSize: 14, fontWeight: '600', color: '#1e293b', flex: 1, marginRight: 8 },
  badge:            { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText:        { fontSize: 11, fontWeight: '700' },
  progressRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBar:      { flex: 1, height: 5, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  progressFill:     { height: '100%', backgroundColor: '#7c3aed', borderRadius: 3 },
  progressPct:      { fontSize: 11, color: '#64748b', minWidth: 28 },
  invoiceAmount:    { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  emptySection:     { fontSize: 13, color: '#cbd5e1', textAlign: 'center', paddingVertical: 16 },
});
