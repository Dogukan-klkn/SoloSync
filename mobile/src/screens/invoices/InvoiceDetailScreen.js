import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { invoiceApi } from '../../services/invoiceApi';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const STATUS = {
  Draft:             { label: 'Taslak',           color: '#64748b', bg: '#f8fafc' },
  Sent:              { label: 'Gönderildi',       color: '#2563eb', bg: '#eff6ff' },
  Paid:              { label: 'Ödendi',           color: '#059669', bg: '#ecfdf5' },
  Overdue:           { label: 'Gecikmiş',         color: '#dc2626', bg: '#fef2f2' },
  ClientApproved:    { label: 'Onaylandı',        color: '#059669', bg: '#ecfdf5' },
  RevisionRequested: { label: 'Revizyon talebi',  color: '#d97706', bg: '#fffbeb' },
};

const PAY_METHOD = {
  BankTransfer: 'Banka Havalesi',
  CreditCard: 'Kredi Kartı',
  Cash: 'Nakit',
  Other: 'Diğer',
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export default function InvoiceDetailScreen({ route, navigation }) {
  const { invoiceId, title } = route.params;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const [newDesc, setNewDesc] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newPrice, setNewPrice] = useState('');

  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(() => {
    const t = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
  });
  const [showPayForm, setShowPayForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await invoiceApi.getById(invoiceId);
      setInvoice(data);
    } catch {
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useLayoutEffect(() => {
    if (title) navigation.setOptions({ title });
  }, [navigation, title]);

  const handleSend = () => {
    Alert.alert('Gönder', 'Faturayı müşteriye göndermek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Gönder',
        onPress: async () => {
          setActing(true);
          try {
            const { data } = await invoiceApi.send(invoiceId);
            setInvoice(data);
            Alert.alert('Tamam', 'Fatura gönderildi.');
          } catch (e) {
            Alert.alert('Hata', e?.response?.data?.message || 'Gönderilemedi.');
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  const handleMarkPaid = () => {
    Alert.alert('Ödendi', 'Faturayı ödendi olarak işaretlemek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Ödendi',
        onPress: async () => {
          setActing(true);
          try {
            const { data } = await invoiceApi.clientAction(invoiceId, { action: 'mark-paid' });
            setInvoice(data);
            Alert.alert('Tamam', 'Fatura ödendi olarak güncellendi.');
          } catch (e) {
            Alert.alert('Hata', e?.response?.data?.message || 'İşlem başarısız.');
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  const handleAddItem = async () => {
    const q = Number(String(newQty).replace(',', '.')) || 0;
    const p = Number(String(newPrice).replace(',', '.')) || 0;
    if (!newDesc.trim() || q <= 0) {
      Alert.alert('Eksik', 'Açıklama ve adet girin.');
      return;
    }
    setActing(true);
    try {
      const { data } = await invoiceApi.addItem(invoiceId, {
        description: newDesc.trim(),
        quantity: q,
        unitPrice: p,
      });
      setInvoice(data);
      setNewDesc('');
      setNewQty('1');
      setNewPrice('');
    } catch (e) {
      Alert.alert('Hata', e?.response?.data?.message || 'Kalem eklenemedi.');
    } finally {
      setActing(false);
    }
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert('Kalemi sil', 'Bu kalemi kaldırmak istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          setActing(true);
          try {
            const { data } = await invoiceApi.removeItem(invoiceId, itemId);
            setInvoice(data);
          } catch (e) {
            Alert.alert('Hata', e?.response?.data?.message || 'Silinemedi.');
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  const handleAddPayment = async () => {
    const amt = Number(String(payAmount).replace(',', '.')) || 0;
    if (amt <= 0) {
      Alert.alert('Eksik', 'Geçerli tutar girin.');
      return;
    }
    setActing(true);
    try {
      const { data } = await invoiceApi.addPayment(invoiceId, {
        amount: amt,
        paymentDate: payDate,
        method: 1,
        notes: '',
      });
      setInvoice(data);
      setPayAmount('');
      setShowPayForm(false);
    } catch (e) {
      Alert.alert('Hata', e?.response?.data?.message || 'Ödeme eklenemedi.');
    } finally {
      setActing(false);
    }
  };

  const handleExportPDF = async () => {
    if (!invoice) return;
    const items = (invoice.items || []).map(item => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9">${item.description}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;text-align:center">${item.quantity}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;text-align:right">₺${Number(item.unitPrice).toLocaleString('tr-TR')}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600">₺${Number(item.amount).toLocaleString('tr-TR')}</td>
      </tr>`).join('');
    const payments = (invoice.payments || []).map(p => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;font-weight:600;color:#059669">₺${Number(p.amount).toLocaleString('tr-TR')}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9">${formatDate(p.paymentDate)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9">${p.notes || '-'}</td>
      </tr>`).join('');
    const st = STATUS[invoice.status] ?? STATUS.Draft;
    const html = `
      <!DOCTYPE html><html><head><meta charset="utf-8">
      <style>
        body { font-family: Helvetica, Arial, sans-serif; margin:0; padding:0; background:#fff; color:#0f172a; }
        .header { background:#4f46e5; padding:24px 32px; }
        .header h1 { color:#fff; font-size:26px; margin:0 0 4px 0; }
        .header p  { color:#c7d2fe; font-size:13px; margin:0; }
        .body { padding:28px 32px; }
        .meta { display:flex; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
        .meta-item label { font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase; display:block; margin-bottom:3px; }
        .meta-item span  { font-size:14px; font-weight:600; color:#1e293b; }
        .badge { display:inline-block; padding:3px 12px; border-radius:20px; font-size:11px; font-weight:700; background:${st.bg}; color:${st.color}; }
        .total { font-size:28px; font-weight:800; color:#4f46e5; margin-bottom:24px; }
        table { width:100%; border-collapse:collapse; margin-bottom:24px; }
        thead tr { background:#f8fafc; }
        th { padding:10px 10px; text-align:left; font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; border-bottom:2px solid #e2e8f0; }
        .footer { text-align:center; padding:16px; color:#94a3b8; font-size:11px; border-top:1px solid #f1f5f9; margin-top:8px; }
      </style></head><body>
      <div class="header">
        <h1>${invoice.invoiceNumber}</h1>
        <p>SoloSync · ${invoice.customerName || ''}</p>
      </div>
      <div class="body">
        <div class="meta">
          <div class="meta-item"><label>Müşteri</label><span>${invoice.customerName || '-'}</span></div>
          <div class="meta-item"><label>Düzenleme</label><span>${formatDate(invoice.issueDate)}</span></div>
          <div class="meta-item"><label>Vade</label><span>${formatDate(invoice.dueDate)}</span></div>
          <div class="meta-item"><label>Durum</label><span class="badge">${st.label}</span></div>
        </div>
        <div class="total">₺${Number(invoice.totalAmount ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
        <table><thead><tr>
          <th>Açıklama</th><th>Adet</th><th style="text-align:right">Birim Fiyat</th><th style="text-align:right">Tutar</th>
        </tr></thead><tbody>${items}</tbody></table>
        ${payments ? `<h3 style="font-size:14px;font-weight:700;margin:0 0 8px">Ödeme Geçmişi</h3>
        <table><thead><tr><th>Tutar</th><th>Tarih</th><th>Not</th></tr></thead><tbody>${payments}</tbody></table>` : ''}
      </div>
      <div class="footer">SoloSync tarafından oluşturuldu</div>
      </body></html>`;
    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Fatura ${invoice.invoiceNumber}` });
      } else {
        Alert.alert('PDF Oluşturuldu', `Dosya: ${uri}`);
      }
    } catch (e) {
      Alert.alert('Hata', 'PDF oluşturulamadı.');
    }
  };

  const handleDelete = () => {
    Alert.alert('Faturayı sil', 'Bu taslak fatura kalıcı olarak silinecek.', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          setActing(true);
          try {
            await invoiceApi.remove(invoiceId);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Hata', e?.response?.data?.message || 'Silinemedi.');
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 60 }} />;
  if (!invoice) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Fatura bulunamadı.</Text>
      </View>
    );
  }

  const st = STATUS[invoice.status] ?? STATUS.Draft;
  const isDraft = invoice.status === 'Draft';
  const canEditItems = isDraft;
  const isClientApproved = invoice.status === 'ClientApproved';
  const isRevision = invoice.status === 'RevisionRequested';
  const isSent = invoice.status === 'Sent';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
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
        <Text style={styles.totalAmount}>
          ₺{Number(invoice.totalAmount ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {/* PDF Export — always visible */}
      <TouchableOpacity style={styles.pdfBtn} onPress={handleExportPDF}>
        <Text style={styles.pdfBtnText}>PDF İndir / Paylaş</Text>
      </TouchableOpacity>

      {isDraft && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.sendBtn, acting && styles.disabled]} onPress={handleSend} disabled={acting}>
            <Text style={styles.sendBtnText}>Gönder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineDanger} onPress={handleDelete} disabled={acting}>
            <Text style={styles.outlineDangerText}>Sil</Text>
          </TouchableOpacity>
        </View>
      )}

      {isSent && (
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>Müşteriye gönderildi — onay veya revizyon bekleniyor.</Text>
        </View>
      )}

      {isClientApproved && (
        <TouchableOpacity style={[styles.paidBtn, acting && styles.disabled]} onPress={handleMarkPaid} disabled={acting}>
          <Text style={styles.paidBtnText}>Ödendi işaretle</Text>
        </TouchableOpacity>
      )}

      {isRevision && (
        <View style={[styles.infoBanner, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
          <Text style={[styles.infoBannerText, { color: '#b45309' }]}>
            Müşteri revizyon talep etti. Taslak düzenlemeleri için web panelini kullanabilir veya aşağıdan kalem ekleyip yeni fatura oluşturabilirsiniz.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.commentBtn}
        onPress={() =>
          navigation.navigate('CommentScreen', {
            invoiceId: invoice.id,
            title: `${invoice.invoiceNumber} yorumları`,
          })
        }
      >
        <Text style={styles.commentBtnText}>Yorumlar</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kalemler</Text>
        {(invoice.items ?? []).map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.cellMain}>{item.description}</Text>
              <Text style={styles.cellSub}>
                {item.quantity} × ₺{Number(item.unitPrice).toLocaleString('tr-TR')} = ₺{Number(item.amount).toLocaleString('tr-TR')}
              </Text>
            </View>
            {canEditItems && (
              <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                <Text style={styles.removeLink}>Kaldır</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {canEditItems && (
          <View style={styles.addItemBox}>
            <TextInput style={styles.input} placeholder="Açıklama" value={newDesc} onChangeText={setNewDesc} />
            <View style={styles.inlineRow}>
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="Adet"
                keyboardType="decimal-pad"
                value={newQty}
                onChangeText={setNewQty}
              />
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="Birim ₺"
                keyboardType="decimal-pad"
                value={newPrice}
                onChangeText={setNewPrice}
              />
            </View>
            <TouchableOpacity style={styles.smallPrimary} onPress={handleAddItem} disabled={acting}>
              <Text style={styles.smallPrimaryText}>Kalem ekle</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.payHeader}>
          <Text style={styles.sectionTitle}>Ödemeler</Text>
          <TouchableOpacity onPress={() => setShowPayForm((v) => !v)}>
            <Text style={styles.link}>{showPayForm ? 'Gizle' : '+ Ödeme'}</Text>
          </TouchableOpacity>
        </View>
        {(invoice.payments ?? []).length === 0 && !showPayForm ? (
          <Text style={styles.muted}>Kayıt yok.</Text>
        ) : (
          (invoice.payments ?? []).map((p) => (
            <View key={p.id} style={styles.payRow}>
              <View>
                <Text style={styles.payAmt}>₺{Number(p.amount).toLocaleString('tr-TR')}</Text>
                <Text style={styles.payMeta}>{PAY_METHOD[p.method] ?? p.method}</Text>
              </View>
              <Text style={styles.payDate}>{formatDate(p.paymentDate)}</Text>
            </View>
          ))
        )}
        {showPayForm && (
          <View style={styles.addItemBox}>
            <TextInput
              style={styles.input}
              placeholder="Tutar (₺)"
              keyboardType="decimal-pad"
              value={payAmount}
              onChangeText={setPayAmount}
            />
            <TextInput style={styles.input} placeholder="Tarih YYYY-AA-GG" value={payDate} onChangeText={setPayDate} />
            <TouchableOpacity style={styles.smallPrimary} onPress={handleAddPayment} disabled={acting}>
              <Text style={styles.smallPrimaryText}>Ödeme kaydet</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f1f5f9' },
  content:    { padding: 16, paddingBottom: 40 },
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted:      { color: '#94a3b8', fontSize: 14 },
  headerCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  headerRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  invoiceNumber: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  customerName:  { fontSize: 14, color: '#0ea5e9', fontWeight: '600', marginTop: 4 },
  statusBadge:   { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText:    { fontSize: 12, fontWeight: '700' },
  dateRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  dateLabel:     { fontSize: 12, color: '#64748b' },
  totalAmount:   { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  actionRow:     { flexDirection: 'row', gap: 10, marginBottom: 12 },
  sendBtn:       { flex: 1, backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  sendBtnText:   { color: '#fff', fontWeight: '800', fontSize: 15 },
  outlineDanger: { paddingHorizontal: 18, borderRadius: 12, borderWidth: 1.5, borderColor: '#fca5a5', justifyContent: 'center' },
  outlineDangerText: { color: '#ef4444', fontWeight: '700' },
  paidBtn:       { backgroundColor: '#059669', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  paidBtnText:   { color: '#fff', fontWeight: '800', fontSize: 15 },
  infoBanner:    { borderWidth: 1, borderColor: '#bfdbfe', backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, marginBottom: 12 },
  infoBannerText:{ fontSize: 13, fontWeight: '600', color: '#1e40af' },
  pdfBtn:        { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginBottom: 10 },
  pdfBtnText:    { color: '#475569', fontWeight: '700', fontSize: 14 },
  commentBtn:    { backgroundColor: '#0f172a', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  commentBtnText:{ color: '#fff', fontWeight: '800', fontSize: 15 },
  section:       { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
  tableRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  cellMain:      { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  cellSub:       { fontSize: 12, color: '#64748b', marginTop: 2 },
  removeLink:    { color: '#ef4444', fontWeight: '700', fontSize: 13 },
  addItemBox:    { marginTop: 12, gap: 8 },
  input:         { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, backgroundColor: '#f8fafc' },
  inlineRow:     { flexDirection: 'row', gap: 8 },
  half:          { flex: 1 },
  smallPrimary:  { backgroundColor: '#0ea5e9', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  smallPrimaryText: { color: '#fff', fontWeight: '800' },
  payHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  link:          { color: '#0ea5e9', fontWeight: '700', fontSize: 14 },
  payRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  payAmt:        { fontSize: 15, fontWeight: '700', color: '#059669' },
  payMeta:       { fontSize: 12, color: '#64748b', marginTop: 2 },
  payDate:       { fontSize: 13, color: '#64748b' },
  disabled:      { opacity: 0.45 },
});
