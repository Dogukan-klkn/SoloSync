import api from './api';

export const commentService = {
  getByTask: (taskId) => api.get('/comments', { params: { projectTaskId: taskId } }).then(r => r.data),
  getByInvoice: (invoiceId) => api.get('/comments', { params: { invoiceId } }).then(r => r.data),
  create: (data) => api.post('/comments', data).then(r => r.data),
  update: (id, data) => api.put(`/comments/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/comments/${id}`),
};
