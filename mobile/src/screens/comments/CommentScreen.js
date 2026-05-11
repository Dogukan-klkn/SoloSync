import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { commentApi } from '../../services/commentApi';
import * as SecureStore from 'expo-secure-store';

export default function CommentScreen({ route, navigation }) {
  const { taskId, invoiceId, title } = route.params || {};

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: title || 'Yorumlar' });
    loadUser();
    loadComments();
  }, []);

  const loadUser = async () => {
    const userStr = await SecureStore.getItemAsync('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  };

  const loadComments = async () => {
    setLoading(true);
    try {
      let data = [];
      if (taskId) {
        data = await commentApi.getByTask(taskId);
      } else if (invoiceId) {
        data = await commentApi.getByInvoice(invoiceId);
      }
      setComments(data);
    } catch (err) {
      Alert.alert('Hata', 'Yorumlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      const payload = { content: newComment };
      if (taskId) payload.projectTaskId = taskId;
      if (invoiceId) payload.invoiceId = invoiceId;
      
      const created = await commentApi.create(payload);
      setComments((prev) => [...prev, created]);
      setNewComment('');
    } catch (err) {
      Alert.alert('Hata', 'Yorum gönderilemedi.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = (commentId) => {
    Alert.alert('Yorumu Sil', 'Bu yorumu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await commentApi.delete(commentId);
            setComments((prev) => prev.filter(c => c.id !== commentId));
          } catch (err) {
            Alert.alert('Hata', 'Yorum silinemedi.');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => {
    // Determine if the current user is the author
    // If we have currentUser.email matching item.authorEmail? 
    // Wait, comment DTO has authorFullName, authorRole, but maybe not email.
    // However, the backend only allows users to delete their own. Let's just compare names or roles.
    // Actually, it's safer to compare currentUser.fullName === item.authorFullName (since we saved user in SecureStore)
    // Or we can just check if userRole matches authorRole (Client vs Freelancer).
    const isMe = currentUser && (currentUser.fullName === item.authorFullName || currentUser.role === item.authorRole);

    return (
      <TouchableOpacity 
        style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}
        onLongPress={() => isMe ? handleDelete(item.id) : null}
        delayLongPress={500}
      >
        <View style={styles.bubbleHeader}>
          <Text style={[styles.authorName, isMe && styles.myText]}>{item.authorFullName}</Text>
          <Text style={[styles.roleBadge, isMe && styles.myText]}>({item.authorRole})</Text>
        </View>
        <Text style={[styles.content, isMe && styles.myText]}>{item.content}</Text>
        <Text style={[styles.date, isMe && styles.myDate]}>
          {new Date(item.createdAt).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4c1d95" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz yorum yok. İlk yorumu siz yapın!</Text>}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Yorumunuzu yazın..."
          placeholderTextColor="#9ca3af"
          value={newComment}
          onChangeText={setNewComment}
          multiline
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
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, flexGrow: 1, justifyContent: 'flex-end' },
  emptyText: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
  bubble: {
    padding: 12, borderRadius: 16, marginBottom: 12, maxWidth: '85%',
  },
  myBubble: { backgroundColor: '#4c1d95', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e5e7eb' },
  bubbleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  authorName: { fontWeight: '700', fontSize: 13, color: '#111827' },
  roleBadge: { fontSize: 11, color: '#6b7280' },
  content: { fontSize: 15, color: '#374151', lineHeight: 20 },
  date: { fontSize: 10, color: '#9ca3af', alignSelf: 'flex-end', marginTop: 4 },
  myText: { color: '#f8fafc' },
  myDate: { color: '#cbd5e1' },
  inputContainer: {
    flexDirection: 'row', padding: 12, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e5e7eb', alignItems: 'flex-end'
  },
  input: {
    flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100,
    fontSize: 15, color: '#111827'
  },
  sendBtn: {
    backgroundColor: '#4c1d95', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12,
    justifyContent: 'center', alignItems: 'center', marginLeft: 8
  },
  sendBtnDisabled: { backgroundColor: '#a78bfa' },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 14 }
});
