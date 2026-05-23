// src/services/projectService.js
import api from './api';

export const projectService = {
  getAll:         (customerId)  => api.get('/projects', { params: customerId ? { customerId } : {} }),
  getById:        (id)          => api.get(`/projects/${id}`),
  create:         (data)        => api.post('/projects', data),
  update:         (id, data)    => api.put(`/projects/${id}`, data),
  remove:         (id)          => api.delete(`/projects/${id}`),
  getMilestones:      (projectId) => api.get(`/projects/${projectId}/milestones`),
  addMilestone:       (data)      => api.post('/projects/milestones', data),
  getDashboardTasks:  ()          => api.get('/projects/tasks/dashboard'),
};
