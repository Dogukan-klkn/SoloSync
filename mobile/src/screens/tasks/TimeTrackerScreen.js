// src/screens/tasks/TimeTrackerScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { timeEntryApi } from '../../services/timeEntryApi';
import { projectApi } from '../../services/projectApi';
import { taskApi } from '../../services/taskApi';

// ─── Yardımcılar ─────────────────────────────────────────────
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '--:--:--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function todayRange() {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

// ─── Bileşen ─────────────────────────────────────────────────
export default function TimeTrackerScreen() {
  const [projects, setProjects]           = useState([]);
  const [tasks, setTasks]                 = useState([]);
  const [entries, setEntries]             = useState([]);
  const [running, setRunning]             = useState(null);
  const [todaySummary, setTodaySummary]   = useState(null);
  const [elapsed, setElapsed]             = useState(0);

  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask]       = useState('');
  const [description, setDescription]         = useState('');
  const [loading, setLoading]                 = useState(false);

  // Verileri yükle
  const loadData = useCallback(async () => {
    try {
      const [projectsRes, runningRes, entriesRes, summaryRes] = await Promise.allSettled([
        projectApi.getAll(),
        timeEntryApi.getRunning(),
        timeEntryApi.getEntries(),
        timeEntryApi.getSummary(todayRange()),
      ]);

      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value.data ?? []);
      if (runningRes.status === 'fulfilled')  setRunning(runningRes.value.data ?? null);
      if (entriesRes.status === 'fulfilled')  setEntries(entriesRes.value.data ?? []);
      if (summaryRes.status === 'fulfilled')  setTodaySummary(summaryRes.value.data ?? null);
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // Proje değişince görevleri yükle
  useEffect(() => {
    setSelectedTask('');
    setTasks([]);
    if (!selectedProject) return;
    taskApi.getByProject(selectedProject)
      .then(r => setTasks(r.data ?? []))
      .catch(() => {});
  }, [selectedProject]);

  // Çalışan kayıt varsa elapsed say
  useEffect(() => {
    if (!running) { setElapsed(0); return; }
    const update = () =>
      setElapsed(Math.floor((Date.now() - new Date(running.startTime).getTime()) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [running]);

  const handleStart = async () => {
    if (!selectedTask) return Alert.alert('Uyarı', 'Lütfen bir görev seçin.');
    setLoading(true);
    try {
      await timeEntryApi.start({
        projectTaskId: selectedTask,
        description: description || undefined,
      });
      setDescription('');
      setSelectedProject('');
      setSelectedTask('');
      await loadData();
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.message || 'Kronometre başlatılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!running) return;
    setLoading(true);
    try {
      await timeEntryApi.stop(running.id);
      await loadData();
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.message || 'Kronometre durdurulamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Kaydı Sil', 'Bu zaman kaydını silmek istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive',
        onPress: async () => {
          try {
            await timeEntryApi.remove(id);
            await loadData();
          } catch {
            Alert.alert('Hata', 'Kayıt silinemedi.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Kronometre Kartı */}
      <View style={styles.card}>
        {running ? (
          <View style={styles.runningContainer}>
            <Text style={styles.elapsedText}>{formatDuration(elapsed)}</Text>
            <Text style={styles.runningTask}>{running.taskTitle}</Text>
            {running.projectName ? (
              <Text style={styles.runningProject}>{running.projectName}</Text>
            ) : null}
            <Text style={styles.runningMeta}>Başlangıç: {formatDate(running.startTime)}</Text>
            <TouchableOpacity
              style={[styles.btn, styles.btnRed]}
              onPress={handleStop}
              disabled={loading}
            >
              <Text style={styles.btnText}>{loading ? 'Durduruluyor...' : '⏹  Durdur'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.cardTitle}>Yeni Oturum Başlat</Text>

            <Text style={styles.label}>Proje</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedProject}
                onValueChange={v => setSelectedProject(v)}
              >
                <Picker.Item label="Proje seçin..." value="" />
                {projects.map(p => (
                  <Picker.Item key={p.id} label={p.name} value={p.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Görev</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedTask}
                onValueChange={v => setSelectedTask(v)}
                enabled={!!selectedProject}
              >
                <Picker.Item label="Görev seçin..." value="" />
                {tasks.map(t => (
                  <Picker.Item key={t.id} label={t.title} value={t.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Açıklama (opsiyonel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ne yapıyorsunuz?"
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity
              style={[styles.btn, styles.btnGreen, (!selectedTask || loading) && styles.btnDisabled]}
              onPress={handleStart}
              disabled={!selectedTask || loading}
            >
              <Text style={styles.btnText}>{loading ? 'Başlatılıyor...' : '▶  Başlat'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bugünkü Özet */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bugün</Text>
        <Text style={styles.summaryTime}>
          {formatDuration(todaySummary?.totalSeconds ?? 0)}
        </Text>
      </View>

      {/* Kayıt Listesi */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Son Kayıtlar</Text>
        {entries.length === 0 ? (
          <Text style={styles.empty}>Henüz kayıt yok.</Text>
        ) : (
          entries.slice(0, 20).map(entry => (
            <View key={entry.id} style={styles.entryRow}>
              <View style={styles.entryInfo}>
                <Text style={styles.entryTask} numberOfLines={1}>{entry.taskTitle}</Text>
                <Text style={styles.entryMeta}>{entry.projectName}</Text>
                {entry.description ? (
                  <Text style={styles.entryDesc} numberOfLines={1}>{entry.description}</Text>
                ) : null}
                <Text style={styles.entryDate}>{formatDate(entry.startTime)}</Text>
              </View>
              <View style={styles.entryRight}>
                {entry.isRunning ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Çalışıyor</Text>
                  </View>
                ) : (
                  <Text style={styles.entryDuration}>{formatDuration(entry.duration)}</Text>
                )}
                <TouchableOpacity onPress={() => handleDelete(entry.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>Sil</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f1f5f9' },
  content:       { padding: 16, paddingBottom: 32 },
  card:          { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTitle:     { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 12 },

  // Çalışıyor
  runningContainer: { alignItems: 'center' },
  elapsedText:      { fontSize: 48, fontFamily: 'monospace', fontWeight: 'bold', color: '#7c3aed', marginBottom: 8 },
  runningTask:      { fontSize: 16, fontWeight: '600', color: '#1e293b', textAlign: 'center' },
  runningProject:   { fontSize: 13, color: '#64748b', marginTop: 2, textAlign: 'center' },
  runningMeta:      { fontSize: 12, color: '#94a3b8', marginTop: 4, marginBottom: 16, textAlign: 'center' },

  // Başlat formu
  label:         { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 4, marginTop: 8 },
  pickerWrapper: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, marginBottom: 4, overflow: 'hidden' },
  input:         { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: '#1e293b', marginBottom: 4 },

  // Butonlar
  btn:           { borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 12 },
  btnGreen:      { backgroundColor: '#7c3aed' },
  btnRed:        { backgroundColor: '#ef4444' },
  btnDisabled:   { opacity: 0.4 },
  btnText:       { color: '#fff', fontWeight: '600', fontSize: 15 },

  // Özet
  summaryTime:   { fontSize: 36, fontFamily: 'monospace', fontWeight: 'bold', color: '#1e293b' },

  // Kayıt listesi
  empty:         { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingVertical: 12 },
  entryRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  entryInfo:     { flex: 1, marginRight: 12 },
  entryTask:     { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  entryMeta:     { fontSize: 12, color: '#64748b', marginTop: 2 },
  entryDesc:     { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  entryDate:     { fontSize: 11, color: '#cbd5e1', marginTop: 2 },
  entryRight:    { alignItems: 'flex-end', gap: 6 },
  entryDuration: { fontFamily: 'monospace', fontSize: 14, fontWeight: '600', color: '#1e293b' },
  badge:         { backgroundColor: '#dcfce7', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:     { fontSize: 11, color: '#16a34a', fontWeight: '600' },
  deleteBtn:     { paddingTop: 2 },
  deleteText:    { fontSize: 12, color: '#ef4444' },
});
