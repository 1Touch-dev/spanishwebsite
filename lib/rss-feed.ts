import { getAllArticles } from './mdx';
import type { Article } from './types';

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(date: string): string {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

function articleItemXml(article: Article, siteUrl: string): string {
  const link = `${siteUrl}/news/${article.slug}`;
  const description = escapeXml(article.excerpt || article.title);
  const title = escapeXml(article.title);
  const author = escapeXml(article.author);
  const category = escapeXml(String(article.tag));

  const enclosure =
    article.image && article.image.startsWith('http')
      ? `\n      <enclosure url="${escapeXml(article.image)}" type="image/jpeg" />`
      : '';

  return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${toRfc822(article.date)}</pubDate>
      <description>${description}</description>
      <author>${author}</author>
      <category>${category}</category>${enclosure}
    </item>`;
}

export async function buildSiteRssFeed(): Promise<string> {
  const siteUrl = getSiteUrl();
  const articles = await getAllArticles();
  const latest = articles.slice(0, 50);
  const lastBuild = latest[0]?.date
    ? toRfc822(latest[0].date)
    : new Date().toUTCString();

  const items = latest.map((a) => articleItemXml(a, siteUrl)).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FútHoy — Fútbol español</title>
    <link>${siteUrl}</link>
    <description>Las últimas noticias y análisis de La Liga, Champions y la selección española.</description>
    <language>es-ES</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${siteUrl}/icon.svg</url>
      <title>FútHoy</title>
      <link>${siteUrl}</link>
    </image>
${items}
  </channel>
</rss>`;
}
