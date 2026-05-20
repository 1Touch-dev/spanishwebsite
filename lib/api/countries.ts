import { axiosClient } from '../client';
import type { Country } from '@/types';

export async function fetchCountries(): Promise<Country[]> {
  const { data } = await axiosClient.post<Country[]>('/api/countries');
  return data;
}
