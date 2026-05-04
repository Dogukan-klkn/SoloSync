// src/hooks/useProjectTasks.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';

export const TASKS_KEY = ['project-tasks'];

export function useProjectTasks(projectId) {
  return useQuery({
    queryKey: [...TASKS_KEY, projectId],
    queryFn:  () => taskService.getByProject(projectId).then(r => r.data),
    enabled:  !!projectId,
  });
}

export function useCreateTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => taskService.create(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...TASKS_KEY, projectId] });
      qc.invalidateQueries({ queryKey: ['milestones', projectId] });
    },
  });
}

export function useUpdateTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => taskService.update(id, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...TASKS_KEY, projectId] });
      qc.invalidateQueries({ queryKey: ['milestones', projectId] });
    },
  });
}

export function useDeleteTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskService.remove(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [...TASKS_KEY, projectId] }),
  });
}

export function useReorderTasks(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items) => taskService.reorder(items).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...TASKS_KEY, projectId] });
      // Milestone progress'i anında güncelle
      qc.invalidateQueries({ queryKey: ['milestones', projectId] });
    },
  });
}
