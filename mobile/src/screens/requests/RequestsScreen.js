// src/screens/requests/RequestsScreen.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK = [
  { id: '1', title: 'Anasayfa tasarım revizyonu', project: 'E-Ticaret Projesi', client: 'Acme A.Ş.', date: '20.05.2025', status: 'pending' },
  { id: '2', title: 'Mobil uyumluluk iyileştirmesi', project: 'Kurumsal Web', client: 'Beta Ltd.', date: '18.05.2025', status: 'approved' },
  { id: '3', title: 'Ödeme entegrasyonu hatası', project: 'E-Ticaret Projesi', client: 'Acme A.Ş.', date: '15.05.2025', status: 'rejected' },
];

const STATUS_MAP = {
  pending:  { label: 'Beklemede',  color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  approved: { label: 'Onaylandı', color: '#059669', bg: '#ecfdf5', dot: '#10b981' },
  rejected: { label: 'Reddedildi', color: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
};

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const pending  = MOCK.filter(r => r.status === 'pending').length;
  const approved = MOCK.filter(r => r.status === 'approved').length;
  const rejected = MOCK.filter(r => r.status === 'rejected').length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 64 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Başlık */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>İstekler</Text>
        <Text style={styles.headerSub}>Müşterilerden gelen talepler</Text>
        <View style={styles.comingBadge}>
          <Text style={styles.comingText}>Yakında</Text>
        </View>
      </View>

      {/* KPI */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: '#fffbeb' }]}>
          <Text style={[styles.kpiValue, { color: '#d97706' }]}>{pending}</Text>
          <Text style={styles.kpiLabel}>Beklemede</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#ecfdf5' }]}>
          <Text style={[styles.kpiValue, { color: '#059669' }]}>{approved}</Text>
          <Text style={styles.kpiLabel}>Onaylandı</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#fef2f2' }]}>
          <Text style={[styles.kpiValue, { color: '#dc2626' }]}>{rejected}</Text>
          <Text style={styles.kpiLabel}>Reddedildi</Text>
        </View>
      </View>

      {/* Coming soon banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerEmoji}>📬</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>İstekler modülü geliştiriliyor</Text>
          <Text style={styles.bannerSub}>
            Müşteri revizyon ve taleplerini buradan yönetebileceksiniz.
          </Text>
        </View>
      </View>

      {/* Demo list */}
      <Text style={styles.sectionTitle}>Örnek Kayıtlar (Demo)</Text>
      {MOCK.map(item => {
        const s = STATUS_MAP[item.status];
        return (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={[styles.dot, { backgroundColor: s.dot }]} />
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                </View>
              </View>
              <Text style={styles.cardMeta}>{item.project} · {item.client}</Text>
              <Text style={styles.cardDate}>{item.date}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content:   { padding: 16 },

  header:      { marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  headerSub:   { fontSize: 13, color: '#64748b', marginTop: 2 },
  comingBadge: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#fef3c7', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  comingText:  { fontSize: 11, fontWeight: '700', color: '#d97706' },

  kpiRow:  { flexDirection: 'row', gap: 10, marginBottom: 14 },
  kpiCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  kpiValue:{ fontSize: 24, fontWeight: '800' },
  kpiLabel:{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: '600' },

  banner:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#eff6ff', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#bfdbfe' },
  bannerEmoji: { fontSize: 28, lineHeight: 32 },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: '#1e40af', marginBottom: 3 },
  bannerSub:   { fontSize: 12, color: '#3b82f6', lineHeight: 17 },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 10 },

  card:     { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cardLeft: { paddingTop: 5, marginRight: 12 },
  dot:      { width: 10, height: 10, borderRadius: 5 },
  cardBody: { flex: 1 },
  cardTop:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, gap: 8 },
  cardTitle:{ fontSize: 13, fontWeight: '700', color: '#0f172a', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, flexShrink: 0 },
  statusText:  { fontSize: 10, fontWeight: '700' },
  cardMeta: { fontSize: 12, color: '#64748b' },
  cardDate: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
});
