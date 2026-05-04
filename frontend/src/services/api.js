// src/services/api.js
// Axios instance — JWT Bearer token'ı otomatik ekler, 401'de refresh yapar.

import axios from 'axios';

// VITE_API_URL tanımlı değilse 5024'e (backend'in gerçek portu) düş
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5024/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 saniye timeout
});

// ─── Request Interceptor: Her isteğe Bearer token ekle ────────
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: 401 → Refresh token dene ───────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ağ hatası (backend çalışmıyor vb.)
    if (!error.response) {
      return Promise.reject(
        new Error('Sunucuya bağlanılamıyor. Backend çalışıyor mu?')
      );
    }

    // 401 → refresh token ile yenile
    if (error.response.status === 401 && !originalRequest._retry) {
      // refresh-token endpoint'i için sonsuz döngüyü önle
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject })
        )
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = sessionStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken }
        );

        sessionStorage.setItem('accessToken',  data.accessToken);
        sessionStorage.setItem('refreshToken', data.refreshToken);

        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
