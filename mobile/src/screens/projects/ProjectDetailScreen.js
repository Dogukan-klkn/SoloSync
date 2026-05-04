// src/screens/projects/ProjectDetailScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { projectApi } from '../../services/projectApi';

const STATUS = {
  Pending:    { label: 'Beklemede',    color: '#d97706', bg: '#fffbeb' },
  InProgress: { label: 'Devam Ediyor', color: '#2563eb', bg: '#eff6ff' },
  InRevision: { label: 'Revizyon',     color: '#7c3aed', bg: '#f5f3ff' },
  Completed:  { label: 'Tamamlandı',   color: '#059669', bg: '#ecfdf5' },
};

export default function ProjectDetailScreen({ route, navigation }) {
  const { projectId } = route.params;
  const [project,    setProject]    = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, mRes] = await Promise.all([
        projectApi.getById(projectId),
        projectApi.getMilestones(projectId),
      ]);
      setProject(pRes.data);
      setMilestones(mRes.data);
    } catch { Alert.alert('Hata', 'Proje yüklenemedi.'); }
    finally  { setLoading(false); }
  }, [projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAdd = async () => {
    if (!milestoneTitle.trim()) return;
    setAdding(true);
    try {
      const { data } = await projectApi.addMilestone({
        projectId,
        title: milestoneTitle.trim(),
        order: milestones.length + 1,
      });
      setMilestones((ms) => [...ms, data]);
      setMilestoneTitle('');
    } catch { Alert.alert('Hata', 'Milestone eklenemedi.'); }
    finally  { setAdding(false); }
  };

  if (loading || !project) return <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 60 }} />;

  const st = STATUS[project.status] ?? STATUS.Pending;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Project Card */}
      <View style={styles.card}>
        <View style={[styles.badge, { backgroundColor: st.bg }]}>
          <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
        </View>
        <Text style={styles.projectName}>{project.name}</Text>
        <Text style={styles.customerName}>{project.customerName}</Text>
        {project.description ? <Text style={styles.desc}>{project.description}</Text> : null}
        {project.budget && <Text style={styles.budget}>{project.budget.toLocaleString('tr-TR')} ₺</Text>}
      </View>

      {/* Görevler Butonu */}
      <TouchableOpacity
        style={styles.kanbanBtn}
        onPress={() => navigation.navigate('TaskList', { projectId, projectName: project.name })}
      >
        <Text style={styles.kanbanBtnText}>Görevler (Kanban)</Text>
      </TouchableOpacity>

      {/* Milestones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Milestone'lar ({milestones.length})</Text>

        {/* Add Milestone */}
        <View style={styles.addRow}>
          <TextInput
            style={styles.milestoneInput}
            placeholder="Yeni milestone..."
            placeholderTextColor="#94a3b8"
            value={milestoneTitle}
            onChangeText={setMilestoneTitle}
          />
          <TouchableOpacity style={[styles.addBtn, adding && { opacity: 0.5 }]} onPress={handleAdd} disabled={adding}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {milestones.length === 0 ? (
          <Text style={styles.emptyText}>Henüz milestone yok</Text>
        ) : (
          milestones.map((m) => {
            const isDone = m.totalTasks > 0 && m.completedTasks === m.totalTasks;
            const pct = m.progressPercentage ?? 0;
            return (
              <View key={m.id} style={[styles.ms, isDone && styles.msDone]}>
                <View style={styles.msHeader}>
                  <Text style={styles.msCheck}>{isDone ? '✓' : '○'}</Text>
                  <Text style={[styles.msTitle, isDone && styles.msTitleDone]} numberOfLines={1}>
                    {m.title}
                  </Text>
                  <Text style={styles.msCount}>
                    {m.totalTasks === 0 ? 'Görev yok' : `${m.completedTasks}/${m.totalTasks}`}
                  </Text>
                </View>

                {m.totalTasks > 0 && (
                  <View style={styles.progressRow}>
                    <View style={styles.progressBar}>
                      <View style={[
                        styles.progressFill,
                        { width: `${pct}%`, backgroundColor: isDone ? '#059669' : '#0ea5e9' }
                      ]} />
                    </View>
                    <Text style={styles.pct}>{pct}%</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f1f5f9' },
  content:        { padding: 16, paddingBottom: 40 },
  card:           { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  badge:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 10 },
  badgeText:      { fontSize: 11, fontWeight: '700' },
  projectName:    { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  customerName:   { fontSize: 13, color: '#0ea5e9', fontWeight: '600', marginBottom: 8 },
  desc:           { fontSize: 14, color: '#64748b', marginBottom: 8 },
  budget:         { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  section:        { backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  sectionTitle:   { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  addRow:         { flexDirection: 'row', gap: 8, marginBottom: 16 },
  milestoneInput: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0' },
  addBtn:         { width: 42, height: 42, borderRadius: 10, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center' },
  addBtnText:     { color: '#fff', fontSize: 22, fontWeight: '300' },
  emptyText:      { fontSize: 13, color: '#cbd5e1', textAlign: 'center', paddingVertical: 16 },
  ms:             { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  msDone:         { opacity: 0.75 },
  msHeader:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  msCheck:        { fontSize: 16, color: '#0ea5e9', width: 20, textAlign: 'center' },
  msTitle:        { fontSize: 14, color: '#1e293b', flex: 1, fontWeight: '500' },
  msTitleDone:    { textDecorationLine: 'line-through', color: '#94a3b8' },
  msCount:        { fontSize: 11, color: '#64748b', fontWeight: '600' },
  progressRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 28 },
  progressBar:    { flex: 1, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  progressFill:   { height: '100%', borderRadius: 3 },
  pct:            { fontSize: 11, color: '#64748b', minWidth: 30 },
  kanbanBtn:      { backgroundColor: '#0ea5e9', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  kanbanBtnText:  { color: '#fff', fontWeight: '700', fontSize: 15 },
});
