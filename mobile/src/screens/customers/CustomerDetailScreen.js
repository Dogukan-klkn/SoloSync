// src/screens/customers/CustomerDetailScreen.js
// Müşteri detay sayfası — bilgi görüntüleme + düzenleme + silme aksiyonları
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { customerApi } from '../../services/customerApi';
import { projectApi } from '../../services/projectApi';

const STATUS = {
  Pending:    { label: 'Beklemede',    color: '#d97706', bg: '#fffbeb' },
  InProgress: { label: 'Devam Ediyor', color: '#2563eb', bg: '#eff6ff' },
  InRevision: { label: 'Revizyon',     color: '#7c3aed', bg: '#f5f3ff' },
  Completed:  { label: 'Tamamlandı',   color: '#059669', bg: '#ecfdf5' },
};

// Bilgi satırı bileşeni
function InfoRow({ label, value, onPress, linkColor }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <TouchableOpacity onPress={onPress} disabled={!onPress}>
        <Text style={[styles.infoValue, onPress && { color: linkColor ?? '#0ea5e9' }]}>
          {value}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function CustomerDetailScreen({ route, navigation }) {
  const { customerId, customer: initial } = route.params ?? {};

  const [customer, setCustomer] = useState(initial ?? null);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Hem müşteri hem projelerini yükle
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const id = customerId ?? initial?.id;
      if (!id) return;

      const [{ data: c }, { data: ps }] = await Promise.all([
        customerApi.getById(id),
        projectApi.getAll(),
      ]);
      setCustomer(c);
      // Sadece bu müşteriye ait projeleri filtrele
      setProjects(ps.filter(p => p.customerId === id || p.customerName === c.companyName));
    } catch (e) {
      Alert.alert('Hata', 'Müşteri bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [customerId, initial?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = () => {
    Alert.alert(
      'Müşteriyi Sil',
      `"${customer?.companyName}" adlı müşteriyi silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await customerApi.remove(customer.id);
              navigation.goBack();
            } catch (e) {
              const msg =
                e.response?.data?.message ??
                'Müşteri silinemedi. İlişkili projeleri olabilir.';
              Alert.alert('Hata', msg);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('CustomerForm', { customer });
  };

  if (loading && !customer) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Müşteri bulunamadı.</Text>
      </View>
    );
  }

  const avatarLetter = customer.companyName?.[0]?.toUpperCase() ?? '?';
  const activeProjects = projects.filter(
    p => p.status === 'InProgress' || p.status === 'Pending'
  ).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ─── Başlık kartı ─── */}
      <View style={styles.headerCard}>
        <View style={styles.avatarLg}>
          <Text style={styles.avatarLgText}>{avatarLetter}</Text>
        </View>
        <Text style={styles.companyName}>{customer.companyName}</Text>
        <Text style={styles.contactName}>{customer.contactName}</Text>
        <View style={[styles.statusBadge, customer.isActive ? styles.active : styles.inactive]}>
          <Text style={[styles.statusText, customer.isActive ? styles.activeText : styles.inactiveText]}>
            {customer.isActive ? 'Aktif' : 'Pasif'}
          </Text>
        </View>
      </View>

      {/* ─── İstatistikler ─── */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#0ea5e9' }]}>{projects.length}</Text>
          <Text style={styles.statLabel}>Toplam Proje</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#8b5cf6' }]}>{activeProjects}</Text>
          <Text style={styles.statLabel}>Aktif Proje</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#059669' }]}>
            {projects.filter(p => p.status === 'Completed').length}
          </Text>
          <Text style={styles.statLabel}>Tamamlandı</Text>
        </View>
      </View>

      {/* ─── İletişim bilgileri ─── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İletişim Bilgileri</Text>
        <InfoRow
          label="E-posta"
          value={customer.email}
          onPress={() => Linking.openURL(`mailto:${customer.email}`)}
        />
        <InfoRow
          label="Telefon"
          value={customer.phone}
          onPress={customer.phone ? () => Linking.openURL(`tel:${customer.phone}`) : undefined}
          linkColor="#059669"
        />
        <InfoRow label="Vergi No" value={customer.taxNumber} />
        <InfoRow label="Fatura Adresi" value={customer.billingAddress} />
      </View>

      {/* ─── Projeler ─── */}
      {projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projeler</Text>
          {projects.map(p => {
            const st = STATUS[p.status] ?? STATUS.Pending;
            const pct = p.milestoneCount > 0
              ? Math.round((p.completedMilestoneCount / p.milestoneCount) * 100)
              : null;
            return (
              <TouchableOpacity
                key={p.id}
                style={styles.projectCard}
                onPress={() => navigation.navigate('Projects', {
                  screen: 'ProjectDetail',
                  params: { projectId: p.id },
                })}
              >
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{p.name}</Text>
                  <View style={[styles.badge, { backgroundColor: st.bg }]}>
                    <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                  </View>
                </View>
                {p.budget != null && (
                  <Text style={styles.projectBudget}>
                    Bütçe: {p.budget.toLocaleString('tr-TR')} ₺
                  </Text>
                )}
                {pct !== null && (
                  <View style={styles.progressWrap}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                      {p.completedMilestoneCount}/{p.milestoneCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ─── Aksiyon butonları ─── */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
          <Text style={styles.editBtnText}>✏️  Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteBtn, deleting && { opacity: 0.5 }]}
          onPress={handleDelete}
          disabled={deleting}
        >
          <Text style={styles.deleteBtnText}>
            {deleting ? 'Siliniyor...' : '🗑  Sil'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <ActivityIndicator
          size="small"
          color="#0ea5e9"
          style={{ marginTop: 12 }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f1f5f9' },
  content:         { padding: 16, paddingBottom: 60 },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText:       { color: '#94a3b8', fontSize: 15 },

  // Başlık
  headerCard:      { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  avatarLg:        { width: 72, height: 72, borderRadius: 18, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarLgText:    { fontSize: 30, fontWeight: '800', color: '#0284c7' },
  companyName:     { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 4, textAlign: 'center' },
  contactName:     { fontSize: 15, color: '#64748b', marginBottom: 10 },
  statusBadge:     { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  active:          { backgroundColor: '#ecfdf5' },
  inactive:        { backgroundColor: '#f1f5f9' },
  statusText:      { fontSize: 13, fontWeight: '700' },
  activeText:      { color: '#059669' },
  inactiveText:    { color: '#94a3b8' },

  // İstatistikler
  statsRow:        { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard:        { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statValue:       { fontSize: 26, fontWeight: '800', marginBottom: 2 },
  statLabel:       { fontSize: 11, color: '#64748b', fontWeight: '600', textAlign: 'center' },

  // Bölümler
  section:         { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle:    { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Bilgi satırları
  infoRow:         { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  infoLabel:       { fontSize: 13, color: '#94a3b8', fontWeight: '600', flex: 1 },
  infoValue:       { fontSize: 13, color: '#0f172a', fontWeight: '500', flex: 2, textAlign: 'right' },

  // Proje kartları
  projectCard:     { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  projectHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  projectName:     { fontSize: 14, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 8 },
  projectBudget:   { fontSize: 12, color: '#64748b', marginBottom: 6 },
  badge:           { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText:       { fontSize: 10, fontWeight: '700' },
  progressWrap:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBar:     { flex: 1, height: 5, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  progressFill:    { height: '100%', backgroundColor: '#0ea5e9', borderRadius: 3 },
  progressText:    { fontSize: 11, color: '#64748b', minWidth: 30, textAlign: 'right' },

  // Aksiyon butonları
  actions:         { flexDirection: 'row', gap: 12, marginTop: 8 },
  editBtn:         { flex: 1, backgroundColor: '#0ea5e9', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  editBtnText:     { color: '#fff', fontWeight: '700', fontSize: 15 },
  deleteBtn:       { flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1.5, borderColor: '#fca5a5' },
  deleteBtnText:   { color: '#ef4444', fontWeight: '700', fontSize: 15 },
});
