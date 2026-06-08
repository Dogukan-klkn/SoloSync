// mobile/src/services/clientPortalApi.js
// Client Portal API servisi — tüm /api/client-portal/* çağrıları
import api from './api';

const BASE = '/client-portal';

export const clientPortalApi = {
  // Profil
  getMyProfile: () =>
    api.get(`${BASE}/me`).then(r => r.data),

  // Projeler
  getMyProjects: () =>
    api.get(`${BASE}/projects`).then(r => r.data),

  getMyProject: (id) =>
    api.get(`${BASE}/projects/${id}`).then(r => r.data),

  // Kilometre taşları
  getMyMilestones: (projectId) =>
    api.get(`${BASE}/projects/${projectId}/milestones`).then(r => r.data),

  // Görevler
  getMyTasks: (projectId) =>
    api.get(`${BASE}/projects/${projectId}/tasks`).then(r => r.data),

  // Faturalar
  getMyInvoices: (status) => {
    const params = status ? { status } : {};
    return api.get(`${BASE}/invoices`, { params }).then(r => r.data);
  },

  getMyInvoice: (id) =>
    api.get(`${BASE}/invoices/${id}`).then(r => r.data),

  // Fatura aksiyonu: action = 'approve' | 'request-revision'
  invoiceAction: (id, action, note) =>
    api.patch(`${BASE}/invoices/${id}/action`, { action, note }).then(r => r.data),

  // İstekler
  sendRequest: (projectId, message) =>
    api.post(`${BASE}/projects/${projectId}/requests`, { projectId, message }).then(r => r.data),

  previewRequest: (projectId, message) =>
    api.post(`${BASE}/projects/${projectId}/requests/preview`, { message }).then(r => r.data),

  getMyRequests: (projectId) =>
    api.get(`${BASE}/projects/${projectId}/requests`).then(r => r.data),
};
