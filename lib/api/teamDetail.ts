import { axiosClient } from '../client';
import type { TeamDetailPayload } from '@/types';

export async function fetchTeamDetail(teamId: string): Promise<TeamDetailPayload> {
  const { data } = await axiosClient.post<TeamDetailPayload>(`/api/teams/${teamId}`);
  return data;
}
