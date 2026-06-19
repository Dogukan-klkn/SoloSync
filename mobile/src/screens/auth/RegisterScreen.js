// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';

const RegisterScreen = ({ navigation, onLogin }) => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 1 });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.firstName || form.firstName.length < 2) e.firstName = 'Ad en az 2 karakter';
    if (!form.lastName || form.lastName.length < 2) e.lastName = 'Soyad en az 2 karakter';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Geçerli e-posta giriniz';
    if (!form.password || form.password.length < 6) e.password = 'Şifre en az 6 karakter';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      await SecureStore.setItemAsync('userRole', data.role ?? '');
      await SecureStore.setItemAsync('user', JSON.stringify({
        email: data.email, fullName: data.fullName, role: data.role
      }));
      onLogin(data.role);
    } catch (err) {
      Alert.alert('Kayıt Başarısız', err.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (key) => [styles.input, errors[key] && styles.inputError];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>Freelancer olarak platforma katılın</Text>

          {[
            { key: 'firstName', label: 'Ad', placeholder: 'Ahmet' },
            { key: 'lastName', label: 'Soyad', placeholder: 'Yılmaz' },
            { key: 'email', label: 'E-posta', placeholder: 'ornek@mail.com', email: true },
            { key: 'password', label: 'Şifre', placeholder: '••••••••', secure: true },
          ].map(({ key, label, placeholder, email, secure }) => (
            <View key={key} style={styles.field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={inputStyle(key)}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                keyboardType={email ? 'email-address' : 'default'}
                autoCapitalize={email ? 'none' : 'words'}
                secureTextEntry={!!secure}
                value={form[key]}
                onChangeText={(val) => update(key, val)}
              />
              {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkBtn}>
            <Text style={styles.linkText}>
              Zaten hesabınız var mı? <Text style={styles.link}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>

          {/* Müşteri davetiye bölümü */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.clientBtn}
            onPress={() => navigation.navigate('ClientSetup')}
          >
            <Text style={styles.clientBtnText}>🏢 Davetiye Kodum Var (Müşteri)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20, padding: 28,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { color: '#cbd5e1', fontSize: 14, fontWeight: '500', marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: '#fff', fontSize: 15,
  },
  inputError: { borderColor: '#f87171' },
  errorText: { color: '#f87171', fontSize: 12, marginTop: 4 },
  button: {
    backgroundColor: '#0ea5e9', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkBtn: { marginBottom: 4 },
  linkText: { textAlign: 'center', color: '#94a3b8', fontSize: 14 },
  link: { color: '#38bdf8', fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  dividerText: { color: '#64748b', fontSize: 12 },
  clientBtn: {
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.5)',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    backgroundColor: 'rgba(124,58,237,0.1)',
  },
  clientBtnText: { color: '#a78bfa', fontWeight: '600', fontSize: 14 },
});

export default RegisterScreen;
