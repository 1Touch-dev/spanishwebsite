import { axiosClient } from '../client';
import type { RankingsPayload } from '@/types';

export interface FetchRankingsParams {
  countryId?: string;
}

export async function fetchRankings(
  params: FetchRankingsParams = {},
): Promise<RankingsPayload> {
  const { data } = await axiosClient.post<RankingsPayload>('/api/rankings', params);
  return data;
}
