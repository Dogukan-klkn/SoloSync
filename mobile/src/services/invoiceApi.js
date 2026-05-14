// Freelancer fatura API — web `invoiceService` ile aynı uçlar
import api from './api';

const BASE = '/invoices';

export const invoiceApi = {
  getAll:  (status) => api.get(BASE, { params: status ? { status } : {} }),
  getById: (id)     => api.get(`${BASE}/${id}`),
  create:  (data)   => api.post(BASE, data),
  update:  (id, data) => api.put(`${BASE}/${id}`, data),
  remove:  (id)     => api.delete(`${BASE}/${id}`),
  addItem: (id, data) => api.post(`${BASE}/${id}/items`, data),
  removeItem: (id, itemId) => api.delete(`${BASE}/${id}/items/${itemId}`),
  addPayment: (id, data) => api.post(`${BASE}/${id}/payments`, data),
  send:    (id) => api.patch(`${BASE}/${id}/send`),
  clientAction: (id, data) => api.patch(`${BASE}/${id}/client-action`, data),
};
