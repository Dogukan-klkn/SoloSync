import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientRequestService } from '../services/clientRequestService';

export function useClientRequests(projectId, status) {
  return useQuery({
    queryKey: ['client-requests', projectId, status],
    queryFn: () => clientRequestService.getByProject(projectId, status),
    enabled: !!projectId,
  });
}

export function useCreateClientRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clientRequestService.create,
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ['client-requests', vars.projectId] }),
  });
}

export function useReviewClientRequest(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => clientRequestService.review(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-requests', projectId] });
      qc.invalidateQueries({ queryKey: ['project-tasks'] });
    },
  });
}
