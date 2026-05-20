import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArticleHeader } from '@/components/article/ArticleHeader';
import { ArticleBody } from '@/components/article/ArticleBody';
import { RelatedNews } from '@/components/article/RelatedNews';
import { getAllArticleSlugs, getArticleBySlug, getRelatedArticles } from '@/lib/mdx';

export const revalidate = 600;

type Params = Promise<{ locale: string; slug: string }>;

export async function generateStaticParams() {
  try {
    const slugs = await getAllArticleSlugs();
    return slugs.flatMap((slug) => [
      { locale: 'es', slug },
      { locale: 'en', slug },
    ]);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      images: article.image ? [{ url: article.image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.image ? [article.image] : [],
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article.slug, String(article.tag), 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    author: { '@type': 'Person', name: article.author },
    image: article.image ? [article.image] : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'FútHoy',
    },
  };

  return (
    <article className="container-fh py-8">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ArticleHeader article={article} />

      {article.image && (
        <div className="mx-auto mt-6 max-w-4xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image}
            alt={article.title}
            className="w-full rounded-lg object-cover shadow-card"
          />
        </div>
      )}

      <ArticleBody content={article.content} />

      <RelatedNews articles={related} />
    </article>
  );
}
