import { axiosClient } from '../client';
import type { LiveMatch } from '@/types';

export interface FetchMatchesParams {
  countryId?: string;
  tab?: 'live' | 'upcoming' | 'results';
}

export async function fetchMatches(params: FetchMatchesParams = {}): Promise<LiveMatch[]> {
  const { data } = await axiosClient.post<LiveMatch[]>('/api/matches', params);
  return data;
}
