// src/services/timeEntryApi.js
import api from './api';

const BASE = '/time-entries';

export const timeEntryApi = {
  getEntries:   (params = {}) => api.get(BASE, { params }),
  getRunning:   ()            => api.get(`${BASE}/running`),
  getSummary:   (params = {}) => api.get(`${BASE}/summary`, { params }),
  start:        (data)        => api.post(`${BASE}/start`, data),
  stop:         (id, data)    => api.post(`${BASE}/${id}/stop`, data ?? {}),
  createManual: (data)        => api.post(`${BASE}/manual`, data),
  update:       (id, data)    => api.put(`${BASE}/${id}`, data),
  remove:       (id)          => api.delete(`${BASE}/${id}`),
};
