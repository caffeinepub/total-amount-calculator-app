import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile, DailyTotalView } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  // Return custom state that properly reflects actor dependency
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSaveDailyTotal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      totalRevenue,
      productQuantities,
    }: {
      date: string;
      totalRevenue: bigint;
      productQuantities: Array<[string, bigint]>;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveDailyTotal(date, totalRevenue, productQuantities);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balanceSheet'] });
      queryClient.invalidateQueries({ queryKey: ['dailyTotal'] });
    },
  });
}

export function useGetDailyTotal(date: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DailyTotalView | null>({
    queryKey: ['dailyTotal', date],
    queryFn: async () => {
      if (!actor || !date) return null;
      return actor.getDailyTotal(date);
    },
    enabled: !!actor && !actorFetching && !!date,
    retry: false,
  });
}

export function useGetBalanceSheet() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[string, DailyTotalView]>>({
    queryKey: ['balanceSheet'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBalanceSheet();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
