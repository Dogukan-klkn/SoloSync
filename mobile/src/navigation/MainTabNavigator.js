// src/navigation/MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen     from '../screens/main/HomeScreen';
import ProjectsScreen from '../screens/main/ProjectsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: '#0f172a' },
        headerTintColor:  '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor:  'rgba(255,255,255,0.1)',
        },
        tabBarActiveTintColor:   '#0ea5e9',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Dashboard', tabBarLabel: 'Ana Sayfa' }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{ title: 'Projeler', tabBarLabel: 'Projeler' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Ayarlar', tabBarLabel: 'Ayarlar' }}
      />
    </Tab.Navigator>
  );
}
