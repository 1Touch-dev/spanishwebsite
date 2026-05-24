import { axiosClient } from '../client';
import type { PlayerDetailPayload } from '@/types';

export async function fetchPlayerDetail(playerId: string): Promise<PlayerDetailPayload> {
  const { data } = await axiosClient.post<PlayerDetailPayload>(`/api/players/${playerId}`);
  return data;
}
