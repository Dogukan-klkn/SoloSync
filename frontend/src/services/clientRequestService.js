import api from './api';

export const clientRequestService = {
  getByProject: (projectId, status) => {
    const params = { projectId };
    if (status) params.status = status;
    return api.get('/client-requests', { params }).then(r => r.data);
  },
  getAll: (status) => {
    const params = {};
    if (status) params.status = status;
    return api.get('/client-requests/all', { params }).then(r => r.data);
  },
  create: (data) => api.post('/client-requests', data).then(r => r.data),
  review: (id, data) => api.patch(`/client-requests/${id}/review`, data).then(r => r.data),
};
