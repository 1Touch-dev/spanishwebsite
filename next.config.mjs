import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.marca.com' },
      { protocol: 'https', hostname: '**.as.com' },
      { protocol: 'https', hostname: '**.mundodeportivo.com' },
      { protocol: 'https', hostname: '**.elpais.com' },
      { protocol: 'https', hostname: '**.ole.com.ar' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'crests.football-data.org' },
      { protocol: 'https', hostname: 'media.api-sports.io' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'cdn.example.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async redirects() {
    return [
      { source: '/noticias/:slug*', destination: '/news/:slug*', permanent: true },
      { source: '/en/noticias/:slug*', destination: '/en/news/:slug*', permanent: true },
      { source: '/mundial', destination: '/world-cup', permanent: true },
      { source: '/en/mundial', destination: '/en/world-cup', permanent: true },
      { source: '/resultados', destination: '/matches', permanent: true },
      { source: '/en/resultados', destination: '/en/matches', permanent: true },
      { source: '/clasificacion', destination: '/standings', permanent: true },
      { source: '/en/clasificacion', destination: '/en/standings', permanent: true },
      { source: '/la-liga', destination: '/country/spain', permanent: true },
      { source: '/en/la-liga', destination: '/en/country/spain', permanent: true },
      { source: '/champions', destination: '/news', permanent: true },
      { source: '/en/champions', destination: '/en/news', permanent: true },
      { source: '/transfers', destination: '/news', permanent: true },
      { source: '/en/transfers', destination: '/en/news', permanent: true },
      { source: '/analisis', destination: '/news', permanent: true },
      { source: '/en/analisis', destination: '/en/news', permanent: true },
      { source: '/equipos/:team*', destination: '/country/spain', permanent: true },
      { source: '/en/equipos/:team*', destination: '/en/country/spain', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
