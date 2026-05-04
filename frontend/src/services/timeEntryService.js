import api from './api';

const BASE = '/time-entries';

export const timeEntryService = {
  // Tüm kayıtları listele (isteğe bağlı filtrelerle)
  getEntries: (params = {}) =>
    api.get(BASE, { params }).then(r => r.data),

  // Şu an çalışan kaydı getir
  getRunning: () =>
    api.get(`${BASE}/running`).then(r => r.data).catch(err => {
      if (err.response?.status === 204) return null;
      throw err;
    }),

  // Özet (günlük/haftalık)
  getSummary: (params = {}) =>
    api.get(`${BASE}/summary`, { params }).then(r => r.data),

  // Kronometre başlat
  start: (data) =>
    api.post(`${BASE}/start`, data).then(r => r.data),

  // Kronometre durdur
  stop: (id, data = {}) =>
    api.post(`${BASE}/${id}/stop`, data).then(r => r.data),

  // Manuel kayıt oluştur
  createManual: (data) =>
    api.post(`${BASE}/manual`, data).then(r => r.data),

  // Kayıt güncelle
  update: (id, data) =>
    api.put(`${BASE}/${id}`, data).then(r => r.data),

  // Kayıt sil
  remove: (id) =>
    api.delete(`${BASE}/${id}`).then(r => r.data),
};
