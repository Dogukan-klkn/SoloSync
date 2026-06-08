import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { clientPortalService } from '../services/clientPortalService';

export const PROFILE_KEY = ['user-profile'];
export const CLIENT_PROFILE_KEY = ['cp-profile'];

export function useUserProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => authService.getProfile().then(r => r.data),
    staleTime: 60_000,
  });
}

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => authService.updateProfile(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
}

export function useUpdateClientProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => clientPortalService.updateMyProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLIENT_PROFILE_KEY });
    },
  });
}
