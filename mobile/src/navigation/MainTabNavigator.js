// src/navigation/MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen     from '../screens/main/HomeScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

import CustomerListScreen from '../screens/customers/CustomerListScreen';
import CustomerFormScreen from '../screens/customers/CustomerFormScreen';

import ProjectListScreen   from '../screens/projects/ProjectListScreen';
import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen';
import ProjectFormScreen   from '../screens/projects/ProjectFormScreen';

import TaskListScreen      from '../screens/tasks/TaskListScreen';
import TaskFormScreen      from '../screens/tasks/TaskFormScreen';
import TimeTrackerScreen   from '../screens/tasks/TimeTrackerScreen';

const Tab     = createBottomTabNavigator();
const Stack   = createNativeStackNavigator();

const headerStyle = {
  headerStyle:      { backgroundColor: '#0f172a' },
  headerTintColor:  '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

function CustomerStack() {
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen name="CustomerList"   component={CustomerListScreen}   options={{ title: 'Müşteriler' }} />
      <Stack.Screen name="CustomerForm"   component={CustomerFormScreen}   options={({ route }) => ({ title: route.params?.customer ? 'Düzenle' : 'Yeni Müşteri' })} />
      <Stack.Screen name="CustomerDetail" component={CustomerListScreen}   options={{ title: 'Müşteri Detayı' }} />
    </Stack.Navigator>
  );
}

function ProjectStack() {
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen name="ProjectList"   component={ProjectListScreen}   options={{ title: 'Projeler' }} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Proje Detayı' }} />
      <Stack.Screen name="ProjectForm"   component={ProjectFormScreen}   options={({ route }) => ({ title: route.params?.project ? 'Düzenle' : 'Yeni Proje' })} />
      <Stack.Screen name="TaskList"      component={TaskListScreen}      options={{ title: 'Görevler' }} />
      <Stack.Screen name="TaskForm"      component={TaskFormScreen}      options={({ route }) => ({ title: route.params?.task ? 'Görevi Düzenle' : 'Yeni Görev' })} />
    </Stack.Navigator>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:             false,
        tabBarStyle:             { backgroundColor: '#0f172a', borderTopColor: 'rgba(255,255,255,0.1)' },
        tabBarActiveTintColor:   '#0ea5e9',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen name="Home"        component={HomeScreen}       options={{ title: 'Ana Sayfa',   tabBarLabel: 'Ana Sayfa' }} />
      <Tab.Screen name="Customers"  component={CustomerStack}    options={{ title: 'Müşteriler', tabBarLabel: 'Müşteriler' }} />
      <Tab.Screen name="Projects"   component={ProjectStack}     options={{ title: 'Projeler',   tabBarLabel: 'Projeler' }} />
      <Tab.Screen name="TimeTracker" component={TimeTrackerScreen} options={{ title: 'Zaman Takibi', tabBarLabel: 'Süre', headerShown: true, headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' } }} />
      <Tab.Screen name="Settings"   component={SettingsScreen}   options={{ title: 'Ayarlar',    tabBarLabel: 'Ayarlar' }} />
    </Tab.Navigator>
  );
}
