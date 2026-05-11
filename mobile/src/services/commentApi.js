import api from './api';

export const commentApi = {
  getByTask: async (taskId) => {
    const { data } = await api.get(`/comments?projectTaskId=${taskId}`);
    return data;
  },
  getByInvoice: async (invoiceId) => {
    const { data } = await api.get(`/comments?invoiceId=${invoiceId}`);
    return data;
  },
  create: async (payload) => {
    // payload: { projectTaskId?, invoiceId?, content }
    const { data } = await api.post('/comments', payload);
    return data;
  },
  update: async (id, content) => {
    const { data } = await api.put(`/comments/${id}`, { content });
    return data;
  },
  delete: async (id) => {
    await api.delete(`/comments/${id}`);
  },
};
