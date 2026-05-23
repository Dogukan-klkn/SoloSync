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

const PROJECT_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'];

// ─── Bileşen ─────────────────────────────────────────────────
export default function TimeTrackerScreen() {
  const [projects, setProjects]           = useState([]);
  const [tasks, setTasks]                 = useState([]);
  const [entries, setEntries]             = useState([]);
  const [running, setRunning]             = useState(null);
  const [todaySummary, setTodaySummary]   = useState(null);
  const [elapsed, setElapsed]             = useState(0);
  const [activeTab, setActiveTab]         = useState('entries');
  const [expanded, setExpanded]           = useState({});

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

  // ── Gruplama ──
  const groupedEntries = React.useMemo(() => {
    const map = {};
    entries.forEach(e => {
      const pid = e.projectId || 'unknown';
      if (!map[pid]) map[pid] = { projectId: pid, projectName: e.projectName || 'Bilinmiyor', entries: [] };
      map[pid].entries.push(e);
    });
    return Object.values(map);
  }, [entries]);

  const projectStats = React.useMemo(() => {
    const map = {};
    entries.filter(e => !e.isRunning).forEach(e => {
      const pid = e.projectId || 'unknown';
      if (!map[pid]) map[pid] = { projectId: pid, projectName: e.projectName || 'Bilinmiyor', totalSeconds: 0, tasks: {} };
      map[pid].totalSeconds += e.duration || 0;
      const tid = e.taskId || e.id;
      const tName = e.taskTitle || 'Görev';
      if (!map[pid].tasks[tid]) map[pid].tasks[tid] = { id: tid, name: tName, seconds: 0 };
      map[pid].tasks[tid].seconds += e.duration || 0;
    });
    return Object.values(map).sort((a, b) => b.totalSeconds - a.totalSeconds);
  }, [entries]);

  const totalAnalyticsSeconds = projectStats.reduce((s, p) => s + p.totalSeconds, 0);

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

      {/* Sekmeler */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'entries' && styles.tabActive]}
          onPress={() => setActiveTab('entries')}>
          <Text style={[styles.tabText, activeTab === 'entries' && styles.tabTextActive]}>Kayıtlar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.tabActive]}
          onPress={() => setActiveTab('analytics')}>
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.tabTextActive]}>Analiz</Text>
        </TouchableOpacity>
      </View>

      {/* ── Kayıtlar Sekmesi ── */}
      {activeTab === 'entries' && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Kayıtlar (Proje Bazı)</Text>
            <Text style={styles.cardSub}>{entries.length} kayıt</Text>
          </View>
          {entries.length === 0 ? (
            <Text style={styles.empty}>Henüz kayıt yok.</Text>
          ) : (
            groupedEntries.map((group, gi) => (
              <View key={group.projectId}>
                <TouchableOpacity
                  style={styles.groupHeader}
                  onPress={() => setExpanded(prev => ({ ...prev, [group.projectId]: !prev[group.projectId] }))}>
                  <View style={styles.groupHeaderLeft}>
                    <View style={[styles.groupDot, { backgroundColor: PROJECT_COLORS[gi % PROJECT_COLORS.length] }]} />
                    <Text style={styles.groupName}>{group.projectName}</Text>
                    <View style={styles.groupCount}>
                      <Text style={styles.groupCountText}>{group.entries.length}</Text>
                    </View>
                  </View>
                  <Text style={styles.chevron}>{expanded[group.projectId] === false ? '▼' : '▲'}</Text>
                </TouchableOpacity>

                {expanded[group.projectId] !== false && group.entries.map(entry => (
                  <View key={entry.id} style={styles.entryRow}>
                    <View style={styles.entryInfo}>
                      <Text style={styles.entryTask} numberOfLines={1}>{entry.taskTitle}</Text>
                      {entry.description ? <Text style={styles.entryDesc} numberOfLines={1}>{entry.description}</Text> : null}
                      <Text style={styles.entryDate}>{formatDate(entry.startTime)}</Text>
                    </View>
                    <View style={styles.entryRight}>
                      {entry.isRunning ? (
                        <View style={styles.badge}><Text style={styles.badgeText}>Çalışıyor</Text></View>
                      ) : (
                        <Text style={styles.entryDuration}>{formatDuration(entry.duration)}</Text>
                      )}
                      <TouchableOpacity onPress={() => handleDelete(entry.id)} style={styles.deleteBtn}>
                        <Text style={styles.deleteText}>Sil</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>
      )}

      {/* ── Analiz Sekmesi ── */}
      {activeTab === 'analytics' && (
        <>
          {/* Çubuk grafik */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Projeye Göre Süre</Text>
            {projectStats.length === 0 ? (
              <Text style={styles.empty}>Analiz için yeterli kayıt yok.</Text>
            ) : (
              <>
                {projectStats.map((p, i) => {
                  const pct   = totalAnalyticsSeconds > 0 ? p.totalSeconds / totalAnalyticsSeconds : 0;
                  const color = PROJECT_COLORS[i % PROJECT_COLORS.length];
                  const pPct  = Math.round(pct * 100);
                  return (
                    <View key={p.projectId} style={styles.analyticsRow}>
                      <View style={styles.analyticsHeader}>
                        <View style={styles.groupHeaderLeft}>
                          <View style={[styles.groupDot, { backgroundColor: color }]} />
                          <Text style={styles.analyticsName} numberOfLines={1}>{p.projectName}</Text>
                        </View>
                        <View style={styles.analyticsRight}>
                          <Text style={styles.analyticsDuration}>{formatDuration(p.totalSeconds)}</Text>
                          <Text style={styles.analyticsPct}>{pPct}%</Text>
                        </View>
                      </View>
                      <View style={styles.analyticsBar}>
                        <View style={[styles.analyticsBarFill, { width: `${pPct}%`, backgroundColor: color }]} />
                      </View>
                    </View>
                  );
                })}
                <View style={styles.analyticsTotalRow}>
                  <Text style={styles.analyticsTotalLabel}>Toplam</Text>
                  <Text style={styles.analyticsTotalValue}>{formatDuration(totalAnalyticsSeconds)}</Text>
                </View>
              </>
            )}
          </View>

          {/* Detay tablosu */}
          {projectStats.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Görev Bazı Detay</Text>
              {projectStats.map((p, i) => {
                const color    = PROJECT_COLORS[i % PROJECT_COLORS.length];
                const taskList = Object.values(p.tasks).sort((a, b) => b.seconds - a.seconds);
                return (
                  <View key={p.projectId} style={styles.tableSection}>
                    <View style={styles.tableProjRow}>
                      <View style={[styles.groupDot, { backgroundColor: color }]} />
                      <Text style={styles.tableProjName}>{p.projectName}</Text>
                      <Text style={styles.tableProjDur}>{formatDuration(p.totalSeconds)}</Text>
                    </View>
                    {taskList.map((t, ti) => (
                      <View key={`${p.projectId}_${t.id}_${ti}`} style={styles.tableTaskRow}>
                        <Text style={styles.tableTaskName} numberOfLines={1}>  {t.name}</Text>
                        <Text style={styles.tableTaskDur}>{formatDuration(t.seconds)}</Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}
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

  // Tabs
  tabBar:        { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 12 },
  tab:           { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  tabActive:     { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText:       { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  tabTextActive: { color: '#7c3aed' },

  // Card header
  cardHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardSub:       { fontSize: 12, color: '#94a3b8' },

  // Grouped entries
  groupHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  groupHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupDot:        { width: 10, height: 10, borderRadius: 5 },
  groupName:       { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  groupCount:      { backgroundColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  groupCountText:  { fontSize: 11, color: '#64748b', fontWeight: '600' },
  chevron:         { fontSize: 10, color: '#94a3b8' },

  // Kayıt listesi
  empty:         { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingVertical: 12 },
  entryRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10, paddingLeft: 18, borderTopWidth: 1, borderTopColor: '#f8fafc' },
  entryInfo:     { flex: 1, marginRight: 12 },
  entryTask:     { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  entryDesc:     { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  entryDate:     { fontSize: 11, color: '#cbd5e1', marginTop: 2 },
  entryRight:    { alignItems: 'flex-end', gap: 6 },
  entryDuration: { fontFamily: 'monospace', fontSize: 13, fontWeight: '600', color: '#1e293b' },
  badge:         { backgroundColor: '#dcfce7', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:     { fontSize: 11, color: '#16a34a', fontWeight: '600' },
  deleteBtn:     { paddingTop: 2 },
  deleteText:    { fontSize: 12, color: '#ef4444' },

  // Analytics
  analyticsRow:      { marginBottom: 12 },
  analyticsHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  analyticsName:     { fontSize: 13, fontWeight: '600', color: '#1e293b', flex: 1, marginLeft: 8 },
  analyticsRight:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  analyticsDuration: { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', color: '#1e293b' },
  analyticsPct:      { fontSize: 12, color: '#94a3b8', minWidth: 32, textAlign: 'right' },
  analyticsBar:      { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  analyticsBarFill:  { height: '100%', borderRadius: 4 },
  analyticsTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  analyticsTotalLabel:{ fontSize: 13, fontWeight: '700', color: '#475569' },
  analyticsTotalValue:{ fontFamily: 'monospace', fontSize: 14, fontWeight: '800', color: '#1e293b' },

  // Detail table
  tableSection:  { marginBottom: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  tableProjRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  tableProjName: { flex: 1, fontSize: 13, fontWeight: '700', color: '#1e293b' },
  tableProjDur:  { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', color: '#1e293b' },
  tableTaskRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  tableTaskName: { flex: 1, fontSize: 12, color: '#64748b' },
  tableTaskDur:  { fontFamily: 'monospace', fontSize: 12, color: '#64748b' },
});
