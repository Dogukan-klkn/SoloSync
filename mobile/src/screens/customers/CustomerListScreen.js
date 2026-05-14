// src/screens/customers/CustomerListScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { customerApi } from '../../services/customerApi';

export default function CustomerListScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await customerApi.getAll(search || undefined);
      setCustomers(data);
    } catch (e) {
      Alert.alert('Hata', 'Müşteriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id, customer: item })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.companyName[0]}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.companyName}>{item.companyName}</Text>
        <Text style={styles.contactName}>{item.contactName}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <View style={[styles.badge, item.isActive ? styles.badgeActive : styles.badgeInactive]}>
        <Text style={[styles.badgeText, item.isActive ? styles.badgeTextActive : styles.badgeTextInactive]}>
          {item.isActive ? 'Aktif' : 'Pasif'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Şirket veya e-posta ara..."
        placeholderTextColor="#94a3b8"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={load}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          contentContainerStyle={customers.length === 0 ? styles.emptyContainer : null}
          ListEmptyComponent={<Text style={styles.emptyText}>Henüz müşteri yok</Text>}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CustomerForm', { customer: null })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f1f5f9', padding: 16 },
  search:         { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#1e293b', marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  card:           { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  avatar:         { width: 44, height: 44, borderRadius: 10, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText:     { fontSize: 18, fontWeight: '700', color: '#0284c7' },
  cardBody:       { flex: 1 },
  companyName:    { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  contactName:    { fontSize: 13, color: '#64748b' },
  email:          { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  badge:          { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeActive:    { backgroundColor: '#ecfdf5' },
  badgeInactive:  { backgroundColor: '#f1f5f9' },
  badgeText:      { fontSize: 11, fontWeight: '600' },
  badgeTextActive:{ color: '#059669' },
  badgeTextInactive:{ color: '#94a3b8' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText:      { color: '#94a3b8', fontSize: 15 },
  fab:            { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  fabText:        { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
