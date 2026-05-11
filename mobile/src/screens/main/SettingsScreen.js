// src/screens/main/SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, DeviceEventEmitter } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SettingsScreen = ({ navigation }) => {
  const handleLogout = () => {
    Alert.alert('Çıkış', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => DeviceEventEmitter.emit('logout') },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ayarlar</Text>
      <Text style={styles.subtitle}>Ayar içerikleri ilerleyen haftalarda gelecek.</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f1f5f9', padding: 24, justifyContent: 'center', alignItems: 'center' },
  title:      { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  subtitle:   { fontSize: 15, color: '#64748b', marginBottom: 32, textAlign: 'center' },
  logoutBtn:  { backgroundColor: '#ef4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default SettingsScreen;
