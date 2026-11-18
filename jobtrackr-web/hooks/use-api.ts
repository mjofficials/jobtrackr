'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';
import type {
  Application,
  ApplicationInput,
  DashboardActivity,
  DashboardSummary,
  ListResponse,
  RecentApplication,
  User,
  Profile,
  AiUsage,
  AiLog,
  AiKind,
  AiResultByKind,
} from '@/types';

const get = <T,>(url: string) => api.get<T>(url).then((r) => r.data);

export const useMe = () => useQuery({ queryKey: QUERY_KEYS.me, queryFn: () => get<User>('/auth/me') });

export const useApplications = () =>
  useQuery({
    queryKey: QUERY_KEYS.applications,
    queryFn: () => get<ListResponse<Application>>('/applications').then((r) => r.data),
  });

export const useDashboard = () => ({
  summary: useQuery({ queryKey: QUERY_KEYS.dashboardSummary, queryFn: () => get<DashboardSummary>('/dashboard/summary') }),
  activity: useQuery({ queryKey: QUERY_KEYS.dashboardActivity, queryFn: () => get<DashboardActivity>('/dashboard/activity') }),
  recent: useQuery({ queryKey: QUERY_KEYS.dashboardRecent, queryFn: () => get<RecentApplication[]>('/dashboard/recent?limit=6') }),
});

/** Any change to an application invalidates the list and every dashboard query. */
function useInvalidateApplications() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.applications });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useSaveApplication() {
  const invalidate = useInvalidateApplications();
  return useMutation({
    mutationFn: ({ id, ...input }: ApplicationInput & { id?: string }) =>
      id
        ? api.patch<Application>(`/applications/${id}`, input).then((r) => r.data)
        : api.post<Application>('/applications/create', input).then((r) => r.data),
    onSuccess: invalidate,
  });
}

const MOVE_KEY = ['move-application'];

export function useMoveApplication() {
  const qc = useQueryClient();
  const invalidate = useInvalidateApplications();
  return useMutation({
    mutationKey: MOVE_KEY,
    mutationFn: ({ id, status }: Pick<Application, 'id' | 'status'>) =>
      api.patch(`/applications/${id}`, { status }),
    // Optimistic: move the card immediately, roll back if the API refuses.
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.applications });
      const prev = qc.getQueryData<Application[]>(QUERY_KEYS.applications);
      qc.setQueryData<Application[]>(QUERY_KEYS.applications, (list) =>
        list?.map((a) => (a.id === id ? { ...a, status } : a))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(QUERY_KEYS.applications, ctx.prev),
    // Only refetch once the last in-flight move settles; an earlier refetch would
    // return stale data and briefly undo moves that are still on their way.
    onSettled: () => {
      if (qc.isMutating({ mutationKey: MOVE_KEY }) === 1) invalidate();
    },
  });
}

export function useDeleteApplication() {
  const invalidate = useInvalidateApplications();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/applications/${id}`),
    onSuccess: invalidate,
  });
}

// ---- Profile ----

export const useProfile = () =>
  useQuery({ queryKey: QUERY_KEYS.profile, queryFn: () => get<Profile>('/profile') });

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Pick<Profile, 'name' | 'resumeText'>>) =>
      api.patch<Profile>('/profile/update', input).then((r) => r.data),
    onSuccess: (profile) => {
      qc.setQueryData(QUERY_KEYS.profile, profile);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.me });
    },
  });
}

/** Uploads a PDF and returns its extracted text. Nothing is saved until useUpdateProfile. */
export function useExtractResume() {
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post<{ text: string; pages: number }>('/profile/resume', form).then((r) => r.data);
    },
  });
}

// ---- AI ----

export const useAiUsage = () =>
  useQuery({ queryKey: QUERY_KEYS.aiUsage, queryFn: () => get<AiUsage>('/ai/usage') });

export const useAiLogs = (applicationId: string | undefined) =>
  useQuery({
    queryKey: QUERY_KEYS.aiLogs(applicationId ?? ''),
    queryFn: () => get<AiLog[]>(`/ai?applicationId=${applicationId}`),
    enabled: Boolean(applicationId),
  });

const AI_ENDPOINT: Record<AiKind, string> = {
  MATCH_SCORE: '/ai/match-score',
  INTERVIEW_PREP: '/ai/interview-prep',
  FOLLOW_UP_EMAIL: '/ai/follow-up-email',
};

export function useGenerateAi<K extends AiKind>(kind: K, applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<AiResultByKind[K]>(AI_ENDPOINT[kind], { applicationId }, { timeout: 120_000 }).then((r) => r.data),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.aiUsage });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.aiLogs(applicationId) });
    },
  });
}
