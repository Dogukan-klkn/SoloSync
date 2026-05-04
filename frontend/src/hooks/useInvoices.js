import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../services/invoiceService';

export function useInvoices(status) {
  return useQuery({
    queryKey: ['invoices', status],
    queryFn: () => invoiceService.getAll(status),
  });
}

export function useInvoice(id) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoiceService.getById(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: invoiceService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => invoiceService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: invoiceService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useAddInvoiceItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => invoiceService.addItem(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useRemoveInvoiceItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, itemId }) => invoiceService.removeItem(id, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useAddPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => invoiceService.addPayment(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useSendInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: invoiceService.send,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useClientAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => invoiceService.clientAction(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}
