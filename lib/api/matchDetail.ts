import { axiosClient } from '../client';
import type { MatchDetailPayload } from '@/types';

export async function fetchMatchDetail(matchId: string): Promise<MatchDetailPayload> {
  const { data } = await axiosClient.post<MatchDetailPayload>(`/api/matches/${matchId}`);
  return data;
}
