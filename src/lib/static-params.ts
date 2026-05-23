import { getStandings, getTeamSquad, LEAGUES } from '@/lib/bzzoiro/endpoints';

/** Player IDs fetched at build time for static web export. */
export async function getLeaguePlayerIds(): Promise<number[]> {
  try {
    const ids = new Set<number>();

    for (const league of LEAGUES) {
      const standings = await getStandings(league.id);
      const squads = await Promise.all(
        standings.standings.map((entry) => getTeamSquad(entry.team_id)),
      );

      for (const squad of squads) {
        for (const player of squad.players) {
          ids.add(player.id);
        }
      }
    }

    return [...ids];
  } catch (error) {
    console.warn('[generateStaticParams] Failed to fetch player IDs:', error);
    return [];
  }
}
