export type NewsTag =
  | 'La Liga'
  | 'Champions'
  | 'Mundial'
  | 'World Cup'
  | 'Fichajes'
  | 'Selección'
  | 'Análisis'
  | 'Copa América'
  | 'Real Madrid'
  | 'Barça'
  | 'Atlético';

export interface NewsItem {
  id: string;
  title: string;
  excerpt?: string;
  url: string;
  image?: string;
  source: string;
  sourceUrl?: string;
  pubDate: string;
  tag?: NewsTag | string;
  isInternal: boolean;
  slug?: string;
  author?: string;
  exclusive?: boolean;
}

export interface ArticleFrontmatter {
  title: string;
  slug: string;
  date: string;
  author: string;
  tag: NewsTag | string;
  image: string;
  excerpt: string;
  exclusive?: boolean;
}

export interface Article extends ArticleFrontmatter {
  content: string;
}

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
