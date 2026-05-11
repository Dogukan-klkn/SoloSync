// src/navigation/AppNavigator.js
import React, { useEffect, useState, useCallback } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import ClientTabNavigator from './ClientTabNavigator';

const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userRole,   setUserRole]   = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const role  = await SecureStore.getItemAsync('userRole');
      setIsLoggedIn(!!token);
      setUserRole(role ?? '');
    };
    checkAuth();

    const logoutListener = DeviceEventEmitter.addListener('logout', async () => {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('userRole');
      setIsLoggedIn(false);
      setUserRole('');
    });
    return () => logoutListener.remove();
  }, []);

  // Login başarılı olduğunda LoginScreen bu callback'i çağırır
  const handleLogin = useCallback((role) => {
    setUserRole(role ?? '');
    setIsLoggedIn(true);
  }, []);

  if (isLoggedIn === null) return null; // Splash ekranı

  const isClient = isLoggedIn && userRole === 'Client';

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <RootStack.Screen name="Auth">
            {() => <AuthStack onLogin={handleLogin} />}
          </RootStack.Screen>
        ) : isClient ? (
          <RootStack.Screen
            name="ClientMain"
            component={ClientTabNavigator}
          />
        ) : (
          <RootStack.Screen
            name="Main"
            component={MainTabNavigator}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
