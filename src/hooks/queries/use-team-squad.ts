import { useQuery } from '@tanstack/react-query';
import { getTeamSquad } from '@/lib/bzzoiro/endpoints';
import type { SquadResponse } from '@/lib/bzzoiro/types';

export function useTeamSquad(teamId: number) {
  return useQuery<SquadResponse>({
    queryKey: ['team-squad', teamId],
    queryFn: () => getTeamSquad(teamId),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: teamId > 0,
  });
}
