// mobile/src/screens/client/ClientProjectDetailScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, RefreshControl,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { clientPortalApi } from '../../services/clientPortalApi';

const STATUS = {
  Pending:    { label: 'Beklemede',    color: '#d97706', bg: '#fffbeb' },
  InProgress: { label: 'Devam ediyor', color: '#2563eb', bg: '#eff6ff' },
  InRevision: { label: 'Revizyon',     color: '#7c3aed', bg: '#f5f3ff' },
  Completed:  { label: 'Tamamlandı',  color: '#059669', bg: '#ecfdf5' },
};

const TASK_STATUS_LABEL = {
  Todo:       'Yapılacak',
  InProgress: 'Devam ediyor',
  Review:     'İncelemede',
  Done:       'Tamamlandı',
};

const TABS = ['Km Taşları', 'Görevler', 'İsteklerim'];

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '';

export default function ClientProjectDetailScreen({ route }) {
  const { projectId } = route.params;

  const [project,    setProject]    = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks,      setTasks]      = useState([]);
  const [requests,   setRequests]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab,  setActiveTab]  = useState(0);

  // İstek gönderme state
  const [reqMessage, setReqMessage] = useState('');
  const [sending,    setSending]    = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [proj, ms, ts, reqs] = await Promise.all([
        clientPortalApi.getMyProject(projectId),
        clientPortalApi.getMyMilestones(projectId),
        clientPortalApi.getMyTasks(projectId),
        clientPortalApi.getMyRequests(projectId),
      ]);
      setProject(proj);
      setMilestones(ms);
      setTasks(ts);
      setRequests(reqs);
    } catch {
      if (!silent) Alert.alert('Hata', 'Proje detayı yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(true); };

  const handleSendRequest = async () => {
    if (!reqMessage.trim()) return;
    setSending(true);
    try {
      await clientPortalApi.sendRequest(projectId, reqMessage.trim());
      setReqMessage('');
      Alert.alert('✅ Gönderildi', 'İsteğiniz freelancer\'ınıza iletildi.');
      // Yeniden yükle
      const reqs = await clientPortalApi.getMyRequests(projectId);
      setRequests(reqs);
    } catch {
      Alert.alert('Hata', 'İstek gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} />;
  if (!project) return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>Proje bulunamadı.</Text>
    </View>
  );

  const st = STATUS[project.status] ?? STATUS.Pending;
  const progress = project.milestoneCount > 0
    ? Math.round((project.completedMilestoneCount / project.milestoneCount) * 100)
    : 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
        keyboardShouldPersistTaps="handled"
      >
        {/* Proje başlık kartı */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.projectName} numberOfLines={2}>{project.name}</Text>
            <View style={[styles.badge, { backgroundColor: st.bg }]}>
              <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
            </View>
          </View>
          {project.description ? (
            <Text style={styles.description}>{project.description}</Text>
          ) : null}
          <View style={styles.datesRow}>
            {project.startDate ? <Text style={styles.dateText}>Başlangıç: {formatDate(project.startDate)}</Text> : null}
            {project.endDate ? <Text style={styles.dateText}>Bitiş: {formatDate(project.endDate)}</Text> : null}
          </View>
          {/* İlerleme */}
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressPct}>{progress}%</Text>
            </View>
            <Text style={styles.milestoneCount}>
              {project.completedMilestoneCount}/{project.milestoneCount} km taşı tamamlandı
            </Text>
          </View>
        </View>

        {/* Sekmeler */}
        <View style={styles.tabBar}>
          {TABS.map((tab, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setActiveTab(i)}
              style={[styles.tab, activeTab === i && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
                {tab}
                {i === 2 && requests.length > 0 ? ` (${requests.length})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Km Taşları sekmesi */}
        {activeTab === 0 && (
          <View style={styles.section}>
            {milestones.length === 0 ? (
              <Text style={styles.emptySection}>Henüz km taşı eklenmedi</Text>
            ) : milestones.map((m, idx) => {
              const pct = m.progressPercentage ?? 0;
              const done = pct === 100;
              return (
                <View key={m.id} style={[styles.milestoneCard, done && styles.milestoneDone]}>
                  <View style={styles.milestoneHeader}>
                    <Text style={styles.milestoneNum}>#{idx + 1}</Text>
                    <Text style={[styles.milestoneTitle, done && styles.milestoneTitleDone]} numberOfLines={2}>
                      {m.title}
                    </Text>
                    {done && <Text style={styles.doneCheck}>✓</Text>}
                  </View>
                  {m.dueDate ? <Text style={styles.dueDate}>{formatDate(m.dueDate)}</Text> : null}
                  <View style={styles.progressRow}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: done ? '#059669' : '#7c3aed' }]} />
                    </View>
                    <Text style={styles.progressPct}>
                      {m.totalTasks === 0 ? 'Görev yok' : `${m.completedTasks}/${m.totalTasks}`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Görevler sekmesi */}
        {activeTab === 1 && (
          <View style={styles.section}>
            {tasks.length === 0 ? (
              <Text style={styles.emptySection}>Henüz görev eklenmedi</Text>
            ) : (
              <View style={styles.taskList}>
                {tasks.map(t => (
                  <View key={t.id} style={styles.taskItem}>
                    <View style={[styles.taskStatusDot, {
                      backgroundColor:
                        t.status === 'Done' ? '#059669' :
                        t.status === 'InProgress' ? '#2563eb' :
                        t.status === 'Review' ? '#d97706' : '#94a3b8'
                    }]} />
                    <Text style={styles.taskTitle} numberOfLines={2}>{t.title}</Text>
                    <View style={styles.taskStatusBadge}>
                      <Text style={styles.taskStatusText}>{TASK_STATUS_LABEL[t.status] ?? t.status}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* İsteklerim sekmesi */}
        {activeTab === 2 && (
          <View style={styles.section}>
            {/* İstek gönderme formu */}
            <View style={styles.requestForm}>
              <Text style={styles.requestFormTitle}>Yeni İstek Gönder</Text>
              <TextInput
                style={styles.requestInput}
                placeholder="Freelancer'ınıza iletmek istediğiniz isteği veya geri bildirimi yazın..."
                placeholderTextColor="#94a3b8"
                value={reqMessage}
                onChangeText={setReqMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={5000}
              />
              <View style={styles.requestFormFooter}>
                <Text style={styles.charCount}>{reqMessage.length}/5000</Text>
                <TouchableOpacity
                  style={[styles.sendBtn, (!reqMessage.trim() || sending) && styles.sendBtnDisabled]}
                  onPress={handleSendRequest}
                  disabled={!reqMessage.trim() || sending}
                >
                  <Text style={styles.sendBtnText}>{sending ? 'Gönderiliyor...' : '📤 Gönder'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Geçmiş istekler */}
            {requests.length === 0 ? (
              <Text style={styles.emptySection}>Henüz istek gönderilmedi</Text>
            ) : requests.map(r => (
              <View key={r.id} style={styles.requestCard}>
                <View style={styles.requestCardHeader}>
                  <View style={[styles.requestStatusBadge, {
                    backgroundColor:
                      r.status === 'Pending' ? '#fffbeb' :
                      r.status === 'Approved' ? '#ecfdf5' : '#fef2f2'
                  }]}>
                    <Text style={[styles.requestStatusText, {
                      color:
                        r.status === 'Pending' ? '#92400e' :
                        r.status === 'Approved' ? '#065f46' : '#991b1b'
                    }]}>
                      {r.status === 'Pending' ? '⏳ İncelemede' :
                       r.status === 'Approved' ? '✅ Onaylandı' : '❌ Reddedildi'}
                    </Text>
                  </View>
                  <Text style={styles.requestDate}>
                    {new Date(r.requestedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <Text style={styles.requestMessage} numberOfLines={3}>{r.originalMessage}</Text>
                {r.summarizedTodo && r.summarizedTodo !== r.originalMessage && (
                  <View style={styles.aiSummary}>
                    <Text style={styles.aiSummaryLabel}>🤖 AI özet:</Text>
                    <Text style={styles.aiSummaryText}>{r.summarizedTodo}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f1f5f9' },
  content:             { padding: 16, paddingBottom: 60 },
  emptyState:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText:           { fontSize: 14, color: '#94a3b8' },
  headerCard:          { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  headerTop:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  projectName:         { fontSize: 20, fontWeight: '800', color: '#0f172a', flex: 1 },
  badge:               { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, flexShrink: 0 },
  badgeText:           { fontSize: 11, fontWeight: '700' },
  description:         { fontSize: 14, color: '#64748b', marginBottom: 8, lineHeight: 20 },
  datesRow:            { flexDirection: 'row', gap: 12, marginBottom: 10 },
  dateText:            { fontSize: 12, color: '#94a3b8' },
  progressSection:     { gap: 4 },
  progressRow:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBar:         { flex: 1, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  progressFill:        { height: '100%', backgroundColor: '#7c3aed', borderRadius: 3 },
  progressPct:         { fontSize: 12, color: '#64748b', minWidth: 32 },
  milestoneCount:      { fontSize: 11, color: '#94a3b8' },
  tabBar:              { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 4, marginBottom: 12 },
  tab:                 { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive:           { backgroundColor: '#7c3aed' },
  tabText:             { fontSize: 12, fontWeight: '600', color: '#64748b' },
  tabTextActive:       { color: '#fff' },
  section:             { gap: 10 },
  emptySection:        { fontSize: 13, color: '#cbd5e1', textAlign: 'center', paddingVertical: 20 },
  milestoneCard:       { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  milestoneDone:       { opacity: 0.8 },
  milestoneHeader:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  milestoneNum:        { fontSize: 11, color: '#94a3b8', fontWeight: '600', minWidth: 20 },
  milestoneTitle:      { flex: 1, fontSize: 14, fontWeight: '600', color: '#1e293b' },
  milestoneTitleDone:  { textDecorationLine: 'line-through', color: '#94a3b8' },
  doneCheck:           { fontSize: 16, color: '#059669' },
  dueDate:             { fontSize: 11, color: '#94a3b8', marginBottom: 6 },
  taskList:            { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' },
  taskItem:            { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  taskStatusDot:       { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  taskTitle:           { flex: 1, fontSize: 14, color: '#1e293b' },
  taskStatusBadge:     { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  taskStatusText:      { fontSize: 11, color: '#64748b', fontWeight: '600' },
  requestForm:         { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 4 },
  requestFormTitle:    { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
  requestInput:        { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 14, color: '#1e293b', minHeight: 100, backgroundColor: '#f8fafc' },
  requestFormFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  charCount:           { fontSize: 11, color: '#94a3b8' },
  sendBtn:             { backgroundColor: '#7c3aed', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  sendBtnDisabled:     { opacity: 0.4 },
  sendBtnText:         { color: '#fff', fontWeight: '700', fontSize: 14 },
  requestCard:         { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  requestCardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  requestStatusBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  requestStatusText:   { fontSize: 12, fontWeight: '700' },
  requestDate:         { fontSize: 11, color: '#94a3b8' },
  requestMessage:      { fontSize: 14, color: '#334155', lineHeight: 20 },
  aiSummary:           { marginTop: 8, padding: 10, backgroundColor: '#f8fafc', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#7c3aed' },
  aiSummaryLabel:      { fontSize: 11, fontWeight: '700', color: '#7c3aed', marginBottom: 4 },
  aiSummaryText:       { fontSize: 13, color: '#64748b', fontStyle: 'italic', lineHeight: 18 },
});
