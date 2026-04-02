// src/screens/main/ProjectsScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProjectsScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Projeler</Text>
    <Text style={styles.subtitle}>Proje içerikleri 3. haftada gelecek.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 24, justifyContent: 'center', alignItems: 'center' },
  title:     { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  subtitle:  { fontSize: 15, color: '#64748b' },
});

export default ProjectsScreen;
