// src/screens/main/HomeScreen.js (dashboard ana ekranı)
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, DeviceEventEmitter, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { projectApi } from '../../services/projectApi';
import { customerApi } from '../../services/customerApi';
import * as SecureStore from 'expo-secure-store';

const HomeScreen = ({ navigation }) => {
  const [stats, setStats] = useState({ projects: 0, customers: 0 });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const u = await SecureStore.getItemAsync('user');
      if (u) setUser(JSON.parse(u));

      const [{ data: projects }, { data: customers }] = await Promise.all([
        projectApi.getAll(),
        customerApi.getAll()
      ]);
      setStats({
        projects: projects.filter(p => p.status === 'InProgress' || p.status === 'Pending').length,
        customers: customers.length
      });
    } catch (e) {
      console.log('Home error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleLogout = () => {
    Alert.alert('Çıkış', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => DeviceEventEmitter.emit('logout') },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Hoş Geldiniz, {user?.fullName?.split(' ')[0] || 'Freelancer'}</Text>
        <Text style={styles.subtitle}>İşleriniz burada özetlenir</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.kpiContainer}>
          <TouchableOpacity style={[styles.kpiCard, { borderTopColor: '#0ea5e9' }]} onPress={() => navigation.navigate('Projects')}>
            <Text style={[styles.kpiValue, { color: '#0ea5e9' }]}>{stats.projects}</Text>
            <Text style={styles.kpiLabel}>Aktif Proje</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.kpiCard, { borderTopColor: '#8b5cf6' }]} onPress={() => navigation.navigate('Customers')}>
            <Text style={[styles.kpiValue, { color: '#8b5cf6' }]}>{stats.customers}</Text>
            <Text style={styles.kpiLabel}>Müşteri</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 24, paddingBottom: 60 },
  header: { marginBottom: 30, marginTop: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#64748b' },
  kpiContainer: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  kpiCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderTopWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  kpiValue: { fontSize: 32, fontWeight: '800', marginBottom: 4 },
  kpiLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  logoutBtn: { backgroundColor: '#ef4444', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default HomeScreen;
