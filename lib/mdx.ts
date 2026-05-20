import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { Article, ArticleFrontmatter, NewsItem } from './types';

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles');

async function ensureDir(): Promise<void> {
  try {
    await fs.access(ARTICLES_DIR);
  } catch {
    await fs.mkdir(ARTICLES_DIR, { recursive: true });
  }
}

export async function getAllArticleSlugs(): Promise<string[]> {
  await ensureDir();
  const files = await fs.readdir(ARTICLES_DIR);
  return files.filter((f) => f.endsWith('.mdx') || f.endsWith('.md')).map((f) => f.replace(/\.(mdx|md)$/, ''));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  await ensureDir();
  for (const ext of ['.mdx', '.md']) {
    const filepath = path.join(ARTICLES_DIR, `${slug}${ext}`);
    try {
      const raw = await fs.readFile(filepath, 'utf8');
      const { data, content } = matter(raw);
      const fm = data as ArticleFrontmatter;
      return { ...fm, slug, content };
    } catch {
      continue;
    }
  }
  return null;
}

export async function getAllArticles(): Promise<Article[]> {
  const slugs = await getAllArticleSlugs();
  const articles = await Promise.all(slugs.map(getArticleBySlug));
  return articles
    .filter((a): a is Article => a !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getArticlesAsNewsItems(): Promise<NewsItem[]> {
  const articles = await getAllArticles();
  return articles.map((a) => ({
    id: `internal-${a.slug}`,
    title: a.title,
    excerpt: a.excerpt,
    url: `/news/${a.slug}`,
    image: a.image,
    source: 'FútHoy',
    pubDate: new Date(a.date).toISOString(),
    tag: a.tag,
    isInternal: true,
    slug: a.slug,
    author: a.author,
    exclusive: a.exclusive,
  }));
}

export async function getRelatedArticles(currentSlug: string, tag: string, limit = 3): Promise<Article[]> {
  const all = await getAllArticles();
  return all
    .filter((a) => a.slug !== currentSlug && a.tag === tag)
    .slice(0, limit);
}
