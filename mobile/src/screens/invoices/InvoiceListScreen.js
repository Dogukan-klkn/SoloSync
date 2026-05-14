import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { invoiceApi } from '../../services/invoiceApi';

const STATUS = {
  Draft:             { label: 'Taslak',           color: '#64748b', bg: '#f8fafc' },
  Sent:              { label: 'Gönderildi',       color: '#2563eb', bg: '#eff6ff' },
  Paid:              { label: 'Ödendi',           color: '#059669', bg: '#ecfdf5' },
  Overdue:           { label: 'Gecikmiş',         color: '#dc2626', bg: '#fef2f2' },
  ClientApproved:    { label: 'Onaylandı',        color: '#059669', bg: '#ecfdf5' },
  RevisionRequested: { label: 'Revizyon',         color: '#d97706', bg: '#fffbeb' },
};

const TABS = [
  { label: 'Tümü', key: '' },
  { label: 'Taslak', key: 'Draft' },
  { label: 'Gönderildi', key: 'Sent' },
  { label: 'Onaylı', key: 'ClientApproved' },
  { label: 'Ödendi', key: 'Paid' },
  { label: 'Gecikmiş', key: 'Overdue' },
];

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function InvoiceListScreen({ navigation }) {
  const [invoices,   setInvoices]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab,  setActiveTab]  = useState(0);

  const statusFilter = TABS[activeTab]?.key;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await invoiceApi.getAll(statusFilter || undefined);
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('InvoiceForm')}
          style={{ marginRight: 16, paddingVertical: 4 }}
        >
          <Text style={{ color: '#38bdf8', fontWeight: '800', fontSize: 15 }}>+ Yeni</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 60 }} />;
  }

  return (
    <View style={styles.root}>
      <View style={styles.tabRow}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab.key || 'all'}
            onPress={() => setActiveTab(i)}
            style={[styles.tab, activeTab === i && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]} numberOfLines={1}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyText}>Fatura bulunamadı</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('InvoiceForm')}>
              <Text style={styles.emptyBtnText}>Yeni fatura oluştur</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const st = STATUS[item.status] ?? STATUS.Draft;
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('InvoiceDetail', {
                  invoiceId: item.id,
                  title: item.invoiceNumber,
                })
              }
            >
              <View style={styles.cardTop}>
                <Text style={styles.invNo}>{item.invoiceNumber}</Text>
                <View style={[styles.badge, { backgroundColor: st.bg }]}>
                  <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
              <Text style={styles.customer} numberOfLines={1}>{item.customerName}</Text>
              <View style={styles.cardBottom}>
                <Text style={styles.amount}>₺{Number(item.totalAmount ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
                <Text style={styles.dates}>Vade {formatDate(item.dueDate)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#f1f5f9' },
  tabRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8 },
  tab:        { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0' },
  tabActive:  { backgroundColor: '#0ea5e9' },
  tabText:    { fontSize: 12, fontWeight: '600', color: '#475569' },
  tabTextActive: { color: '#fff' },
  list:       { padding: 12, paddingBottom: 28 },
  card:       { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  invNo:      { fontSize: 16, fontWeight: '800', color: '#0f172a', flex: 1, marginRight: 8 },
  badge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
  badgeText:  { fontSize: 11, fontWeight: '700' },
  customer:   { fontSize: 13, color: '#64748b', marginBottom: 10 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount:     { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  dates:      { fontSize: 12, color: '#94a3b8' },
  empty:      { alignItems: 'center', paddingTop: 48 },
  emptyIcon:  { fontSize: 40, marginBottom: 8 },
  emptyText:  { fontSize: 15, color: '#64748b', marginBottom: 16 },
  emptyBtn:   { backgroundColor: '#0ea5e9', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '800' },
});
