// src/screens/tasks/TaskListScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { taskApi } from '../../services/taskApi';

const STATUS = {
  Todo:       { label: 'Yapılacak',    color: '#64748b', bg: '#f8fafc' },
  InProgress: { label: 'Devam Ediyor', color: '#2563eb', bg: '#eff6ff' },
  Review:     { label: 'İnceleme',     color: '#d97706', bg: '#fffbeb' },
  Done:       { label: 'Tamamlandı',   color: '#059669', bg: '#ecfdf5' },
};

const PRIORITY = {
  Low:    { label: 'Düşük',  color: '#94a3b8' },
  Medium: { label: 'Orta',   color: '#3b82f6' },
  High:   { label: 'Yüksek', color: '#f97316' },
  Urgent: { label: 'Acil',   color: '#ef4444' },
};

const STATUS_VALUES = [
  { value: 1, key: 'Todo',       label: 'Yapılacak' },
  { value: 2, key: 'InProgress', label: 'Devam Ediyor' },
  { value: 3, key: 'Review',     label: 'İnceleme' },
  { value: 4, key: 'Done',       label: 'Tamamlandı' },
];

export default function TaskListScreen({ route, navigation }) {
  const { projectId, projectName } = route.params;
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await taskApi.getByProject(projectId);
      setTasks(data);
    } catch { Alert.alert('Hata', 'Görevler yüklenemedi.'); }
    finally  { setLoading(false); }
  }, [projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = (task) => {
    Alert.alert('Sil', `"${task.title}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          await taskApi.remove(task.id);
          setTasks(prev => prev.filter(t => t.id !== task.id));
        } catch { Alert.alert('Hata', 'Silinemedi.'); }
      }},
    ]);
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const { data } = await taskApi.update(task.id, {
        milestoneId: task.milestoneId ?? null,
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priorityValue,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : null,
        order: task.order,
      });
      setTasks(prev => prev.map(t => t.id === task.id ? data : t));
      // ProjectDetailScreen useFocusEffect'i focus'ta otomatik refetch yapar
      // (geri navigasyon olmasa da setTasks optimistik güncelleme sağlar)
    } catch { Alert.alert('Hata', 'Durum güncellenemedi.'); }
  };

  if (loading) return <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 60 }} />;

  // Görevleri duruma göre grupla
  const grouped = STATUS_VALUES.map(sv => ({
    ...sv,
    tasks: tasks.filter(t => t.statusValue === sv.value).sort((a, b) => a.order - b.order),
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.projectName}>{projectName}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('TaskForm', { projectId, totalTasks: tasks.length })}
        >
          <Text style={styles.addBtnText}>+ Görev Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* Grouped tasks */}
      {grouped.map((group) => (
        <View key={group.key} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.dot, { backgroundColor: STATUS[group.key].color }]} />
            <Text style={styles.sectionTitle}>{group.label}</Text>
            <Text style={styles.sectionCount}>{group.tasks.length}</Text>
          </View>

          {group.tasks.length === 0 ? (
            <Text style={styles.empty}>Görev yok</Text>
          ) : (
            group.tasks.map((task) => {
              const prio = PRIORITY[task.priority] ?? PRIORITY.Medium;
              return (
                <TouchableOpacity
                  key={task.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('TaskForm', { projectId, task, totalTasks: tasks.length })}
                  onLongPress={() => handleDelete(task)}
                >
                  <View style={styles.cardTop}>
                    <View style={[styles.prioBadge, { backgroundColor: prio.color + '20' }]}>
                      <Text style={[styles.prioText, { color: prio.color }]}>{prio.label}</Text>
                    </View>
                    {task.dueDate && (
                      <Text style={styles.dueDate}>
                        {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {task.description ? <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text> : null}

                  {/* Status change buttons */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusRow}>
                    {STATUS_VALUES.filter(sv => sv.value !== task.statusValue).map((sv) => (
                      <TouchableOpacity
                        key={sv.value}
                        style={[styles.statusBtn, { borderColor: STATUS[sv.key].color }]}
                        onPress={() => handleStatusChange(task, sv.value)}
                      >
                        <Text style={[styles.statusBtnText, { color: STATUS[sv.key].color }]}>{sv.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f1f5f9' },
  content:      { padding: 16, paddingBottom: 40 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  projectName:  { fontSize: 18, fontWeight: '800', color: '#0f172a', flex: 1 },
  addBtn:       { backgroundColor: '#0ea5e9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText:   { color: '#fff', fontWeight: '600', fontSize: 13 },
  section:      { marginBottom: 16 },
  sectionHeader:{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dot:          { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  sectionCount: { fontSize: 12, color: '#94a3b8', backgroundColor: '#e2e8f0', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10, overflow: 'hidden' },
  empty:        { fontSize: 13, color: '#cbd5e1', textAlign: 'center', paddingVertical: 12 },
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  prioBadge:    { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  prioText:     { fontSize: 11, fontWeight: '600' },
  dueDate:      { fontSize: 11, color: '#94a3b8' },
  taskTitle:    { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  taskDesc:     { fontSize: 12, color: '#64748b', marginBottom: 6 },
  statusRow:    { marginTop: 6 },
  statusBtn:    { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6 },
  statusBtnText:{ fontSize: 11, fontWeight: '600' },
});
