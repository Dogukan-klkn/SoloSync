// src/hooks/useCustomers.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customerService';

// Sabit key — tüm mutation'ların invalidate ettiği yer
export const CUSTOMERS_KEY = ['customers'];

export function useCustomers(search) {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, search ?? ''],
    queryFn:  () => customerService.getAll(search).then(r => r.data),
    staleTime: 30_000, // 30 sn
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => customerService.create(data).then(r => r.data),
    onSuccess: () => {
      // Tüm customer sorgularını geçersiz kıl — tablo anında güncellenir
      qc.invalidateQueries({ queryKey: CUSTOMERS_KEY });
    },
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customerService.update(id, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMERS_KEY });
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => customerService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMERS_KEY });
    },
    // 409 Conflict — müşterinin aktif projeleri var
    onError: (error) => {
      const msg =
        error.response?.data?.message ||
        'Müşteri silinirken bir hata oluştu.';
      // Error state için caller bileşeni yakalar
      return msg;
    },
  });
}
