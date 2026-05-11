// mobile/src/navigation/ClientTabNavigator.js
// Client rolü için bağımsız bottom tab navigasyonu
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, DeviceEventEmitter, Alert } from 'react-native';

const handleLogout = () => {
  Alert.alert('Çıkış', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
    { text: 'İptal', style: 'cancel' },
    { text: 'Çıkış Yap', style: 'destructive', onPress: () => DeviceEventEmitter.emit('logout') },
  ]);
};

import ClientHomeScreen           from '../screens/client/ClientHomeScreen';
import ClientProjectListScreen    from '../screens/client/ClientProjectListScreen';
import ClientProjectDetailScreen  from '../screens/client/ClientProjectDetailScreen';
import ClientInvoiceListScreen    from '../screens/client/ClientInvoiceListScreen';
import ClientInvoiceDetailScreen  from '../screens/client/ClientInvoiceDetailScreen';
import CommentScreen              from '../screens/comments/CommentScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Client tema renkleri — mor (Freelancer temasından ayrışmak için)
const HEADER_STYLE = {
  headerStyle:      { backgroundColor: '#4c1d95' },   // violet-900
  headerTintColor:  '#fff',
  headerTitleStyle: { fontWeight: 'bold', fontSize: 16 },
};

function ClientProjectStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_STYLE}>
      <Stack.Screen
        name="ClientProjectList"
        component={ClientProjectListScreen}
        options={{ title: 'Projelerim' }}
      />
      <Stack.Screen
        name="ClientProjectDetail"
        component={ClientProjectDetailScreen}
        options={({ route }) => ({
          title: route.params?.projectName ?? 'Proje Detayı',
        })}
      />
      <Stack.Screen
        name="CommentScreen"
        component={CommentScreen}
      />
    </Stack.Navigator>
  );
}

function ClientInvoiceStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_STYLE}>
      <Stack.Screen
        name="ClientInvoiceList"
        component={ClientInvoiceListScreen}
        options={{ title: 'Faturalarım' }}
      />
      <Stack.Screen
        name="ClientInvoiceDetail"
        component={ClientInvoiceDetailScreen}
        options={{ title: 'Fatura Detayı' }}
      />
      <Stack.Screen
        name="CommentScreen"
        component={CommentScreen}
      />
    </Stack.Navigator>
  );
}

export default function ClientTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#2e1065',        // violet-950
          borderTopColor:  'rgba(167,139,250,0.2)',
        },
        tabBarActiveTintColor:   '#a78bfa',  // violet-400
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen
        name="ClientHome"
        component={ClientHomeScreen}
        options={{
          title:        'Özet',
          tabBarLabel:  'Özet',
          tabBarIcon:   ({ color, size }) => <TabIcon icon="🏠" color={color} size={size} />,
          headerShown:  true,
          ...HEADER_STYLE,
          headerTitle:  'Müşteri Portalı',
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Çıkış</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="ClientProjects"
        component={ClientProjectStack}
        options={{
          title:       'Projelerim',
          tabBarLabel: 'Projelerim',
          tabBarIcon:  ({ color, size }) => <TabIcon icon="📂" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ClientInvoices"
        component={ClientInvoiceStack}
        options={{
          title:       'Faturalarım',
          tabBarLabel: 'Faturalar',
          tabBarIcon:  ({ color, size }) => <TabIcon icon="🧾" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Basit emoji ikon wrapper
function TabIcon({ icon, size }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: size * 0.9, lineHeight: size }}>{icon}</Text>;
}
