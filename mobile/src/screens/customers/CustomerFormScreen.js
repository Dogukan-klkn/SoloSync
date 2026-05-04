// src/screens/customers/CustomerFormScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { customerApi } from '../../services/customerApi';

const Field = ({ label, required, error, ...props }) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.label}>{label}{required && ' *'}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      placeholderTextColor="#94a3b8"
      {...props}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

export default function CustomerFormScreen({ route, navigation }) {
  const existing = route.params?.customer;
  const isEdit   = !!existing;

  const [form, setForm] = useState({
    companyName:    existing?.companyName    ?? '',
    contactName:    existing?.contactName    ?? '',
    email:          existing?.email          ?? '',
    phone:          existing?.phone          ?? '',
    taxNumber:      existing?.taxNumber      ?? '',
    billingAddress: existing?.billingAddress ?? '',
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
    // Alan düzeltilince hata temizle
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  // Basit client-side validasyon
  const validate = () => {
    const errs = {};
    if (!form.companyName.trim()) errs.companyName = 'Şirket adı zorunludur.';
    if (!form.contactName.trim()) errs.contactName = 'İletişim kişisi zorunludur.';
    if (!form.email.trim())       errs.email       = 'E-posta zorunludur.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Geçerli bir e-posta giriniz.';
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
        ...form,
        phone:          form.phone          || null,
        taxNumber:      form.taxNumber      || null,
        billingAddress: form.billingAddress || null,
      };
      if (isEdit) await customerApi.update(existing.id, payload);
      else         await customerApi.create(payload);
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
        <Field label="Şirket Adı" required value={form.companyName} onChangeText={set('companyName')} placeholder="Acme Corp" error={errors.companyName} />
        <Field label="İletişim Kişisi" required value={form.contactName} onChangeText={set('contactName')} placeholder="Ali Yılmaz" error={errors.contactName} />
        <Field label="E-posta" required value={form.email} onChangeText={set('email')} placeholder="info@acme.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
        <Field label="Telefon" value={form.phone} onChangeText={set('phone')} placeholder="+90 555 000 00 00" keyboardType="phone-pad" />
        <Field label="Vergi No" value={form.taxNumber} onChangeText={set('taxNumber')} placeholder="1234567890" />
        <Field label="Fatura Adresi" value={form.billingAddress} onChangeText={set('billingAddress')} placeholder="Adres..." multiline numberOfLines={3} />

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={onSubmit} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Müşteri Ekle'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f1f5f9' },
  content:    { padding: 20, paddingBottom: 60 },
  fieldWrap:  { marginBottom: 16 },
  label:      { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input:      { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0' },
  inputError: { borderColor: '#f87171' },
  errorText:  { color: '#ef4444', fontSize: 12, marginTop: 4 },
  btn:        { backgroundColor: '#0ea5e9', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled:{ opacity: 0.5 },
  btnText:    { color: '#fff', fontWeight: '700', fontSize: 15 },
});
