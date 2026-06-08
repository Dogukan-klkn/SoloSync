import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services/commentService';

export function useComments({ taskId, invoiceId } = {}) {
  return useQuery({
    queryKey: taskId ? ['comments', 'task', taskId] : ['comments', 'invoice', invoiceId],
    queryFn: () => taskId ? commentService.getByTask(taskId) : commentService.getByInvoice(invoiceId),
    enabled: !!(taskId || invoiceId),
    // Her 10 saniyede bir otomatik yenile — freelancer/client senkronizasyonu
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  });
}

export function useAddComment(taskId, invoiceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: commentService.create,
    onSuccess: () => {
      if (taskId) qc.invalidateQueries({ queryKey: ['comments', 'task', taskId] });
      if (invoiceId) qc.invalidateQueries({ queryKey: ['comments', 'invoice', invoiceId] });
    },
  });
}

export function useUpdateComment(taskId, invoiceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => commentService.update(id, data),
    onSuccess: () => {
      if (taskId) qc.invalidateQueries({ queryKey: ['comments', 'task', taskId] });
      if (invoiceId) qc.invalidateQueries({ queryKey: ['comments', 'invoice', invoiceId] });
    },
  });
}

export function useDeleteComment(taskId, invoiceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: commentService.remove,
    onSuccess: () => {
      if (taskId) qc.invalidateQueries({ queryKey: ['comments', 'task', taskId] });
      if (invoiceId) qc.invalidateQueries({ queryKey: ['comments', 'invoice', invoiceId] });
    },
  });
}
