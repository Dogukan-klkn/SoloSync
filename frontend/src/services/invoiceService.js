import api from './api';

export const invoiceService = {
  getAll: (status) => {
    const params = status ? { status } : {};
    return api.get('/invoices', { params }).then(r => r.data);
  },
  getById: (id) => api.get(`/invoices/${id}`).then(r => r.data),
  create: (data) => api.post('/invoices', data).then(r => r.data),
  update: (id, data) => api.put(`/invoices/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/invoices/${id}`),
  addItem: (id, data) => api.post(`/invoices/${id}/items`, data).then(r => r.data),
  removeItem: (id, itemId) => api.delete(`/invoices/${id}/items/${itemId}`).then(r => r.data),
  addPayment: (id, data) => api.post(`/invoices/${id}/payments`, data).then(r => r.data),
  send: (id) => api.patch(`/invoices/${id}/send`).then(r => r.data),
  clientAction: (id, data) => api.patch(`/invoices/${id}/client-action`, data).then(r => r.data),
};
