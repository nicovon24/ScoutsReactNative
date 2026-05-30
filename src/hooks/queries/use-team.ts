import { useQuery } from '@tanstack/react-query';
import { getTeamSquad } from '@/lib/bzzoiro/endpoints';

export function useTeamSquad(teamId: number) {
  return useQuery({
    queryKey: ['team-squad', teamId],
    queryFn: () => getTeamSquad(teamId),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: teamId > 0,
  });
}
