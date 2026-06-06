import type { Article, NewsItem } from '@/types';

const API_BASE =
  process.env.NEXT_PUBLIC_CMS_API_URL?.replace(/\/$/, '') ||
  'https://api.golazopro.com/api';

export const CMS_WEBSITE =
  process.env.NEXT_PUBLIC_CMS_WEBSITE || 'golazopro.com';

export const GolazoProEndpoint = {
  HomePage: 'HomePage',
  News: 'News',
  WorldCup: 'World Cup',
  Other: 'Other',
  Spain: 'Spain',
  Mexico: 'Mexico',
  Colombia: 'Colombia',
  Argentina: 'Argentina',
  Peru: 'Peru',
} as const;

export type GolazoProEndpointName =
  (typeof GolazoProEndpoint)[keyof typeof GolazoProEndpoint];

export const GolazoProCountryEndpointById = {
  spain: GolazoProEndpoint.Spain,
  mexico: GolazoProEndpoint.Mexico,
  colombia: GolazoProEndpoint.Colombia,
  argentina: GolazoProEndpoint.Argentina,
  peru: GolazoProEndpoint.Peru,
} as const;

export type GolazoProCountryId = keyof typeof GolazoProCountryEndpointById;

export interface GolazoProSeo {
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
}

export interface GolazoProArticle {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  content: string;
  category?: string[];
  tags?: string[];
  countryName?: string | string[];
  leagueName?: string | string[];
  imageUrls?: string[];
  markdownImages?: string[];
  coverImage?: string;
  targetWebsites?: string[];
  endpointAssignments?: Array<{ name: string }>;
  seo?: GolazoProSeo;
  authorNames?: string[];
  views?: number;
  websiteSection?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GolazoProListResponse {
  data: GolazoProArticle[];
  meta: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

export interface FetchArticlesOptions {
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'updatedAt' | 'scheduledTime' | 'title' | 'views';
  order?: 'asc' | 'desc';
  search?: string;
  requireImage?: boolean;
  daysBack?: number;
  category?: string;
}

type CmsFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const url = new URL(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

async function cmsGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  init?: CmsFetchInit,
): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response
      .json()
      .catch(async () => ({ message: await response.text().catch(() => '') }));

    throw new Error(
      (body as { message?: string }).message || `CMS ${response.status}: ${path}`,
    );
  }

  return response.json() as Promise<T>;
}

export function getArticleImage(article: GolazoProArticle): string | undefined {
  return article.coverImage || article.imageUrls?.[0] || article.markdownImages?.[0];
}

export function getArticleExcerpt(article: GolazoProArticle): string {
  return article.summary || article.description || '';
}

export function getArticleAuthor(article: GolazoProArticle): string {
  return article.authorNames?.[0]?.trim() || 'Redaccion Golazo Pro';
}

export function getArticleTag(article: GolazoProArticle): string | undefined {
  const endpointTag = article.endpointAssignments?.find(
    (endpoint) =>
      endpoint.name !== GolazoProEndpoint.HomePage &&
      endpoint.name !== GolazoProEndpoint.News &&
      endpoint.name !== GolazoProEndpoint.Other,
  )?.name;

  return article.category?.[0] || article.tags?.[0] || endpointTag;
}

export function mapGolazoProArticleToNewsItem(article: GolazoProArticle): NewsItem {
  return {
    id: article._id || article.id || article.slug,
    title: article.title,
    excerpt: getArticleExcerpt(article),
    url: `/news/${article.slug}`,
    image: getArticleImage(article),
    source: 'Golazo Pro',
    sourceUrl: 'https://golazopro.com',
    pubDate: article.createdAt || article.updatedAt,
    tag: getArticleTag(article),
    isInternal: true,
    slug: article.slug,
    author: getArticleAuthor(article),
  };
}

export function mapGolazoProArticleToArticle(article: GolazoProArticle): Article {
  return {
    title: article.title,
    slug: article.slug,
    date: article.createdAt || article.updatedAt,
    author: getArticleAuthor(article),
    tag: getArticleTag(article) || 'Noticias',
    image: getArticleImage(article) || '',
    excerpt: getArticleExcerpt(article),
    content: article.content || article.description || article.summary || '',
  };
}

export async function fetchArticlesByEndpoint(
  endpoint: GolazoProEndpointName | GolazoProEndpointName[],
  options: FetchArticlesOptions = {},
  fetchInit?: CmsFetchInit,
): Promise<GolazoProListResponse> {
  const endpointParam = Array.isArray(endpoint) ? endpoint.join(',') : endpoint;

  return cmsGet<GolazoProListResponse>(
    '/ai-articles',
    {
      targetWebsite: CMS_WEBSITE,
      endpoint: endpointParam,
      filterByEndpoint: true,
      page: options.page ?? 1,
      limit: options.limit ?? 20,
      sort: options.sort ?? 'createdAt',
      order: options.order ?? 'desc',
      search: options.search,
      requireImage: options.requireImage,
      daysBack: options.daysBack,
      category: options.category,
    },
    fetchInit,
  );
}

export const fetchHomeArticles = (limit = 9, init?: CmsFetchInit) =>
  fetchArticlesByEndpoint(GolazoProEndpoint.HomePage, { limit }, init);

export const fetchNewsArticles = (page = 1, limit = 30, init?: CmsFetchInit) =>
  fetchArticlesByEndpoint(GolazoProEndpoint.News, { page, limit }, init);

export const fetchWorldCupArticles = (page = 1, limit = 30, init?: CmsFetchInit) =>
  fetchArticlesByEndpoint(GolazoProEndpoint.WorldCup, { page, limit }, init);

export function isGolazoProCountryId(value: string): value is GolazoProCountryId {
  return value in GolazoProCountryEndpointById;
}

export async function fetchCountryArticles(
  countryId: GolazoProCountryId,
  page = 1,
  limit = 30,
  init?: CmsFetchInit,
): Promise<GolazoProListResponse> {
  return fetchArticlesByEndpoint(
    GolazoProCountryEndpointById[countryId],
    { page, limit },
    init,
  );
}

export async function searchArticles(
  query: string,
  options: FetchArticlesOptions = {},
  fetchInit?: CmsFetchInit,
): Promise<GolazoProListResponse> {
  return cmsGet<GolazoProListResponse>(
    '/ai-articles',
    {
      targetWebsite: CMS_WEBSITE,
      search: query,
      page: options.page ?? 1,
      limit: options.limit ?? 30,
      sort: options.sort ?? 'createdAt',
      order: options.order ?? 'desc',
    },
    fetchInit,
  );
}

export async function fetchArticleBySlug(
  slug: string,
  init?: CmsFetchInit,
): Promise<GolazoProArticle> {
  return cmsGet<GolazoProArticle>(
    `/ai-articles/slug/${encodeURIComponent(slug)}`,
    undefined,
    init,
  );
}
