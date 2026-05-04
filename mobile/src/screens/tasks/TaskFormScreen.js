// src/screens/tasks/TaskFormScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { taskApi } from '../../services/taskApi';
import { projectApi } from '../../services/projectApi';

export default function TaskFormScreen({ route, navigation }) {
  const { projectId, task, totalTasks = 0 } = route.params;
  const isEdit = !!task;

  const [title, setTitle]             = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus]           = useState(task?.statusValue ?? 1);
  const [priority, setPriority]       = useState(task?.priorityValue ?? 2);
  const [dueDate, setDueDate]         = useState(task?.dueDate ? task.dueDate.split('T')[0] : '');
  const [milestoneId, setMilestoneId] = useState(task?.milestoneId ?? '');
  const [milestones, setMilestones]   = useState([]);
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    projectApi.getMilestones(projectId)
      .then(r => setMilestones(r.data))
      .catch(() => {});
  }, [projectId]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Uyarı', 'Görev başlığı zorunludur.');
      return;
    }
    setSaving(true);
    const payload = {
      milestoneId: milestoneId || null,
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      dueDate: dueDate.trim() || null,
      order: task?.order ?? totalTasks,
    };

    try {
      if (isEdit) {
        await taskApi.update(task.id, payload);
      } else {
        await taskApi.create({ ...payload, projectId });
      }
      navigation.goBack();
    } catch (err) {
      const msg = err.response?.data?.message || 'İşlem başarısız.';
      Alert.alert('Hata', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Başlık */}
      <Text style={styles.label}>Görev Başlığı *</Text>
      <TextInput
        style={styles.input}
        placeholder="Görev başlığı girin"
        placeholderTextColor="#94a3b8"
        value={title}
        onChangeText={setTitle}
      />

      {/* Açıklama */}
      <Text style={styles.label}>Açıklama</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Görev detayları..."
        placeholderTextColor="#94a3b8"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Durum */}
      <Text style={styles.label}>Durum</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={status} onValueChange={setStatus} style={styles.picker}>
          <Picker.Item label="Yapılacak" value={1} />
          <Picker.Item label="Devam Ediyor" value={2} />
          <Picker.Item label="İnceleme" value={3} />
          <Picker.Item label="Tamamlandı" value={4} />
        </Picker>
      </View>

      {/* Öncelik */}
      <Text style={styles.label}>Öncelik</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={priority} onValueChange={setPriority} style={styles.picker}>
          <Picker.Item label="Düşük" value={1} />
          <Picker.Item label="Orta" value={2} />
          <Picker.Item label="Yüksek" value={3} />
          <Picker.Item label="Acil" value={4} />
        </Picker>
      </View>

      {/* Son Tarih */}
      <Text style={styles.label}>Son Tarih (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        placeholder="2026-04-15"
        placeholderTextColor="#94a3b8"
        value={dueDate}
        onChangeText={setDueDate}
      />

      {/* Milestone */}
      {milestones.length > 0 && (
        <>
          <Text style={styles.label}>Milestone (Opsiyonel)</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={milestoneId} onValueChange={setMilestoneId} style={styles.picker}>
              <Picker.Item label="— Seçme —" value="" />
              {milestones.map(m => (
                <Picker.Item key={m.id} label={m.title} value={m.id} />
              ))}
            </Picker>
          </View>
        </>
      )}

      {/* Kaydet */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.5 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>
          {saving ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Oluştur'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f1f5f9' },
  content:         { padding: 16, paddingBottom: 40 },
  label:           { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 12 },
  input:           { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0' },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  picker:          { color: '#1e293b' },
  saveBtn:         { backgroundColor: '#0ea5e9', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  saveBtnText:     { color: '#fff', fontWeight: '700', fontSize: 15 },
});
