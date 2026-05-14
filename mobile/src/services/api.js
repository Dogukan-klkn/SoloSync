// src/services/api.js — Mobil Axios Instance (SecureStore ile)
// ⚠️ IP adresini kendi bilgisayarınızın LAN IP'si ile değiştirin.
// Bulmak için: Windows → ipconfig | Android Emülatör → 10.0.2.2
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { DeviceEventEmitter } from 'react-native';

// Geliştirme ortamı için IP — production'da env variable kullanın
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??   // Expo managed env (app.config.js'te tanımlayın)
  'http://192.168.1.100:5024/api';     // ← buraya kendi LAN IP'nizi yazın

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ─── Request Interceptor ──────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API REQUEST] ${config.method?.toUpperCase()} → ${config.baseURL}${config.url}`);
    console.log('[API REQUEST] Headers:', JSON.stringify(config.headers));
    if (config.data) console.log('[API REQUEST] Body:', JSON.stringify(config.data));
    return config;
  },
  (error) => {
    console.log('[API REQUEST ERROR]', error.message);
    return Promise.reject(error);
  }
);

// ─── Response Interceptor: 401 → Token yenile ────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ağ hatası
    if (!error.response) {
      console.log('=== AĞ HATASI ===');
      console.log('Hata Tipi:', error.message);
      console.log('İstek URL:', error.config?.baseURL + error.config?.url);
      console.log('İstek Metodu:', error.config?.method?.toUpperCase());
      console.log('İstek Body:', JSON.stringify(error.config?.data));
      console.log('Ham error.request._response:', error.request?._response);
      console.log('=== AĞ HATASI BİTİŞ ===');
      return Promise.reject(
        new Error('Sunucuya bağlanılamıyor. IP adresi ve backend\'in çalıştığını kontrol edin.')
      );
    }

    // Backend'den hata yanıtı geldi
    console.log('=== BACKEND HATA YANITI ===');
    console.log('Status Kodu:', error.response.status);
    console.log('URL:', error.config?.baseURL + error.config?.url);
    console.log('Backend Mesajı:', JSON.stringify(error.response.data));
    console.log('=== BACKEND HATA YANITI BİTİŞ ===');

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject })
        ).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        await SecureStore.setItemAsync('accessToken',  data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);

        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Tüm token'ları temizle ve kullanıcıyı login'e yönlendir
        // Bu olmadan uygulama her API çağrısında çöküyor
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');
        await SecureStore.deleteItemAsync('userRole');
        DeviceEventEmitter.emit('logout');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
