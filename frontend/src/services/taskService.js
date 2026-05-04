// src/services/taskService.js
import api from './api';

export const taskService = {
  getByProject: (projectId) => api.get('/tasks', { params: { projectId } }),
  getById:      (id)        => api.get(`/tasks/${id}`),
  create:       (data)      => api.post('/tasks', data),
  update:       (id, data)  => api.put(`/tasks/${id}`, data),
  remove:       (id)        => api.delete(`/tasks/${id}`),
  reorder:      (items)     => api.patch('/tasks/reorder', items),
};
