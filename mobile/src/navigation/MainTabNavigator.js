// src/navigation/MainTabNavigator.js
import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/main/HomeScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

import CustomerListScreen from '../screens/customers/CustomerListScreen';
import CustomerFormScreen from '../screens/customers/CustomerFormScreen';
import CustomerDetailScreen from '../screens/customers/CustomerDetailScreen';

import ProjectListScreen from '../screens/projects/ProjectListScreen';
import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen';
import ProjectFormScreen from '../screens/projects/ProjectFormScreen';

import TaskListScreen from '../screens/tasks/TaskListScreen';
import TaskFormScreen from '../screens/tasks/TaskFormScreen';
import TimeTrackerScreen from '../screens/tasks/TimeTrackerScreen';

import InvoiceListScreen from '../screens/invoices/InvoiceListScreen';
import InvoiceDetailScreen from '../screens/invoices/InvoiceDetailScreen';
import InvoiceFormScreen from '../screens/invoices/InvoiceFormScreen';
import CommentScreen from '../screens/comments/CommentScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/** Tab içi stack'te üst ekran "yaprak" form ise, sekme basılınca listeye dön (formda takılma önlenir). */
function nestedTopName(rootState, tabName) {
  const tabRoute = rootState?.routes?.find((r) => r.name === tabName);
  const st = tabRoute?.state;
  if (!st?.routes?.length) return undefined;
  return st.routes[st.index]?.name;
}

const headerStyle = {
  headerStyle: { backgroundColor: '#0f172a' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

function TabIcon({ emoji, focused, size }) {
  return (
    <Text style={{ fontSize: size * 0.85, lineHeight: size, opacity: focused ? 1 : 0.6 }}>
      {emoji}
    </Text>
  );
}

function CustomerStack() {
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: 'Müşteriler' }} />
      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={({ route }) => ({
          title: route.params?.customer?.companyName ?? 'Müşteri Detayı',
        })}
      />
      <Stack.Screen
        name="CustomerForm"
        component={CustomerFormScreen}
        options={({ route }) => ({
          title: route.params?.customer ? 'Müşteriyi Düzenle' : 'Yeni Müşteri',
        })}
      />
    </Stack.Navigator>
  );
}

function ProjectStack() {
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen name="ProjectList" component={ProjectListScreen} options={{ title: 'Projeler' }} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Proje Detayı' }} />
      <Stack.Screen
        name="ProjectForm"
        component={ProjectFormScreen}
        options={({ route }) => ({ title: route.params?.project ? 'Düzenle' : 'Yeni Proje' })}
      />
      <Stack.Screen name="TaskList" component={TaskListScreen} options={{ title: 'Görevler' }} />
      <Stack.Screen
        name="TaskForm"
        component={TaskFormScreen}
        options={({ route }) => ({ title: route.params?.task ? 'Görevi Düzenle' : 'Yeni Görev' })}
      />
    </Stack.Navigator>
  );
}

function InvoiceStack() {
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen name="InvoiceList" component={InvoiceListScreen} options={{ title: 'Faturalar' }} />
      <Stack.Screen
        name="InvoiceDetail"
        component={InvoiceDetailScreen}
        options={({ route }) => ({ title: route.params?.title ?? 'Fatura' })}
      />
      <Stack.Screen name="InvoiceForm" component={InvoiceFormScreen} options={{ title: 'Yeni Fatura' }} />
      <Stack.Screen
        name="CommentScreen"
        component={CommentScreen}
        options={({ route }) => ({ title: route.params?.title ?? 'Yorumlar' })}
      />
    </Stack.Navigator>
  );
}

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 14);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: 'rgba(255,255,255,0.1)',
          minHeight: 52 + bottomPad,
          height: 52 + bottomPad,
          paddingBottom: bottomPad,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Ana Sayfa',
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ focused, size }) => <TabIcon emoji="🏠" focused={focused} size={size} />,
        }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomerStack}
        options={{
          title: 'Müşteriler',
          tabBarLabel: 'Müşteriler',
          tabBarIcon: ({ focused, size }) => <TabIcon emoji="👥" focused={focused} size={size} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            const top = nestedTopName(navigation.getState(), 'Customers');
            if (top === 'CustomerForm') {
              navigation.navigate('Customers', { screen: 'CustomerList' });
            }
          },
        })}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectStack}
        options={{
          title: 'Projeler',
          tabBarLabel: 'Projeler',
          tabBarIcon: ({ focused, size }) => <TabIcon emoji="📋" focused={focused} size={size} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            const top = nestedTopName(navigation.getState(), 'Projects');
            if (top === 'ProjectForm') {
              navigation.navigate('Projects', { screen: 'ProjectList' });
            }
          },
        })}
      />
      <Tab.Screen
        name="Invoices"
        component={InvoiceStack}
        options={{
          title: 'Faturalar',
          tabBarLabel: 'Faturalar',
          tabBarIcon: ({ focused, size }) => <TabIcon emoji="🧾" focused={focused} size={size} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            const top = nestedTopName(navigation.getState(), 'Invoices');
            if (top === 'InvoiceForm') {
              navigation.navigate('Invoices', { screen: 'InvoiceList' });
            }
          },
        })}
      />
      <Tab.Screen
        name="TimeTracker"
        component={TimeTrackerScreen}
        options={{
          title: 'Süre',
          tabBarLabel: 'Süre',
          tabBarIcon: ({ focused, size }) => <TabIcon emoji="⏱" focused={focused} size={size} />,
          headerShown: true,
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerTitle: 'Zaman Takibi',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Ayarlar',
          tabBarLabel: 'Ayarlar',
          tabBarIcon: ({ focused, size }) => <TabIcon emoji="⚙️" focused={focused} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
