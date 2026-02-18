import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, DailyTotalView } from '../backend';

export function useGetCallerUserProfile(): UseQueryResult<UserProfile | null, Error> {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null, Error>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  } as UseQueryResult<UserProfile | null, Error>;
}

export function useSaveCallerUserProfile(): UseMutationResult<void, Error, UserProfile, unknown> {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, UserProfile>({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSaveDailyTotal(): UseMutationResult<
  void,
  Error,
  { branch: string; date: string; totalRevenue: bigint; productQuantities: Array<[string, bigint]> },
  unknown
> {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { branch: string; date: string; totalRevenue: bigint; productQuantities: Array<[string, bigint]> }
  >({
    mutationFn: async ({ branch, date, totalRevenue, productQuantities }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveDailyTotal(branch, date, totalRevenue, productQuantities);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dailyTotal', variables.branch, variables.date] });
      queryClient.invalidateQueries({ queryKey: ['balanceSheet', variables.branch] });
    },
  });
}

export function useGetDailyTotal(
  branch: string,
  date: string
): UseQueryResult<DailyTotalView | null, Error> {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DailyTotalView | null, Error>({
    queryKey: ['dailyTotal', branch, date],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDailyTotal(branch, date);
    },
    enabled: !!actor && !actorFetching && !!branch && !!date,
  });
}

export function useGetBalanceSheet(
  branch: string
): UseQueryResult<Array<[string, DailyTotalView]>, Error> {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[string, DailyTotalView]>, Error>({
    queryKey: ['balanceSheet', branch],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBalanceSheet(branch);
    },
    enabled: !!actor && !actorFetching && !!branch,
  });
}

export function useClearAllDailyTotals(): UseMutationResult<void, Error, void, unknown> {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.clearAllDailyTotals();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyTotal'] });
      queryClient.invalidateQueries({ queryKey: ['balanceSheet'] });
    },
  });
}
