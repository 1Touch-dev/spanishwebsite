import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArticleHeader } from '@/components/article/ArticleHeader';
import { ArticleBody } from '@/components/article/ArticleBody';
import {
  fetchArticleBySlug,
  getArticleAuthor,
  getArticleExcerpt,
  getArticleImage,
  mapGolazoProArticleToArticle,
} from '@/src/lib/cms/golazoProApi';

export const revalidate = 60;

type Params = Promise<{ locale: string; slug: string }>;

const getCmsArticle = cache(async (slug: string) =>
  fetchArticleBySlug(slug, {
    next: { revalidate: 60 },
  }),
);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const article = await getCmsArticle(slug);
    const image = getArticleImage(article);
    const title = article.seo?.meta_title || article.title;
    const description = article.seo?.meta_description || getArticleExcerpt(article);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: article.createdAt,
        modifiedTime: article.updatedAt,
        authors: [getArticleAuthor(article)],
        images: image ? [{ url: image }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: image ? [image] : [],
      },
    };
  } catch {
    return {
      title: 'Noticia no encontrada',
    };
  }
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let cmsArticle;
  try {
    cmsArticle = await getCmsArticle(slug);
  } catch {
    notFound();
  }

  const article = mapGolazoProArticleToArticle(cmsArticle);
  const image = getArticleImage(cmsArticle);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    datePublished: cmsArticle.createdAt,
    dateModified: cmsArticle.updatedAt,
    author: { '@type': 'Person', name: article.author },
    image: image ? [image] : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Golazo Pro',
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

      {image && (
        <div className="mx-auto mt-6 max-w-4xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={article.title}
            className="w-full rounded-lg object-cover shadow-card"
          />
        </div>
      )}

      <ArticleBody content={article.content} />
    </article>
  );
}
