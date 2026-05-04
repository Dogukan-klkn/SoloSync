// src/screens/projects/ProjectListScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { projectApi } from '../../services/projectApi';

const STATUS = {
  Pending:    { label: 'Beklemede',    color: '#d97706', bg: '#fffbeb' },
  InProgress: { label: 'Devam Ediyor', color: '#2563eb', bg: '#eff6ff' },
  InRevision: { label: 'Revizyon',     color: '#7c3aed', bg: '#f5f3ff' },
  Completed:  { label: 'Tamamlandı',   color: '#059669', bg: '#ecfdf5' },
};

export default function ProjectListScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await projectApi.getAll();
      setProjects(data);
    } catch {
      Alert.alert('Hata', 'Projeler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const renderItem = ({ item }) => {
    const st  = STATUS[item.status] ?? STATUS.Pending;
    const pct = item.milestoneCount > 0
      ? Math.round((item.completedMilestoneCount / item.milestoneCount) * 100) : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: st.bg }]}>
            <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
          </View>
          {item.budget && (
            <Text style={styles.budget}>{item.budget.toLocaleString('tr-TR')} ₺</Text>
          )}
        </View>

        <Text style={styles.projectName}>{item.name}</Text>
        <Text style={styles.customerName}>{item.customerName}</Text>

        {pct !== null && (
          <View style={styles.progressWrap}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.progressText}>{item.completedMilestoneCount}/{item.milestoneCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          contentContainerStyle={projects.length === 0 ? styles.emptyContainer : { padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>Henüz proje yok</Text>}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ProjectForm', { project: null })}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f1f5f9' },
  card:         { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  budget:       { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  projectName:  { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 3 },
  customerName: { fontSize: 13, color: '#0ea5e9', fontWeight: '600', marginBottom: 10 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBar:  { flex: 1, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0ea5e9', borderRadius: 3 },
  progressText: { fontSize: 11, color: '#64748b', minWidth: 30, textAlign: 'right' },
  emptyContainer:{ flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty:        { color: '#94a3b8', fontSize: 15 },
  fab:          { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  fabText:      { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
