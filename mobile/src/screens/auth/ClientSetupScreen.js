// src/screens/auth/ClientSetupScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.100:5024/api';

const ClientSetupScreen = ({ navigation, onLogin }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [setupToken, setSetupToken] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validateStep1 = () => {
    const e = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = 'Geçerli e-posta giriniz';
    if (!code || code.length !== 6) e.code = 'Kod 6 haneli olmalıdır';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!firstName || firstName.length < 1) e.firstName = 'Ad zorunludur';
    if (!lastName || lastName.length < 1) e.lastName = 'Soyad zorunludur';
    if (!password || password.length < 6) e.password = 'Şifre en az 6 karakter olmalıdır';
    if (password !== confirmPassword) e.confirmPassword = 'Şifreler eşleşmiyor';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleVerify = async () => {
    if (!validateStep1()) return;
    setServerError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/client-invitation/verify-code`, {
        email,
        code,
      });
      setSetupToken(res.data.setupToken);
      setCompanyName(res.data.companyName);
      setVerifiedEmail(res.data.email);
      setStep(2);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Kod geçersiz veya süresi dolmuş.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    if (!validateStep2()) return;
    setServerError('');
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/client-invitation/complete-setup`,
        { firstName, lastName, password },
        { headers: { Authorization: `Bearer ${setupToken}` } }
      );
      await SecureStore.setItemAsync('accessToken', res.data.accessToken);
      await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);
      await SecureStore.setItemAsync('userRole', res.data.role ?? '');
      await SecureStore.setItemAsync('user', JSON.stringify({
        email: res.data.email,
        fullName: res.data.fullName,
        role: res.data.role,
      }));
      onLogin(res.data.role);
    } catch (err) {
      if (err.response?.status === 401) {
        setServerError('Oturum süresi doldu. Lütfen kodu tekrar doğrulayın.');
        setStep(1);
        setSetupToken('');
        setCode('');
      } else {
        setServerError(
          err.response?.data?.message ||
          err.response?.data?.Message ||
          'Hesap oluşturulurken hata oluştu.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Geri butonu */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backBtnText}>← Giriş Yap</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          {/* Logo satırı */}
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>S</Text>
            </View>
            <View>
              <Text style={styles.logoName}>SoloSync</Text>
              <Text style={styles.logoBadge}>Müşteri Portalı</Text>
            </View>
          </View>

          {/* Adım göstergesi */}
          <View style={styles.stepRow}>
            <View style={[styles.stepChip, step === 1 && styles.stepChipActive]}>
              <Text style={[styles.stepChipText, step === 1 && styles.stepChipTextActive]}>
                🔑 Kod Doğrulama
              </Text>
            </View>
            <View style={styles.stepLine} />
            <View style={[styles.stepChip, step === 2 && styles.stepChipActive]}>
              <Text style={[styles.stepChipText, step === 2 && styles.stepChipTextActive]}>
                👤 Hesap Kurulumu
              </Text>
            </View>
          </View>

          {/* Sunucu hatası */}
          {serverError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>⚠️ {serverError}</Text>
            </View>
          ) : null}

          {/* Adım 1: Email + Kod */}
          {step === 1 && (
            <>
              <Text style={styles.title}>Davetinizi Doğrulayın</Text>
              <Text style={styles.subtitle}>
                Freelancer'ınızın size gönderdiği e-postadaki 6 haneli kodu girin.
              </Text>

              <View style={styles.field}>
                <Text style={styles.label}>E-posta Adresiniz</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="siz@sirket.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Doğrulama Kodu (6 hane)</Text>
                <TextInput
                  style={[styles.input, styles.codeInput, errors.code && styles.inputError]}
                  placeholder="••••••"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  maxLength={6}
                  value={code}
                  onChangeText={setCode}
                />
                {errors.code ? <Text style={styles.fieldError}>{errors.code}</Text> : null}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Doğrulanıyor...' : 'Kodu Doğrula'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Adım 2: Ad, Soyad, Şifre */}
          {step === 2 && (
            <>
              <Text style={styles.title}>Hesabınızı Kurun</Text>
              <Text style={styles.subtitle}>
                <Text style={styles.highlight}>{companyName}</Text> adına{' '}
                <Text style={styles.emailText}>{verifiedEmail}</Text> ile giriş yapacaksınız.
              </Text>

              <View style={styles.rowFields}>
                <View style={[styles.field, styles.halfField]}>
                  <Text style={styles.label}>Ad</Text>
                  <TextInput
                    style={[styles.input, errors.firstName && styles.inputError]}
                    placeholder="Ali"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="words"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                  {errors.firstName ? <Text style={styles.fieldError}>{errors.firstName}</Text> : null}
                </View>
                <View style={[styles.field, styles.halfField]}>
                  <Text style={styles.label}>Soyad</Text>
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    placeholder="Yılmaz"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="words"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                  {errors.lastName ? <Text style={styles.fieldError}>{errors.lastName}</Text> : null}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Şifre</Text>
                <View style={styles.pwRow}>
                  <TextInput
                    style={[styles.input, styles.pwInput, errors.password && styles.inputError]}
                    placeholder="En az 6 karakter"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPw}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(p => !p)}>
                    <Text style={styles.eyeText}>{showPw ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Şifre Tekrar</Text>
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  placeholder="Şifreyi tekrar girin"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPw}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                {errors.confirmPassword ? (
                  <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSetup}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Oluşturuluyor...' : 'Hesabı Oluştur ve Giriş Yap'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setStep(1); setServerError(''); }}>
                <Text style={styles.linkText}>
                  ← <Text style={styles.link}>Kodu Tekrar Doğrula</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.footerText}>
            Zaten hesabınız var mı?{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
              Giriş Yap
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  backBtn: { marginBottom: 16 },
  backBtnText: { color: '#94a3b8', fontSize: 14, fontWeight: '500' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20, padding: 28,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  logoBox: {
    width: 40, height: 40,
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: { color: '#fff', fontWeight: '800', fontSize: 18 },
  logoName: { color: '#fff', fontWeight: '700', fontSize: 16 },
  logoBadge: { color: '#a78bfa', fontSize: 11, fontWeight: '600' },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  stepLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  stepChip: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stepChipActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  stepChipText: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  stepChipTextActive: { color: '#fff' },
  errorBox: {
    backgroundColor: 'rgba(248,113,113,0.15)',
    borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)',
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorBoxText: { color: '#f87171', fontSize: 13 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#94a3b8', marginBottom: 20, lineHeight: 18 },
  highlight: { color: '#a78bfa', fontWeight: '600' },
  emailText: { color: '#e2e8f0' },
  field: { marginBottom: 14 },
  rowFields: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1 },
  label: { color: '#cbd5e1', fontSize: 13, fontWeight: '500', marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: '#fff', fontSize: 15,
  },
  codeInput: { textAlign: 'center', letterSpacing: 8, fontSize: 20, fontWeight: '700' },
  inputError: { borderColor: '#f87171' },
  fieldError: { color: '#f87171', fontSize: 12, marginTop: 4 },
  pwRow: { flexDirection: 'row', alignItems: 'center' },
  pwInput: { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  eyeBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderLeftWidth: 0,
    borderTopRightRadius: 12, borderBottomRightRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  eyeText: { fontSize: 16 },
  button: {
    backgroundColor: '#7c3aed', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 4, marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkText: { textAlign: 'center', color: '#94a3b8', fontSize: 13, marginBottom: 16 },
  footerText: { textAlign: 'center', color: '#64748b', fontSize: 13, marginTop: 8 },
  link: { color: '#a78bfa', fontWeight: '600' },
});

export default ClientSetupScreen;
