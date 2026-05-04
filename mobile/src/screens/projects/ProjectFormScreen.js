// src/screens/projects/ProjectFormScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { projectApi } from '../../services/projectApi';
import { customerApi } from '../../services/customerApi';

export default function ProjectFormScreen({ route, navigation }) {
  const existing = route.params?.project;
  const isEdit   = !!existing;

  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customerId:  existing?.customerId  ?? '',
    name:        existing?.name        ?? '',
    description: existing?.description ?? '',
    status:      existing?.statusValue ?? 1,
    budget:      existing?.budget?.toString() ?? '',
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    customerApi.getAll()
      .then((r) => setCustomers(r.data))
      .catch(() => Alert.alert('Uyarı', 'Müşteri listesi yüklenemedi.'));
  }, []);

  const set = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.customerId) errs.customerId = 'Müşteri seçimi zorunludur.';
    if (!form.name.trim()) errs.name = 'Proje adı zorunludur.';
    if (form.budget && isNaN(parseFloat(form.budget))) errs.budget = 'Geçerli bir bütçe giriniz.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) {
      Alert.alert('Eksik Bilgi', 'Lütfen zorunlu alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        customerId:  form.customerId,
        name:        form.name,
        description: form.description || null,
        status:      Number(form.status),
        budget:      form.budget ? parseFloat(form.budget) : null,
      };
      if (isEdit) await projectApi.update(existing.id, payload);
      else         await projectApi.create(payload);
      navigation.goBack();
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        Object.values(e.response?.data?.errors ?? {}).flat().join('\n') ||
        'İşlem başarısız. Lütfen tekrar deneyin.';
      Alert.alert('Hata', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 60}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Müşteri Seçimi */}
        <Text style={[styles.label, errors.customerId && { color: '#ef4444' }]}>
          Müşteri * {errors.customerId ? `— ${errors.customerId}` : ''}
        </Text>
        <View style={[styles.pickerWrap, errors.customerId && styles.inputError]}>
          <Picker selectedValue={form.customerId} onValueChange={set('customerId')}>
            <Picker.Item label="— Müşteri Seç —" value="" />
            {customers.map((c) => (
              <Picker.Item key={c.id} label={c.companyName} value={c.id} />
            ))}
          </Picker>
        </View>

        {/* Proje Adı */}
        <Text style={[styles.label, errors.name && { color: '#ef4444' }]}>
          Proje Adı * {errors.name ? `— ${errors.name}` : ''}
        </Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={form.name}
          onChangeText={set('name')}
          placeholder="E-ticaret Sitesi"
          placeholderTextColor="#94a3b8"
        />

        {/* Açıklama */}
        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={form.description}
          onChangeText={set('description')}
          placeholder="Proje açıklaması..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={3}
        />

        {/* Durum */}
        <Text style={styles.label}>Durum</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={form.status} onValueChange={(v) => set('status')(v)}>
            <Picker.Item label="Beklemede"    value={1} />
            <Picker.Item label="Devam Ediyor" value={2} />
            <Picker.Item label="Revizyon"     value={3} />
            <Picker.Item label="Tamamlandı"   value={4} />
          </Picker>
        </View>

        {/* Bütçe */}
        <Text style={[styles.label, errors.budget && { color: '#ef4444' }]}>
          Bütçe (₺) {errors.budget ? `— ${errors.budget}` : ''}
        </Text>
        <TextInput
          style={[styles.input, errors.budget && styles.inputError]}
          value={form.budget}
          onChangeText={set('budget')}
          placeholder="5000"
          placeholderTextColor="#94a3b8"
          keyboardType="decimal-pad"
        />

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.5 }]}
          onPress={onSubmit}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Proje Ekle'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f1f5f9' },
  content:    { padding: 20, paddingBottom: 60 },
  label:      { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 14 },
  input:      { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0' },
  inputError: { borderColor: '#f87171' },
  textarea:   { height: 80, textAlignVertical: 'top' },
  pickerWrap: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  btn:        { backgroundColor: '#0ea5e9', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  btnText:    { color: '#fff', fontWeight: '700', fontSize: 15 },
});
