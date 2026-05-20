import { axiosClient } from '../client';
import type { NewsItem } from '@/types';

export async function fetchNews(): Promise<NewsItem[]> {
  const { data } = await axiosClient.post<NewsItem[]>('/api/news');
  return data;
}

export async function fetchNewsByCountry(countryId: string): Promise<NewsItem[]> {
  const { data } = await axiosClient.post<NewsItem[]>(`/api/country/${countryId}`);
  return data;
}

export async function fetchNewsByCategory(category: string): Promise<NewsItem[]> {
  const { data } = await axiosClient.post<NewsItem[]>('/api/news', { category });
  return data;
}
