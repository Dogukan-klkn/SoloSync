// src/hooks/useProjects.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';

export const PROJECTS_KEY = ['projects'];

export function useProjects(customerId) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, customerId],
    queryFn:  () => projectService.getAll(customerId).then(r => r.data),
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, id],
    queryFn:  () => projectService.getById(id).then(r => r.data),
    enabled:  !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => projectService.create(data).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => projectService.update(id, data).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => projectService.remove(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function useMilestones(projectId) {
  return useQuery({
    queryKey: ['milestones', projectId],
    queryFn:  () => projectService.getMilestones(projectId).then(r => r.data),
    enabled:  !!projectId,
  });
}

export function useAddMilestone(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => projectService.addMilestone(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['milestones', projectId] });
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

