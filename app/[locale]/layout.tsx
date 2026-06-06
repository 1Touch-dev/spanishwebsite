import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale, getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { BreakingTicker } from '@/components/layout/BreakingTicker';
import { NewsletterCTA } from '@/components/layout/NewsletterCTA';
import { Footer } from '@/components/layout/Footer';
import { getArticlesAsNewsItems } from '@/lib/mdx';
import { StoreProvider } from '@/store/StoreProvider';
import {
  fetchWorldCupArticles,
  mapGolazoProArticleToNewsItem,
} from '@/src/lib/cms/golazoProApi';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['700', '800', '900'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
      default: `${t('name')} - ${t('tagline')}`,
      template: `%s | ${t('name')}`,
    },
    description: t('description'),
    openGraph: {
      type: 'website',
      siteName: t('name'),
      locale: locale === 'es' ? 'es_ES' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  let breakingNews = [];

  try {
    const response = await fetchWorldCupArticles(1, 6, {
      next: { revalidate: 60 },
    });
    breakingNews = response.data.map(mapGolazoProArticleToNewsItem);
  } catch (err) {
    console.error('[layout] world cup ticker failed:', (err as Error).message);
    breakingNews = (await getArticlesAsNewsItems()).slice(0, 6);
  }

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'FutHoy',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://futhoy.com',
    inLanguage: locale === 'es' ? 'es-ES' : 'en-US',
    sameAs: [],
  };

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-brand-surface text-brand-navy">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <StoreProvider>
            <Header />
            <BreakingTicker items={breakingNews} />
            <main className="flex-1">{children}</main>
            <NewsletterCTA />
            <Footer />
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
