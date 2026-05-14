import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { customerApi } from '../../services/customerApi';
import { invoiceApi } from '../../services/invoiceApi';

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function InvoiceFormScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [issueDate, setIssueDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(addDaysISO(30));
  const [items, setItems] = useState([{ description: '', quantity: '1', unitPrice: '' }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await customerApi.getAll();
        const list = Array.isArray(data) ? data : [];
        setCustomers(list);
        if (list.length === 1) setCustomerId(list[0].id);
      } catch {
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateItem = useCallback((idx, field, value) => {
    setItems((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }, []);

  const addRow = () => setItems((prev) => [...prev, { description: '', quantity: '1', unitPrice: '' }]);
  const removeRow = (idx) => {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const handleSubmit = async () => {
    if (!customerId) {
      Alert.alert('Eksik', 'Müşteri seçin.');
      return;
    }
    const payloadItems = items
      .map((i) => ({
        description: (i.description || '').trim(),
        quantity: Number(String(i.quantity).replace(',', '.')) || 0,
        unitPrice: Number(String(i.unitPrice).replace(',', '.')) || 0,
      }))
      .filter((i) => i.description.length > 0 && i.quantity > 0);

    if (payloadItems.length === 0) {
      Alert.alert('Eksik', 'En az bir geçerli kalem (açıklama + adet) girin.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await invoiceApi.create({
        customerId,
        issueDate,
        dueDate,
        items: payloadItems,
      });
      navigation.replace('InvoiceDetail', { invoiceId: data.id, title: data.invoiceNumber });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Kayıt başarısız.';
      Alert.alert('Hata', String(msg));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 60 }} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Müşteri</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={customerId} onValueChange={setCustomerId}>
          <Picker.Item label="— Seçin —" value="" />
          {customers.map((c) => (
            <Picker.Item key={c.id} label={c.companyName} value={c.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Fatura tarihi</Text>
      <TextInput style={styles.input} value={issueDate} onChangeText={setIssueDate} placeholder="YYYY-AA-GG" />

      <Text style={styles.label}>Son ödeme (vade)</Text>
      <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="YYYY-AA-GG" />

      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Kalemler</Text>
        <TouchableOpacity onPress={addRow}>
          <Text style={styles.link}>+ Kalem</Text>
        </TouchableOpacity>
      </View>

      {items.map((row, idx) => (
        <View key={idx} style={styles.itemBlock}>
          <TextInput
            style={styles.input}
            placeholder="Açıklama"
            value={row.description}
            onChangeText={(v) => updateItem(idx, 'description', v)}
          />
          <View style={styles.itemRow}>
            <TextInput
              style={[styles.input, styles.itemHalf]}
              placeholder="Adet"
              keyboardType="decimal-pad"
              value={String(row.quantity)}
              onChangeText={(v) => updateItem(idx, 'quantity', v)}
            />
            <TextInput
              style={[styles.input, styles.itemHalf]}
              placeholder="Birim ₺"
              keyboardType="decimal-pad"
              value={String(row.unitPrice)}
              onChangeText={(v) => updateItem(idx, 'unitPrice', v)}
            />
          </View>
          {items.length > 1 && (
            <TouchableOpacity onPress={() => removeRow(idx)}>
              <Text style={styles.remove}>Satırı kaldır</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity
        style={[styles.primaryBtn, saving && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={saving}
      >
        <Text style={styles.primaryBtnText}>{saving ? 'Kaydediliyor…' : 'Taslak oluştur'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content:   { padding: 16, paddingBottom: 40 },
  label:     { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6, marginTop: 12 },
  pickerWrap:{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  input:     { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  rowBetween:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  link:      { color: '#0ea5e9', fontWeight: '700', fontSize: 14 },
  itemBlock: { marginBottom: 14, gap: 8 },
  itemRow:   { flexDirection: 'row', gap: 10 },
  itemHalf:  { flex: 1 },
  remove:    { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  primaryBtn:{ backgroundColor: '#0ea5e9', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
});
