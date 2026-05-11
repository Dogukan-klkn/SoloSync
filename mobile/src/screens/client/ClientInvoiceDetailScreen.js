// mobile/src/screens/client/ClientInvoiceDetailScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { clientPortalApi } from '../../services/clientPortalApi';

const STATUS = {
  Draft:             { label: 'Taslak',           color: '#64748b', bg: '#f8fafc' },
  Sent:              { label: 'Onay bekliyor',    color: '#2563eb', bg: '#eff6ff' },
  Paid:              { label: 'Ödendi',            color: '#059669', bg: '#ecfdf5' },
  Overdue:           { label: 'Gecikmiş',          color: '#dc2626', bg: '#fef2f2' },
  ClientApproved:    { label: '✓ Onaylandı',       color: '#059669', bg: '#ecfdf5' },
  RevisionRequested: { label: 'Revizyon istendi',  color: '#d97706', bg: '#fffbeb' },
};

const PAY_METHOD = {
  BankTransfer: 'Banka Havalesi',
  CreditCard: 'Kredi Kartı',
  Cash: 'Nakit',
  Other: 'Diğer',
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export default function ClientInvoiceDetailScreen({ route, navigation }) {
  const { invoiceId } = route.params;

  const [invoice,    setInvoice]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acting,     setActing]     = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await clientPortalApi.getMyInvoice(invoiceId);
      setInvoice(data);
    } catch {
      if (!silent) Alert.alert('Hata', 'Fatura yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [invoiceId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(true); };

  // Onay — direkt aksiyon
  const handleApprove = () => {
    Alert.alert(
      'Faturayı Onayla',
      'Bu faturayı onaylamak istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Onayla',
          style: 'default',
          onPress: async () => {
            setActing(true);
            try {
              await clientPortalApi.invoiceAction(invoiceId, 'approve', null);
              await load(true);
              Alert.alert('✅ Onaylandı', 'Fatura onayınız freelancer\'ınıza iletildi.');
            } catch {
              Alert.alert('Hata', 'Onaylama işlemi başarısız.');
            } finally {
              setActing(false);
            }
          },
        },
      ]
    );
  };

  // Revizyon — alert prompt ile not girişi
  const handleRevision = () => {
    Alert.prompt(
      'Revizyon Talebi',
      'Revizyon nedeninizi kısaca açıklayın (isteğe bağlı):',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Gönder',
          style: 'destructive',
          onPress: async (note) => {
            setActing(true);
            try {
              await clientPortalApi.invoiceAction(invoiceId, 'request-revision', note ?? '');
              await load(true);
              Alert.alert('📝 Talep Gönderildi', 'Revizyon talebiniz freelancer\'ınıza iletildi.');
            } catch {
              Alert.alert('Hata', 'Revizyon talebi gönderilemedi.');
            } finally {
              setActing(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  if (loading) return <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} />;
  if (!invoice) return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>Fatura bulunamadı.</Text>
    </View>
  );

  const st = STATUS[invoice.status] ?? STATUS.Draft;
  const isSent = invoice.status === 'Sent';
  const isApproved = invoice.status === 'ClientApproved';
  const isRevision = invoice.status === 'RevisionRequested';
  const totalPaid = invoice.payments?.reduce((s, p) => s + p.amount, 0) ?? 0;
  const remaining = invoice.totalAmount - totalPaid;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
    >
      {/* Fatura başlık */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text style={styles.customerName}>{invoice.customerName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
            <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Kesim: {formatDate(invoice.issueDate)}</Text>
          <Text style={styles.dateLabel}>Vade: {formatDate(invoice.dueDate)}</Text>
        </View>
        <Text style={styles.totalAmount}>₺{invoice.totalAmount.toLocaleString('tr-TR')}</Text>
      </View>

      <TouchableOpacity 
        style={styles.commentBtn}
        onPress={() => navigation.navigate('CommentScreen', { invoiceId: invoice.id, title: invoice.invoiceNumber + ' Yorumları' })}
      >
        <Text style={styles.commentBtnText}>💬 Yorumları Gör / Yaz</Text>
      </TouchableOpacity>

      {/* Aksiyon butonları (Sent durumunda) */}
      {isSent && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.approveBtn, acting && styles.btnDisabled]}
            onPress={handleApprove}
            disabled={acting}
          >
            <Text style={styles.approveBtnText}>✅ Onayla</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.revisionBtn, acting && styles.btnDisabled]}
            onPress={handleRevision}
            disabled={acting}
          >
            <Text style={styles.revisionBtnText}>✏️ Revizyon İste</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Durum banner (readonly) */}
      {(isApproved || isRevision) && (
        <View style={[styles.statusBanner, { backgroundColor: st.bg, borderColor: isApproved ? '#a7f3d0' : '#fde68a' }]}>
          <Text style={[styles.statusBannerText, { color: st.color }]}>
            {isApproved ? '✓ Bu faturayı onayladınız.' : '📝 Revizyon talebiniz iletildi.'}
          </Text>
        </View>
      )}

      {/* Kalemler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fatura Kalemleri</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.tableCellFlex]}>Açıklama</Text>
          <Text style={styles.tableCell}>Adet</Text>
          <Text style={styles.tableCell}>Birim</Text>
          <Text style={styles.tableCell}>Tutar</Text>
        </View>
        {(invoice.items ?? []).map(item => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableCellFlex]} numberOfLines={2}>{item.description}</Text>
            <Text style={styles.tableCell}>{item.quantity}</Text>
            <Text style={styles.tableCell}>₺{item.unitPrice.toLocaleString('tr-TR')}</Text>
            <Text style={[styles.tableCell, styles.tableCellBold]}>₺{item.amount.toLocaleString('tr-TR')}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Toplam:</Text>
          <Text style={styles.totalValue}>₺{invoice.totalAmount.toLocaleString('tr-TR')}</Text>
        </View>
        {totalPaid > 0 && (
          <View style={styles.paidRow}>
            <Text style={styles.paidLabel}>Ödenen:</Text>
            <Text style={styles.paidValue}>₺{totalPaid.toLocaleString('tr-TR')}</Text>
          </View>
        )}
        {remaining > 0 && (
          <View style={styles.remainingRow}>
            <Text style={styles.remainingLabel}>Kalan:</Text>
            <Text style={styles.remainingValue}>₺{remaining.toLocaleString('tr-TR')}</Text>
          </View>
        )}
      </View>

      {/* Ödeme geçmişi */}
      {(invoice.payments?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ödeme Geçmişi</Text>
          {invoice.payments.map(p => (
            <View key={p.id} style={styles.paymentRow}>
              <View>
                <Text style={styles.paymentAmount}>₺{p.amount.toLocaleString('tr-TR')}</Text>
                <Text style={styles.paymentMethod}>{PAY_METHOD[p.method] ?? p.method}</Text>
              </View>
              <Text style={styles.paymentDate}>{formatDate(p.paymentDate)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f1f5f9' },
  content:          { padding: 16, paddingBottom: 60 },
  emptyState:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText:        { fontSize: 14, color: '#94a3b8' },
  headerCard:       { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  headerRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  invoiceNumber:    { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  customerName:     { fontSize: 13, color: '#7c3aed', fontWeight: '600', marginTop: 2 },
  statusBadge:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText:       { fontSize: 12, fontWeight: '700' },
  dateRow:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  dateLabel:        { fontSize: 12, color: '#64748b' },
  totalAmount:      { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  actionRow:        { flexDirection: 'row', gap: 10, marginBottom: 12 },
  approveBtn:       { flex: 1, backgroundColor: '#059669', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  approveBtnText:   { color: '#fff', fontWeight: '800', fontSize: 15 },
  revisionBtn:      { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#d97706' },
  revisionBtnText:  { color: '#d97706', fontWeight: '800', fontSize: 15 },
  btnDisabled:      { opacity: 0.4 },
  commentBtn:       { backgroundColor: '#4c1d95', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  commentBtnText:   { color: '#fff', fontWeight: '800', fontSize: 15 },
  statusBanner:     { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12, alignItems: 'center' },
  statusBannerText: { fontSize: 14, fontWeight: '700' },
  section:          { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  sectionTitle:     { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  tableHeader:      { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginBottom: 4 },
  tableRow:         { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  tableCell:        { fontSize: 13, color: '#334155', textAlign: 'right', minWidth: 56 },
  tableCellFlex:    { flex: 1, textAlign: 'left', marginRight: 8 },
  tableCellBold:    { fontWeight: '700' },
  totalRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, marginTop: 4 },
  totalLabel:       { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  totalValue:       { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  paidRow:          { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6 },
  paidLabel:        { fontSize: 13, color: '#059669' },
  paidValue:        { fontSize: 13, fontWeight: '700', color: '#059669' },
  remainingRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6 },
  remainingLabel:   { fontSize: 13, color: '#dc2626' },
  remainingValue:   { fontSize: 13, fontWeight: '700', color: '#dc2626' },
  paymentRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  paymentAmount:    { fontSize: 15, fontWeight: '700', color: '#059669' },
  paymentMethod:    { fontSize: 12, color: '#64748b', marginTop: 2 },
  paymentDate:      { fontSize: 13, color: '#64748b' },
});
