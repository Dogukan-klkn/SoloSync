// src/screens/requests/RequestsScreen.js
import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, DeviceEventEmitter,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clientRequestApi } from '../../services/clientRequestApi';

const STATUS_TABS = [
  { key: '', label: 'Tümü' },
  { key: 'Pending', label: 'Beklemede' },
  { key: 'Approved', label: 'Onaylandı' },
  { key: 'Rejected', label: 'Reddedildi' },
];

const STATUS_MAP = {
  Pending:  { label: 'Beklemede',  color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  Approved: { label: 'Onaylandı', color: '#059669', bg: '#ecfdf5', dot: '#10b981' },
  Rejected: { label: 'Reddedildi', color: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;
  return new Date(dateStr).toLocaleDateString('tr-TR');
}

export default function RequestsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);

  const statusFilter = STATUS_TABS[activeTab]?.key;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [filteredRes, allRes] = await Promise.all([
        clientRequestApi.getAll(statusFilter || undefined),
        clientRequestApi.getAll(),
      ]);
      setRequests(Array.isArray(filteredRes.data) ? filteredRes.data : []);
      setAllRequests(Array.isArray(allRes.data) ? allRes.data : []);
    } catch {
      setRequests([]);
      setAllRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const pending  = allRequests.filter(r => r.status === 'Pending').length;
  const approved = allRequests.filter(r => r.status === 'Approved').length;
  const rejected = allRequests.filter(r => r.status === 'Rejected').length;

  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarBadge: pending > 0 ? pending : undefined,
      tabBarBadgeStyle: { backgroundColor: '#f59e0b', fontSize: 10 },
    });
  }, [navigation, pending]);

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  const handleReview = async (id, action) => {
    setReviewingId(id);
    try {
      await clientRequestApi.review(id, { action });
      DeviceEventEmitter.emit('requestsUpdated');
      await load(true);
    } catch (err) {
      const msg = err?.response?.data?.message || 'İşlem başarısız.';
      Alert.alert('Hata', msg);
    } finally {
      setReviewingId(null);
    }
  };

  const goToProject = (projectId) => {
    navigation.navigate('Projects', {
      screen: 'ProjectDetail',
      params: { projectId },
    });
  };

  const renderItem = ({ item: req }) => {
    const s = STATUS_MAP[req.status] ?? STATUS_MAP.Pending;
    const isPending = req.status === 'Pending';
    const isExpanded = expandedId === req.id;
    const isReviewing = reviewingId === req.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={[styles.dot, { backgroundColor: s.dot }]} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle}>{req.summarizedTodo}</Text>
            <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
              <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
            </View>
          </View>
          <Text style={styles.cardMeta}>
            {req.projectName} · {req.customerName} · {timeAgo(req.requestedAt)}
          </Text>

          <TouchableOpacity
            onPress={() => setExpandedId(isExpanded ? null : req.id)}
            style={styles.expandBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.expandText}>
              {isExpanded ? '▲ Orijinal mesajı gizle' : '▼ Orijinal mesajı göster'}
            </Text>
          </TouchableOpacity>
          {isExpanded && (
            <View style={styles.originalBox}>
              <Text style={styles.originalText}>{req.originalMessage}</Text>
            </View>
          )}

          <View style={styles.actions}>
            {isPending && (
              <>
                <TouchableOpacity
                  style={[styles.btn, styles.btnApprove, isReviewing && styles.btnDisabled]}
                  onPress={() => handleReview(req.id, 'approve')}
                  disabled={!!reviewingId}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnText}>Onayla</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnReject, isReviewing && styles.btnDisabled]}
                  onPress={() => handleReview(req.id, 'reject')}
                  disabled={!!reviewingId}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnText}>Reddet</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={[styles.btn, styles.btnProject]}
              onPress={() => goToProject(req.projectId)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnProjectText}>Projeye Git</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const ListHeader = () => (
    <View style={styles.headerBlock}>
      {pending > 0 && (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>{pending} bekleyen</Text>
        </View>
      )}

      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: '#fffbeb' }]}>
          <Text style={[styles.kpiValue, { color: '#d97706' }]}>{pending}</Text>
          <Text style={styles.kpiLabel}>Beklemede</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#ecfdf5' }]}>
          <Text style={[styles.kpiValue, { color: '#059669' }]}>{approved}</Text>
          <Text style={styles.kpiLabel}>Onaylandı</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#fef2f2' }]}>
          <Text style={[styles.kpiValue, { color: '#dc2626' }]}>{rejected}</Text>
          <Text style={styles.kpiLabel}>Reddedildi</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        {STATUS_TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab.key || 'all'}
            onPress={() => setActiveTab(i)}
            style={[styles.tab, activeTab === i && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]} numberOfLines={1}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>
        {statusFilter ? STATUS_MAP[statusFilter]?.label ?? 'İstekler' : 'Tüm İstekler'}
        {' · '}{requests.length} istek
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 60 }} />;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 64 }]}
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📨</Text>
          <Text style={styles.emptyText}>
            {statusFilter === 'Pending' ? 'Bekleyen müşteri isteği yok.' : 'Bu filtrede istek bulunamadı.'}
          </Text>
        </View>
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content:   { padding: 16 },

  headerBlock: { marginBottom: 4 },
  pendingBadge: { alignSelf: 'flex-start', backgroundColor: '#fef3c7', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  pendingBadgeText: { fontSize: 11, fontWeight: '700', color: '#d97706' },

  kpiRow:  { flexDirection: 'row', gap: 10, marginBottom: 14 },
  kpiCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  kpiValue:{ fontSize: 24, fontWeight: '800' },
  kpiLabel:{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: '600' },

  tabRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  tab:         { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  tabActive:   { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  tabText:     { fontSize: 12, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#fff' },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 10 },

  card:     { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cardLeft: { paddingTop: 5, marginRight: 12 },
  dot:      { width: 10, height: 10, borderRadius: 5 },
  cardBody: { flex: 1 },
  cardTop:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4, gap: 8 },
  cardTitle:{ fontSize: 13, fontWeight: '700', color: '#0f172a', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, flexShrink: 0 },
  statusText:  { fontSize: 10, fontWeight: '700' },
  cardMeta: { fontSize: 12, color: '#64748b', lineHeight: 17 },

  expandBtn:  { marginTop: 8 },
  expandText: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  originalBox: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 10, marginTop: 6 },
  originalText: { fontSize: 12, color: '#475569', lineHeight: 18 },

  actions:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  btn:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  btnApprove: { backgroundColor: '#059669' },
  btnReject:  { backgroundColor: '#ef4444' },
  btnProject: { backgroundColor: '#f1f5f9' },
  btnDisabled:{ opacity: 0.5 },
  btnText:    { color: '#fff', fontSize: 12, fontWeight: '700' },
  btnProjectText: { color: '#334155', fontSize: 12, fontWeight: '700' },

  empty:     { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#94a3b8' },
});
