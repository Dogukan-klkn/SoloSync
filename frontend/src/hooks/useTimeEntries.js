import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeEntryService } from '../services/timeEntryService';

const ENTRIES_KEY  = 'time-entries';
const RUNNING_KEY  = 'time-entry-running';
const SUMMARY_KEY  = 'time-summary';

export function useTimeEntries(params = {}) {
  return useQuery({
    queryKey: [ENTRIES_KEY, params],
    queryFn:  () => timeEntryService.getEntries(params),
  });
}

export function useRunningEntry() {
  return useQuery({
    queryKey: [RUNNING_KEY],
    queryFn:  () => timeEntryService.getRunning(),
    // Her 10 saniyede bir yenile — kronometre canlı gösterimi için
    refetchInterval: 10_000,
  });
}

export function useTimeSummary(params = {}) {
  return useQuery({
    queryKey: [SUMMARY_KEY, params],
    queryFn:  () => timeEntryService.getSummary(params),
  });
}

export function useStartTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => timeEntryService.start(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RUNNING_KEY] });
      qc.invalidateQueries({ queryKey: [ENTRIES_KEY] });
    },
  });
}

export function useStopTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => timeEntryService.stop(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RUNNING_KEY] });
      qc.invalidateQueries({ queryKey: [ENTRIES_KEY] });
      qc.invalidateQueries({ queryKey: [SUMMARY_KEY] });
    },
  });
}

export function useCreateManualEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => timeEntryService.createManual(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENTRIES_KEY] });
      qc.invalidateQueries({ queryKey: [SUMMARY_KEY] });
    },
  });
}

export function useDeleteTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => timeEntryService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENTRIES_KEY] });
      qc.invalidateQueries({ queryKey: [SUMMARY_KEY] });
    },
  });
}
