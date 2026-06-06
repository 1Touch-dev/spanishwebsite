export type NewsTab =
  | 'all'
  | 'laliga'
  | 'champions'
  | 'worldCup'
  | 'transfers'
  | 'national'
  | 'analysis';

const TAB_KEYWORDS: Record<Exclude<NewsTab, 'all'>, string[]> = {
  laliga: ['la liga', 'real madrid', 'barca', 'atletico'],
  champions: ['champions', 'uefa'],
  worldCup: ['mundial', 'world cup', 'copa del mundo'],
  transfers: ['fichaje', 'fichajes', 'transfer'],
  national: ['seleccion', 'la roja', 'albiceleste', 'tricolor', 'cafetero', 'blanquirroja'],
  analysis: ['analisis'],
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function haystack(article: {
  title?: string;
  description?: string;
  summary?: string;
  category?: string[];
  tags?: string[];
}): string {
  return normalize(
    [
      article.title,
      article.description,
      article.summary,
      ...(article.category ?? []),
      ...(article.tags ?? []),
    ]
      .filter(Boolean)
      .join(' '),
  );
}

export function filterArticlesByTab<T extends Parameters<typeof haystack>[0]>(
  articles: T[],
  tab: NewsTab,
): T[] {
  if (tab === 'all') {
    return articles;
  }

  const keywords = TAB_KEYWORDS[tab];
  return articles.filter((article) =>
    keywords.some((keyword) => haystack(article).includes(keyword)),
  );
}
