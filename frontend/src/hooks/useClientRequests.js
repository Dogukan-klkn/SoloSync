import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientRequestService } from '../services/clientRequestService';

const ALL_KEY = ['client-requests', 'all'];

export function useClientRequests(projectId, status) {
  return useQuery({
    queryKey: ['client-requests', projectId, status],
    queryFn: () => clientRequestService.getByProject(projectId, status),
    enabled: !!projectId,
  });
}

export function useAllClientRequests(status) {
  return useQuery({
    queryKey: [...ALL_KEY, status ?? ''],
    queryFn: () => clientRequestService.getAll(status || undefined),
  });
}

export function useCreateClientRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clientRequestService.create,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['client-requests', vars.projectId] });
      qc.invalidateQueries({ queryKey: ALL_KEY });
    },
  });
}

export function useReviewClientRequest(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => clientRequestService.review(id, data),
    onSuccess: () => {
      if (projectId) {
        qc.invalidateQueries({ queryKey: ['client-requests', projectId] });
      }
      qc.invalidateQueries({ queryKey: ALL_KEY });
      qc.invalidateQueries({ queryKey: ['project-tasks'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
