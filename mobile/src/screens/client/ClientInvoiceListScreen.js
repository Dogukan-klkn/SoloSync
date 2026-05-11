// mobile/src/screens/client/ClientInvoiceListScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { clientPortalApi } from '../../services/clientPortalApi';

const STATUS = {
  Draft:             { label: 'Taslak',           color: '#64748b', bg: '#f8fafc' },
  Sent:              { label: 'Onay bekliyor',    color: '#2563eb', bg: '#eff6ff' },
  Paid:              { label: 'Ödendi',            color: '#059669', bg: '#ecfdf5' },
  Overdue:           { label: 'Gecikmiş',          color: '#dc2626', bg: '#fef2f2' },
  ClientApproved:    { label: 'Onaylandı',         color: '#7c3aed', bg: '#f5f3ff' },
  RevisionRequested: { label: 'Revizyon istendi',  color: '#d97706', bg: '#fffbeb' },
};

const TABS = ['Tümü', 'Onay Bekleyen', 'Ödendi', 'Gecikmiş'];
const TAB_FILTER = [null, 'Sent', 'Paid', 'Overdue'];

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function ClientInvoiceListScreen({ navigation }) {
  const [invoices,   setInvoices]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab,  setActiveTab]  = useState(0);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await clientPortalApi.getMyInvoices();
      setInvoices(data);
    } catch {
      // sessiz
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(true); };

  const filtered = activeTab === 0
    ? invoices
    : invoices.filter(i => i.status === TAB_FILTER[activeTab]);

  const pendingCount = invoices.filter(i => i.status === 'Sent').length;
  const overdueCount = invoices.filter(i => i.status === 'Overdue').length;

  if (loading) return <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} />;

  return (
    <View style={styles.container}>
      {/* Özet kartlar */}
      <View style={styles.summaryRow}>
        <SummaryCard label="Toplam" value={invoices.length} color="#7c3aed" />
        <SummaryCard label="Onay Bekl." value={pendingCount} color="#2563eb" alert={pendingCount > 0} />
        <SummaryCard label="Gecikmiş" value={overdueCount} color="#dc2626" alert={overdueCount > 0} />
        <SummaryCard
          label="Ödenen"
          value={`₺${invoices
            .filter(i => i.status === 'Paid')
            .reduce((s, i) => s + (i.totalAmount ?? 0), 0)
            .toLocaleString('tr-TR')}`}
          color="#059669"
          small
        />
      </View>

      {/* Tab bar */}
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
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyText}>Fatura bulunamadı</Text>
          </View>
        }
        renderItem={({ item: inv }) => {
          const st = STATUS[inv.status] ?? STATUS.Draft;
          const isOverdue = inv.status === 'Overdue';
          const isPending = inv.status === 'Sent';
          return (
            <TouchableOpacity
              style={[styles.card, (isOverdue || isPending) && styles.cardHighlighted]}
              onPress={() => navigation.navigate('ClientInvoiceDetail', { invoiceId: inv.id })}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.invoiceNumber}>{inv.invoiceNumber}</Text>
                  <Text style={styles.invoiceCustomer}>{inv.customerName}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.amount}>₺{(inv.totalAmount ?? 0).toLocaleString('tr-TR')}</Text>
                  <View style={[styles.badge, { backgroundColor: st.bg }]}>
                    <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.dateLabel}>Kesim: {formatDate(inv.issueDate)}</Text>
                <Text style={[styles.dateLabel, isOverdue && styles.overdueDate]}>
                  Vade: {formatDate(inv.dueDate)}
                </Text>
              </View>
              {isPending && (
                <Text style={styles.actionHint}>👆 Onaylamak için dokunun</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const SummaryCard = ({ label, value, color, alert, small }) => (
  <View style={[styles.summaryCard, alert && styles.summaryCardAlert]}>
    <Text style={[styles.summaryValue, { color, fontSize: small ? 13 : 18 }]}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#f1f5f9' },
  summaryRow:         { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  summaryCard:        { flex: 1, backgroundColor: '#f8fafc', borderRadius: 10, padding: 10, alignItems: 'center' },
  summaryCardAlert:   { backgroundColor: '#fef2f2' },
  summaryValue:       { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  summaryLabel:       { fontSize: 10, color: '#64748b', textAlign: 'center' },
  tabBar:             { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingHorizontal: 8 },
  tab:                { flex: 1, paddingVertical: 11, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:          { borderBottomColor: '#7c3aed' },
  tabText:            { fontSize: 12, fontWeight: '600', color: '#64748b' },
  tabTextActive:      { color: '#7c3aed' },
  list:               { padding: 16, gap: 10, paddingBottom: 40 },
  empty:              { alignItems: 'center', paddingTop: 60 },
  emptyIcon:          { fontSize: 48, marginBottom: 12 },
  emptyText:          { fontSize: 14, color: '#94a3b8' },
  card:               { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardHighlighted:    { borderWidth: 1, borderColor: '#c7d2fe' },
  cardHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  invoiceNumber:      { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  invoiceCustomer:    { fontSize: 12, color: '#64748b', marginTop: 2 },
  cardRight:          { alignItems: 'flex-end', gap: 4 },
  amount:             { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  badge:              { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText:          { fontSize: 11, fontWeight: '700' },
  cardFooter:         { flexDirection: 'row', justifyContent: 'space-between' },
  dateLabel:          { fontSize: 12, color: '#94a3b8' },
  overdueDate:        { color: '#dc2626', fontWeight: '600' },
  actionHint:         { marginTop: 8, fontSize: 12, color: '#7c3aed', fontWeight: '600', textAlign: 'center' },
});
