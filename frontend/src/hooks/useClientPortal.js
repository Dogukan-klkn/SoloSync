import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientPortalService } from '../services/clientPortalService';

export const useMyProfile = (options = {}) =>
  useQuery({
    queryKey: ['cp-profile'],
    queryFn: clientPortalService.getMyProfile,
    staleTime: 1000 * 60 * 5,
    ...options,
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

export const usePreviewRequest = (projectId) =>
  useMutation({
    mutationFn: (message) => clientPortalService.previewRequest(projectId, message),
  });

export const useSendRequest = (projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message) => clientPortalService.sendRequest(projectId, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cp-requests', projectId] });
      qc.invalidateQueries({ queryKey: ['cp-projects'] });
    },
  });
};

export const useMyRequests = (projectId) =>
  useQuery({
    queryKey: ['cp-requests', projectId],
    queryFn: () => clientPortalService.getMyRequests(projectId),
    enabled: !!projectId,
  });

/** Tüm projelerdeki istekleri tek listede döner (client portal global sayfa) */
export const useAllMyRequests = () => {
  const { data: projects = [], isLoading: projectsLoading } = useMyProjects();

  const requestQueries = useQueries({
    queries: projects.map((p) => ({
      queryKey: ['cp-requests', p.id],
      queryFn: () => clientPortalService.getMyRequests(p.id),
      enabled: !!p.id,
    })),
  });

  const requestsLoading = requestQueries.some((q) => q.isLoading);
  const allRequests = projects.flatMap((p, i) =>
    (requestQueries[i]?.data ?? []).map((r) => ({
      ...r,
      projectName: p.name,
    }))
  ).sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  return {
    data: allRequests,
    projects,
    isLoading: projectsLoading || requestsLoading,
  };
};
