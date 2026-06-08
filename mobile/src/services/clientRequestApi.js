// Freelancer istek API — web `clientRequestService` ile aynı uçlar
import api from './api';

const BASE = '/client-requests';

export const clientRequestApi = {
  getByProject: (projectId, status) => {
    const params = { projectId };
    if (status) params.status = status;
    return api.get(BASE, { params });
  },
  getAll: (status) => {
    const params = {};
    if (status) params.status = status;
    return api.get(`${BASE}/all`, { params });
  },
  review: (id, data) => api.patch(`${BASE}/${id}/review`, data),
};
