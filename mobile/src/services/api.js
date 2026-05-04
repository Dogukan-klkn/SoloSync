// src/services/api.js — Mobil Axios Instance (SecureStore ile)
// ⚠️ IP adresini kendi bilgisayarınızın LAN IP'si ile değiştirin.
// Bulmak için: Windows → ipconfig | Android Emülatör → 10.0.2.2
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

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
    return config;
  },
  (error) => Promise.reject(error)
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
      return Promise.reject(
        new Error('Sunucuya bağlanılamıyor. IP adresi ve backend\'in çalıştığını kontrol edin.')
      );
    }

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
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
