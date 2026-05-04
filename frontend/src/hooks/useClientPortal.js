import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientPortalService } from '../services/clientPortalService';

export const useMyProfile = () =>
  useQuery({
    queryKey: ['cp-profile'],
    queryFn: clientPortalService.getMyProfile,
    staleTime: 1000 * 60 * 5,
  });

export const useMyProjects = () =>
  useQuery({
    queryKey: ['cp-projects'],
    queryFn: clientPortalService.getMyProjects,
  });

export const useMyProject = (id) =>
  useQuery({
    queryKey: ['cp-projects', id],
    queryFn: () => clientPortalService.getMyProject(id),
    enabled: !!id,
  });

export const useMyMilestones = (projectId) =>
  useQuery({
    queryKey: ['cp-milestones', projectId],
    queryFn: () => clientPortalService.getMyMilestones(projectId),
    enabled: !!projectId,
  });

export const useMyTasks = (projectId) =>
  useQuery({
    queryKey: ['cp-tasks', projectId],
    queryFn: () => clientPortalService.getMyTasks(projectId),
    enabled: !!projectId,
  });

export const useMyInvoices = (status) =>
  useQuery({
    queryKey: ['cp-invoices', status],
    queryFn: () => clientPortalService.getMyInvoices(status),
  });

export const useMyInvoice = (id) =>
  useQuery({
    queryKey: ['cp-invoices', id],
    queryFn: () => clientPortalService.getMyInvoice(id),
    enabled: !!id,
  });

export const useInvoiceAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, notes }) => clientPortalService.invoiceAction(id, action, notes),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['cp-invoices'] });
      qc.invalidateQueries({ queryKey: ['cp-invoices', id] });
    },
  });
};

export const useSendRequest = (projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message) => clientPortalService.sendRequest(projectId, message),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cp-requests', projectId] }),
  });
};

export const useMyRequests = (projectId) =>
  useQuery({
    queryKey: ['cp-requests', projectId],
    queryFn: () => clientPortalService.getMyRequests(projectId),
    enabled: !!projectId,
  });
