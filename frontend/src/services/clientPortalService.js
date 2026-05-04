import api from './api';

const BASE = '/client-portal';

export const clientPortalService = {
  getMyProfile: () =>
    api.get(`${BASE}/me`).then(r => r.data),

  getMyProjects: () =>
    api.get(`${BASE}/projects`).then(r => r.data),

  getMyProject: (id) =>
    api.get(`${BASE}/projects/${id}`).then(r => r.data),

  getMyMilestones: (projectId) =>
    api.get(`${BASE}/projects/${projectId}/milestones`).then(r => r.data),

  getMyTasks: (projectId) =>
    api.get(`${BASE}/projects/${projectId}/tasks`).then(r => r.data),

  getMyInvoices: (status) => {
    const params = status ? { status } : {};
    return api.get(`${BASE}/invoices`, { params }).then(r => r.data);
  },

  getMyInvoice: (id) =>
    api.get(`${BASE}/invoices/${id}`).then(r => r.data),

  invoiceAction: (id, action, notes) =>
    api.patch(`${BASE}/invoices/${id}/action`, { action, notes }).then(r => r.data),

  sendRequest: (projectId, message) =>
    api.post(`${BASE}/projects/${projectId}/requests`, { projectId, message }).then(r => r.data),

  getMyRequests: (projectId) =>
    api.get(`${BASE}/projects/${projectId}/requests`).then(r => r.data),
};
