// src/screens/comments/CommentScreen.js — Çökme düzeltmeleri uygulandı
// Düzeltmeler:
// 1. useEffect dependency array düzeltildi (navigation, loadComments, loadUser)
// 2. Stale closure önlemek için useCallback kullanıldı
// 3. navigation.setOptions'dan navigation dependency kaldırıldı → useLayoutEffect kullanıldı
import React, { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { commentApi } from '../../services/commentApi';
import * as SecureStore from 'expo-secure-store';

export default function CommentScreen({ route, navigation }) {
  const { taskId, invoiceId, title } = route.params || {};

  const [comments,     setComments]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [currentUser,  setCurrentUser]  = useState(null);
  const [newComment,   setNewComment]   = useState('');
  const [sending,      setSending]      = useState(false);
  const intervalRef = useRef(null);

  // ── Header başlığını layout geçişinden ÖNCE ayarla (stale closure yok)
  useLayoutEffect(() => {
    navigation.setOptions({ title: title || 'Yorumlar' });
  }, [navigation, title]);

  // ── Yorumları yükle
  const loadComments = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      let data = [];
      if (taskId)     data = await commentApi.getByTask(taskId);
      else if (invoiceId) data = await commentApi.getByInvoice(invoiceId);
      setComments(Array.isArray(data) ? data : []);
    } catch {
      if (!isBackground) Alert.alert('Hata', 'Yorumlar yüklenemedi.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [taskId, invoiceId]);

  // ── Mevcut kullanıcıyı al
  const loadUser = useCallback(async () => {
    try {
      const raw = await SecureStore.getItemAsync('user');
      if (raw) setCurrentUser(JSON.parse(raw));
    } catch {
      /* SecureStore hatası uygulamayı çökertmesin */
    }
  }, []);

  // Tek bir useEffect — tüm bağımlılıklar dahil
  useEffect(() => {
    loadUser();
    loadComments();

    // Her 10 saniyede bir yorumları otomatik yenile (arka plan)
    intervalRef.current = setInterval(() => {
      loadComments(true);
    }, 10_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadUser, loadComments]);

  // ── Yorum gönder
  const handleSend = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      const payload = { content: newComment.trim() };
      if (taskId)   payload.projectTaskId = taskId;
      if (invoiceId) payload.invoiceId   = invoiceId;

      const created = await commentApi.create(payload);
      setComments(prev => [...prev, created]);
      setNewComment('');
    } catch {
      Alert.alert('Hata', 'Yorum gönderilemedi.');
    } finally {
      setSending(false);
    }
  };

  // ── Yorum sil
  const handleDelete = useCallback((commentId) => {
    Alert.alert('Yorumu Sil', 'Bu yorumu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await commentApi.delete(commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
          } catch {
            Alert.alert('Hata', 'Yorum silinemedi.');
          }
        },
      },
    ]);
  }, []);

  // ── Yorum balonları
  const renderItem = useCallback(({ item }) => {
    // Kullanıcı karşılaştırması: fullName veya email üzerinden
    const isMe =
      currentUser &&
      (currentUser.fullName === item.authorFullName ||
        currentUser.email === item.authorEmail);

    return (
      <TouchableOpacity
        style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}
        onLongPress={() => isMe && handleDelete(item.id)}
        delayLongPress={500}
        activeOpacity={0.85}
      >
        <View style={styles.bubbleHeader}>
          <Text style={[styles.authorName, isMe && styles.myText]}>
            {item.authorFullName}
          </Text>
          <Text style={[styles.roleBadge, isMe && styles.myText]}>
            ({item.authorRole})
          </Text>
        </View>
        <Text style={[styles.commentContent, isMe && styles.myText]}>
          {item.content}
        </Text>
        <Text style={[styles.date, isMe && styles.myDate]}>
          {new Date(item.createdAt).toLocaleString('tr-TR', {
            hour: '2-digit', minute: '2-digit',
            day: '2-digit', month: 'short',
          })}
        </Text>
      </TouchableOpacity>
    );
  }, [currentUser, handleDelete]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4c1d95" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
    >
      <FlatList
        data={comments}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz yorum yok. İlk yorumu siz yapın!</Text>
        }
        // Yeni yorum eklenince listeyi aşağı kaydır
        onContentSizeChange={() => {}}
        initialNumToRender={20}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Yorumunuzu yazın..."
          placeholderTextColor="#9ca3af"
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!newComment.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!newComment.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendText}>Gönder</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f3f4f6' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent:    { padding: 16, flexGrow: 1, justifyContent: 'flex-end' },
  emptyText:      { textAlign: 'center', color: '#6b7280', marginTop: 40 },
  bubble:         { padding: 12, borderRadius: 16, marginBottom: 12, maxWidth: '85%' },
  myBubble:       { backgroundColor: '#4c1d95', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirBubble:    { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e5e7eb' },
  bubbleHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  authorName:     { fontWeight: '700', fontSize: 13, color: '#111827' },
  roleBadge:      { fontSize: 11, color: '#6b7280' },
  commentContent: { fontSize: 15, color: '#374151', lineHeight: 20 },
  date:           { fontSize: 10, color: '#9ca3af', alignSelf: 'flex-end', marginTop: 4 },
  myText:         { color: '#f8fafc' },
  myDate:         { color: '#cbd5e1' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', alignItems: 'flex-end' },
  input:          { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, fontSize: 15, color: '#111827' },
  sendBtn:        { backgroundColor: '#4c1d95', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendBtnDisabled:{ backgroundColor: '#a78bfa' },
  sendText:       { color: '#fff', fontWeight: '700', fontSize: 14 },
});
