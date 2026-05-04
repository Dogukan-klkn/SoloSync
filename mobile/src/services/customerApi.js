// src/services/customerApi.js
import api from './api';

export const customerApi = {
  getAll:  (search)     => api.get('/customers', { params: search ? { search } : {} }),
  getById: (id)         => api.get(`/customers/${id}`),
  create:  (data)       => api.post('/customers', data),
  update:  (id, data)   => api.put(`/customers/${id}`, data),
  remove:  (id)         => api.delete(`/customers/${id}`),
};
