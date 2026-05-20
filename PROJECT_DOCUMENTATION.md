# FútHoy — Complete Project Documentation

> **Spanish-Speaking Football News Portal**
> Repository: [github.com/ankur1touch/spanishwebsite](https://github.com/ankur1touch/spanishwebsite)
> Stack: **Next.js 15** · **TypeScript** · **Tailwind CSS** · **Redux Toolkit** · **Axios** · **next-intl**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack — What's Used & Why](#2-tech-stack--whats-used--why)
3. [Data Sources — Where Data Comes From](#3-data-sources--where-data-comes-from)
4. [Routing — How URLs Work](#4-routing--how-urls-work)
5. [Folder Structure & File Mapping](#5-folder-structure--file-mapping)
6. [Page-to-Component Mapping](#6-page-to-component-mapping)
7. [Data Flow Architecture](#7-data-flow-architecture)
8. [Redux State Management](#8-redux-state-management)
9. [API Routes (SSR-Safe)](#9-api-routes-ssr-safe)
10. [Environment Variables](#10-environment-variables)
11. [Design System (Colors & UI)](#11-design-system-colors--ui)
12. [Development & Build Commands](#12-development--build-commands)
13. [Known Limitations & Future Roadmap](#13-known-limitations--future-roadmap)
14. [Quick Reference — Which File to Edit](#14-quick-reference--which-file-to-edit)

---

## 1. Project Overview

| Item | Detail |
|------|--------|
| **Name** | FútHoy |
| **Type** | Production-quality Spanish football news portal (MARCA / AS-style layout) |
| **Default language** | Spanish (`es`) |
| **Secondary language** | English (`en`) |
| **Target audience** | Football fans across Spanish-speaking countries (Mexico, Colombia, Argentina, Spain, Peru) |
| **Data** | RSS aggregation + MDX articles + Football-Data.org API + local JSON country configs |
| **Build status** | Passing — 0 errors, 50 pages, 5 API routes (Next.js 15.5) |
| **Dev server** | `http://localhost:3000` |

**What this site delivers:**

- Homepage with hero story, side cards, latest news feed, highlights grid, and live sidebar widgets
- News listing with seven category filter tabs (All, La Liga, Champions, World Cup, Transfers, National Teams, Analysis)
- Full article detail pages built from MDX files
- Five country hub pages — one dynamic route covering Mexico, Colombia, Argentina, Spain, and Peru
- Dedicated World Cup hub page
- Match center showing live, recent, and upcoming matches grouped by competition
- Full La Liga standings table
- Auto-generated site RSS feed, sitemap, and `robots.txt`
- Two locales (Spanish default, English secondary) with locale-aware navigation

---

## 2. Tech Stack — What's Used & Why

### Core Framework

| Technology | Version | Where Used | Why |
|------------|---------|------------|-----|
| **Next.js** | 15.5.x | Entire `app/` folder | App Router, SSR/SSG, fast pages, Vercel-ready deployment |
| **React** | 19.x | All UI components | Industry standard, built-in with Next.js |
| **TypeScript** | 5.x | All `.ts` / `.tsx` files + `types/` domain models | Type safety end-to-end |

### Styling & UI

| Technology | Where Used | Why |
|------------|------------|-----|
| **Tailwind CSS** | `app/globals.css`, all components | Utility-first — MARCA-style red/yellow/navy design built fast |
| **PostCSS + Autoprefixer** | `postcss.config.js` | Tailwind compilation + browser compatibility |
| **tailwind-merge** | `lib/utils.ts` | Merge conflicting Tailwind classes cleanly |
| **clsx** | `lib/utils.ts` | Conditional class name helper |
| **Lucide React** | Icons throughout the app | Lightweight icon set |
| **Google Fonts** | Inter + Playfair Display | Body text + bold headlines (sports-news look) |

### State Management

| Technology | Files | Why |
|------------|-------|-----|
| **Redux Toolkit (RTK)** | `store/` + `store/features/` | Centralized global state with async thunks |
| **React-Redux** | All client components | `useSelector` / `useDispatch` hooks |
| **Immer** (built-in RTK) | Slice reducers | Immutable state updates with mutable-style code |

### HTTP & API

| Technology | Files | Why |
|------------|-------|-----|
| **Axios** | `lib/client.ts`, `lib/api/` | HTTP client with interceptors, timeouts, SSR-aware base URL |

### Internationalization

| Technology | Files | Why |
|------------|-------|-----|
| **next-intl** | `i18n/`, `messages/es.json`, `messages/en.json`, `middleware.ts` | Spanish default + English toggle without duplicating pages |

### Content & News

| Technology | Files | Why |
|------------|-------|-----|
| **MDX + gray-matter** | `content/articles/*.mdx`, `lib/mdx.ts` | Write articles in Git, version controlled |
| **next-mdx-remote** | `components/article/ArticleBody.tsx` | Render MDX to React |
| **rss-parser** | `lib/rss.ts` | Pull headlines from MARCA, AS, Mundo Deportivo, Olé |

### Live Football Data

| Technology | Files | Why |
|------------|-------|-----|
| **Football-Data.org API** | `lib/football-api.ts` | Free tier — La Liga standings, matches, top scorers |
| **Fallback static data** | Same file | Site still works when no API token is configured |

### Utilities

| Package | Use |
|---------|-----|
| `clsx` + `tailwind-merge` | `cn()` — safe class merging (`lib/utils.ts`) |
| In-memory TTL cache | `lib/memory-cache.ts` — protects external API quotas |
| `sharp` | Next.js image optimization for remote images |

### Image Config

| File | Purpose |
|------|---------|
| `next.config.mjs` | Allowed remote image domains (MARCA, AS, Mundo Deportivo, Olé, Football-Data crests, Unsplash) + permanent redirects |

---

## 3. Data Sources — Where Data Comes From

### Summary Table

| Data Type | Source | Lib File | API Route |
|-----------|--------|----------|-----------|
| **Original articles** | MDX files in `content/articles/` | `lib/mdx.ts` | `POST /api/news` (merged) |
| **External news** | RSS feeds (4 sites) | `lib/rss.ts` | `POST /api/news` (merged) |
| **Country-filtered news** | RSS + MDX + keyword match | `lib/rss.ts` + `data/countries.json` | `POST /api/country/[id]` |
| **La Liga standings** | Football-Data.org | `lib/football-api.ts` | `POST /api/rankings` |
| **Live matches** | Football-Data.org | `lib/football-api.ts` | `POST /api/matches` |
| **Top scorers** | Football-Data.org | `lib/football-api.ts` | `POST /api/rankings` |
| **Country list** | Local JSON | `data/countries.json` | `POST /api/countries` |
| **UI text** | Translation files | `messages/{es,en}.json` | — (via `next-intl`) |
| **Site RSS feed** | Generated from MDX | `lib/rss-feed.ts` | `/rss.xml` |
| **Sitemap** | Dynamic | `app/sitemap.ts` | `/sitemap.xml` |

### A) Original Articles (MDX)

```
content/articles/
├── mbappe-gol-olimpico-clasico.mdx
├── barca-bayern-champions-vuelta.mdx
├── vinicius-renueva-real-madrid-2030.mdx
└── ... (7 seed articles)
```

- Parsed by `gray-matter` (frontmatter) + `next-mdx-remote` (body)
- URL pattern: `/news/[slug]`
- Tags drive both filtering on `/news` and related-article suggestions

### B) External News (RSS Aggregation)

| Source | RSS URL | Default Tag |
|--------|---------|-------------|
| MARCA | marca.com Primera | La Liga |
| AS | as.com Primera | La Liga |
| Mundo Deportivo | mundodeportivo.com | La Liga |
| Olé | ole.com.ar Internacional | Champions |

**Flow:** `lib/rss.ts` runs four parallel fetches, deduplicates titles via `slugify`, auto-tags items based on title/category keywords, sorts by date. External items keep their original URL — clicks open the source site in a new tab.

### C) Football-Data.org

| Endpoint | Data | Cache TTL |
|----------|------|-----------|
| `/competitions/PD/standings` | La Liga table | 10 min |
| `/matches?dateFrom=...&dateTo=...` | Today / yesterday matches | 1 min |
| `/competitions/PD/scorers` | Top goal scorers | 60 min |

- API key: `.env.local` → `FOOTBALL_DATA_TOKEN`
- Free signup: [football-data.org](https://www.football-data.org/client/register)
- Without a key: fallback arrays in `lib/football-api.ts` keep the UI functional

### D) Countries Configuration (`data/countries.json`)

Single source of truth for the five country hub pages. Each entry contains:

```json
{
  "id": "mexico",
  "name": "México",
  "flag": "🇲🇽",
  "leagues": ["Liga MX"],
  "keywords": ["mexico", "tricolor", "liga mx", "tigres", "club américa", "..."],
  "description": "Coverage of Mexican football..."
}
```

`/api/country/[id]` filters the merged news feed by checking whether any keyword appears in the title, excerpt, or tag.

---

## 4. Routing — How URLs Work

### Routing Model: Next.js App Router + `[locale]`

All user-facing pages live under `app/[locale]/`. The `[locale]` segment is `es` (default — no URL prefix) or `en` (URL prefix `/en`). The `next-intl` middleware (`middleware.ts`) detects the locale on every request.

```
Request → middleware.ts (next-intl)
        → locale set (es | en)
        → app/[locale]/... page renders
```

### Complete URL Map

| URL (Spanish default) | URL (English) | Page File | What It Shows |
|----------------------|---------------|-----------|----------------|
| `/` | `/en` | `app/[locale]/page.tsx` | Homepage |
| `/news` | `/en/news` | `app/[locale]/news/page.tsx` | News listing + seven filter tabs |
| `/news/[slug]` | `/en/news/[slug]` | `app/[locale]/news/[slug]/page.tsx` | Full article detail (MDX) |
| `/world-cup` | `/en/world-cup` | `app/[locale]/world-cup/page.tsx` | World Cup hub |
| `/country/mexico` | `/en/country/mexico` | `app/[locale]/country/[id]/page.tsx` | Mexico hub |
| `/country/colombia` | `/en/country/colombia` | same | Colombia hub |
| `/country/argentina` | `/en/country/argentina` | same | Argentina hub |
| `/country/spain` | `/en/country/spain` | same | Spain hub (Real Madrid, Barça, Atlético, La Liga) |
| `/country/peru` | `/en/country/peru` | same | Peru hub |
| `/matches` | `/en/matches` | `app/[locale]/matches/page.tsx` | Live + recent matches |
| `/standings` | `/en/standings` | `app/[locale]/standings/page.tsx` | Full La Liga table |
| `/sobre-nosotros` | `/en/sobre-nosotros` | `app/[locale]/sobre-nosotros/page.tsx` | About |
| `/contacto` | `/en/contacto` | `app/[locale]/contacto/page.tsx` | Contact |
| `/privacidad` | `/en/privacidad` | `app/[locale]/privacidad/page.tsx` | Privacy policy |
| `/publicidad` | `/en/publicidad` | `app/[locale]/publicidad/page.tsx` | Advertising |

### API Routes

| URL | Method | Source File | Returns |
|-----|--------|-------------|---------|
| `/api/news` | POST | `app/api/news/route.ts` | Array of news items (RSS + MDX merged) |
| `/api/matches` | POST | `app/api/matches/route.ts` | Array of live / recent matches |
| `/api/rankings` | POST | `app/api/rankings/route.ts` | `{ standings, topScorers }` |
| `/api/countries` | POST | `app/api/countries/route.ts` | Array of country configs |
| `/api/country/[id]` | POST | `app/api/country/[id]/route.ts` | News filtered by country keywords |

### Routes Outside `[locale]`

| URL | File | Purpose |
|-----|------|---------|
| `/rss.xml` | `app/rss.xml/route.ts` | Site RSS feed (XML) |
| `/sitemap.xml` | `app/sitemap.ts` | SEO sitemap |
| `/robots.txt` | `app/robots.ts` | Search engine rules |
| `/icon.svg` | `app/icon.svg` | Browser favicon |

### Dynamic Routes Explained

```
app/[locale]/news/[slug]/page.tsx
         │            │
         │            └── Article slug from MDX frontmatter
         └── es | en

app/[locale]/country/[id]/page.tsx
         │             │
         │             └── mexico | colombia | argentina | spain | peru
         └── es | en
```

At build time, `generateStaticParams()` pre-renders 7 article slugs × 2 locales = 14 article pages and 5 countries × 2 locales = 10 country pages. Total: **50 static pages**.

### Permanent Redirects (`next.config.mjs`)

The following 308 redirects are configured so old URLs and SEO links keep working:

| Old URL | Redirects To |
|---------|-------------|
| `/noticias/[slug]` | `/news/[slug]` |
| `/mundial` | `/world-cup` |
| `/resultados` | `/matches` |
| `/clasificacion` | `/standings` |
| `/la-liga` | `/country/spain` |
| `/champions` | `/news` |
| `/transfers` | `/news` |
| `/analisis` | `/news` |
| `/equipos/[team]` | `/country/spain` |

Each entry has a matching `/en/...` variant.

---

## 5. Folder Structure & File Mapping

```
Spanish Football Website/
│
├── app/                              # Next.js App Router (pages & routes)
│   ├── [locale]/                     # Localized pages
│   │   ├── layout.tsx                # Root shell: StoreProvider + Header + Footer
│   │   ├── page.tsx                  # Homepage (server) → HomeNewsClient
│   │   ├── news/
│   │   │   ├── page.tsx              # /news listing
│   │   │   └── [slug]/page.tsx       # Article detail
│   │   ├── world-cup/page.tsx        # /world-cup
│   │   ├── country/[id]/page.tsx     # 5 country hubs
│   │   ├── matches/page.tsx          # Live scores
│   │   ├── standings/page.tsx        # Full table
│   │   ├── sobre-nosotros/page.tsx
│   │   ├── contacto/page.tsx
│   │   ├── privacidad/page.tsx
│   │   ├── publicidad/page.tsx
│   │   ├── error.tsx                 # Error boundary
│   │   └── not-found.tsx             # 404
│   │
│   ├── api/                          # SSR-safe POST API routes
│   │   ├── news/route.ts
│   │   ├── matches/route.ts
│   │   ├── rankings/route.ts
│   │   ├── countries/route.ts
│   │   └── country/[id]/route.ts
│   │
│   ├── globals.css
│   ├── rss.xml/route.ts
│   ├── sitemap.ts
│   ├── robots.ts
│   └── icon.svg
│
├── components/                       # Reusable UI components
│   ├── home/                         # HomeNewsClient, HeroCard, SideStoryCard,
│   │                                   NewsCard, HighlightVideoCard
│   ├── news/                         # NewsListingClient (with category tabs)
│   ├── country/                      # CountryHeader, CountryNewsClient
│   ├── matches/                      # MatchesClient, StandingsClient
│   ├── sidebar/                      # LiveScoresWidget, StandingsTable,
│   │                                   TopScorersWidget
│   ├── article/                      # ArticleHeader, ArticleBody, RelatedNews
│   ├── layout/                       # Header, Nav, MobileNav, Footer,
│   │                                   BreakingTicker, NewsletterCTA, Logo,
│   │                                   LocaleSwitcher, SearchButton
│   └── ui/                           # Badge, Button, Skeleton, Tabs,
│                                       ErrorState, EmptyState, Tag,
│                                       RelativeTime, HydrationSafeButton
│
├── content/articles/                 # Original article content (.mdx)
│
├── data/                             # Static configuration data
│   └── countries.json                # 5 countries: id, name, flag, leagues, keywords
│
├── store/                            # Redux Toolkit state management
│   ├── index.ts                      # configureStore with 4 reducers
│   ├── StoreProvider.tsx             # "use client" Redux <Provider>
│   ├── hooks.ts                      # useAppDispatch, useAppSelector
│   └── features/                     # Domain slices
│       ├── newsSlice.ts
│       ├── matchesSlice.ts
│       ├── rankingsSlice.ts
│       └── countriesSlice.ts
│
├── lib/                              # Business logic / utilities
│   ├── client.ts                     # Axios instance (base URL + interceptors)
│   ├── api/                          # Typed API helper functions
│   │   ├── news.ts
│   │   ├── matches.ts
│   │   ├── rankings.ts
│   │   └── countries.ts
│   ├── rss.ts                        # External RSS aggregator
│   ├── rss-feed.ts                   # Site RSS XML builder
│   ├── football-api.ts               # Football-Data.org client + fallbacks
│   ├── mdx.ts                        # Read MDX articles
│   ├── memory-cache.ts               # In-memory TTL cache
│   ├── dates.ts                      # SSR-safe date formatting
│   ├── types.ts                      # Re-exports from `types/`
│   └── utils.ts                      # cn(), slugify
│
├── types/                            # Shared TypeScript domain models
│   ├── news.ts                       # NewsItem, NewsTag, Article, AsyncStatus
│   ├── match.ts                      # LiveMatch, MatchStatus
│   ├── ranking.ts                    # StandingRow, TopScorer, RankingsPayload
│   ├── country.ts                    # Country, CountryId
│   └── index.ts                      # Barrel export
│
├── i18n/                             # next-intl configuration
│   ├── routing.ts                    # locales: es (default), en
│   ├── request.ts                    # Load messages per request
│   └── navigation.ts                 # Locale-aware Link / router helpers
│
├── messages/
│   ├── es.json                       # Spanish UI strings
│   └── en.json                       # English UI strings
│
├── middleware.ts                     # Locale detection (edge)
├── next.config.mjs                   # Image domains + permanent redirects
├── tailwind.config.ts                # Tailwind theme tokens
├── postcss.config.js
├── tsconfig.json
├── eslint.config.mjs
├── vercel.json                       # Vercel region: fra1
├── package.json
└── .env.example                      # Environment variable template
```

---

## 6. Page-to-Component Mapping

### Homepage (`app/[locale]/page.tsx`)

| Section | Component | Data Source |
|---------|-----------|-------------|
| Hero + side stories + latest news | `HomeNewsClient` (client) | Redux thunk `fetchNews` → `/api/news` → RSS + MDX |
| Highlights grid | `HighlightVideoCard` | Static array in `page.tsx` |
| Live scores sidebar | `LiveScoresWidget` (client) | Redux thunk `fetchMatches` → `/api/matches` |
| Standings (top 5) | `StandingsTable` (client) | Redux thunk `fetchRankings` → `/api/rankings` |
| Top scorers | `TopScorersWidget` (client) | Same slice as above |

### Every Page (via `app/[locale]/layout.tsx`)

| UI Part | Component | Data |
|---------|-----------|------|
| Redux Provider | `StoreProvider` | Wraps the entire tree |
| Red header + logo | `Header`, `Logo` | Static |
| Seven-tab navigation | `Nav` (+ `MobileNav`) | `messages/*.json` |
| Search button | `SearchButton` | UI only (search page is roadmap) |
| ES / EN toggle | `LocaleSwitcher` | `next-intl` router |
| Yellow breaking ticker | `BreakingTicker` | Server-fetched RSS top 6 |
| Newsletter bar | `NewsletterCTA` | Client form (no backend yet) |
| Footer | `Footer` | Static links |

### News Pages

| Page | Client Component | Behavior |
|------|------------------|---------|
| `/news` | `NewsListingClient` | Dispatch `fetchNews` → filter client-side by category tabs |
| `/news/[slug]` | `ArticleHeader`, `ArticleBody`, `RelatedNews` | Server component reads MDX directly, renders related articles |

News listing filter tabs:

- **All** — every article
- **La Liga** — Real Madrid, Barça, Atlético, La Liga keywords
- **Champions** — Champions / UEFA keywords
- **World Cup** — Mundial / Copa del Mundo
- **Transfers** — Fichaje keywords
- **National Teams** — La Roja, Albiceleste, Tricolor, Cafetero, Blanquirroja
- **Analysis** — Análisis keyword

### Country Page (`/country/[id]`)

| Part | Component | Data |
|------|-----------|------|
| Header banner (flag + leagues) | `CountryHeader` (server) | `data/countries.json` |
| Filtered news list | `CountryNewsClient` (client) | Redux thunk `fetchNewsByCountry(id)` → `/api/country/[id]` |

### World Cup Page (`/world-cup`)

| Part | Component | Data |
|------|-----------|------|
| Yellow hero banner | Inline server JSX | Static |
| Filtered news | `NewsListingClient initialFilter="worldCup"` | `/api/news` filtered to World Cup tag |

### Matches Page (`/matches`)

| Part | Component | Data |
|------|-----------|------|
| Matches grouped by competition | `MatchesClient` (client) | Redux thunk `fetchMatches` → `/api/matches` |

### Standings Page (`/standings`)

| Part | Component | Data |
|------|-----------|------|
| Full La Liga table | `StandingsClient` (client) | Redux thunk `fetchRankings` |

### News Card Click Behavior

| Article Type | Click |
|--------------|-------|
| Internal (MDX) | Opens `/news/[slug]` on FútHoy |
| External (RSS) | Opens MARCA / AS / etc. in a new tab |

---

## 7. Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         USER BROWSER                          │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│        middleware.ts (next-intl locale detection)             │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  app/[locale]/layout.tsx                                      │
│    StoreProvider wraps entire tree                            │
│    Header + BreakingTicker + <Page> + NewsletterCTA + Footer  │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
   ┌──────────────────────────────────────────────────┐
   │  Server Page (sets locale, renders client shell) │
   └──────────────────────┬───────────────────────────┘
                          │
                          ▼
   ┌──────────────────────────────────────────────────┐
   │  Client Components                                │
   │  (HomeNewsClient, NewsListingClient,              │
   │   CountryNewsClient, MatchesClient,               │
   │   StandingsClient, sidebar widgets)               │
   │                                                   │
   │  useAppDispatch() → dispatch(fetchNews())         │
   │  useAppSelector() → state.news.articles           │
   └──────────────────────┬───────────────────────────┘
                          │
                          ▼
   ┌──────────────────────────────────────────────────┐
   │  Redux Thunks (store/features/*)                  │
   │  fetchNews, fetchNewsByCountry, fetchMatches,     │
   │  fetchRankings, fetchCountries                    │
   └──────────────────────┬───────────────────────────┘
                          │  axiosClient.post('/api/...')
                          ▼
   ┌──────────────────────────────────────────────────┐
   │  POST API Routes (app/api/*)                      │
   └──────────────────────┬───────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   ┌──────────┐    ┌──────────┐     ┌────────────────┐
   │ lib/rss  │    │ lib/mdx  │     │ lib/football-  │
   │  (RSS    │    │ (MDX     │     │ api.ts         │
   │   feeds) │    │  files)  │     │ (+ fallback)   │
   └──────────┘    └──────────┘     └────────────────┘
        │                 │                 │
        └─────────────────┴─────────────────┘
                          │
                          ▼
              memory-cache.ts (TTL cache)
              React cache() (per-request dedupe)
```

**Key principle:** Client components never call backends directly. They `dispatch` a thunk → thunk calls the matching API route via Axios → response lands in the relevant Redux slice → component reads it via `useAppSelector`.

---

## 8. Redux State Management

### Store Configuration

`store/index.ts` wires four reducers into a single store:

```typescript
configureStore({
  reducer: {
    news: newsReducer,
    matches: matchesReducer,
    rankings: rankingsReducer,
    countries: countriesReducer,
  },
});
```

Typed exports: `AppStore`, `RootState`, `AppDispatch`.

### Standard Slice Pattern

Every slice follows the same async-status shape:

```typescript
{
  // data fields specific to the domain
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  error: string | null
}
```

### Slices

| Slice | File | State Shape | Thunks |
|-------|------|-------------|--------|
| `news` | `store/features/newsSlice.ts` | `{ articles, byCountry, status, countryStatus, error }` | `fetchNews`, `fetchNewsByCategory`, `fetchNewsByCountry` |
| `matches` | `store/features/matchesSlice.ts` | `{ matches, status, error }` | `fetchMatches` |
| `rankings` | `store/features/rankingsSlice.ts` | `{ standings, topScorers, status, error }` | `fetchRankings` |
| `countries` | `store/features/countriesSlice.ts` | `{ countries, selected, status, error }` | `fetchCountries`, `selectCountry` |

### Async Thunk Example

```typescript
export const fetchNews = createAsyncThunk('news/fetchAll', async () => {
  const { data } = await axiosClient.post('/api/news');
  return data as NewsItem[];
});
```

Each thunk handles `pending`, `fulfilled`, and `rejected` cases in the slice's `extraReducers` block, updating `status` and `error` accordingly.

### StoreProvider

`store/StoreProvider.tsx` is a `"use client"` component that uses `useRef` to ensure a single store instance per browser (safe under React Strict Mode). It wraps the children inside `app/[locale]/layout.tsx`.

### Typed Hooks

```typescript
// store/hooks.ts
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

These are used everywhere instead of the raw `useDispatch` / `useSelector` for full type inference.

---

## 9. API Routes (SSR-Safe)

All API routes use the `POST` method and wrap the underlying lib functions. POST avoids static caching issues and lets the routes accept optional filter bodies.

| Route | File | What It Returns | Cache-Control |
|-------|------|-----------------|---------------|
| `POST /api/news` | `app/api/news/route.ts` | RSS + MDX merged, optional `{ category }` filter | `s-maxage=300, swr=600` |
| `POST /api/matches` | `app/api/matches/route.ts` | Array of live / recent matches | `s-maxage=60, swr=120` |
| `POST /api/rankings` | `app/api/rankings/route.ts` | `{ standings, topScorers }` | `s-maxage=600, swr=1800` |
| `POST /api/countries` | `app/api/countries/route.ts` | Array of country configs | `s-maxage=3600` |
| `POST /api/country/[id]` | `app/api/country/[id]/route.ts` | News filtered by country keywords | `s-maxage=300, swr=600` |

### Country Filter Logic

```typescript
function matchesCountry(item: NewsItem, country: Country) {
  const haystack = `${item.title} ${item.excerpt ?? ''} ${String(item.tag ?? '')}`.toLowerCase();
  return country.keywords.some(k => haystack.includes(k.toLowerCase()));
}
```

### Axios Client (`lib/client.ts`)

```typescript
const baseURL = typeof window !== 'undefined'
  ? ''                                  // browser: relative URLs
  : process.env.NEXT_PUBLIC_SITE_URL    // server: absolute
    || `http://localhost:${PORT || 3000}`;

axiosClient = axios.create({ baseURL, timeout: 15000 });
```

A response interceptor logs failures during development. All API helpers (`lib/api/*`) reuse this single client.

### Swapping to a Real Backend

To swap any data source for a real third-party API: open `app/api/[route]/route.ts` and replace the existing `getAggregatedNews()` / `getLiveMatches()` / etc. call with a real `fetch()`. No component, slice, or thunk changes are required.

---

## 10. Environment Variables

| Variable | Required? | Purpose | Example |
|----------|-----------|---------|---------|
| `FOOTBALL_DATA_TOKEN` | Optional | Live scores, standings, top scorers | Get from football-data.org |
| `NEXT_PUBLIC_SITE_URL` | Recommended | SEO, RSS, OpenGraph URLs, Axios base URL on the server | `https://your-site.vercel.app` |

**Local setup:**

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

Never commit `.env.local` to git.

---

## 11. Design System (Colors & UI)

### Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| **Brand Red** | `#B91C1C` | Header, accents, primary buttons, tags |
| **Brand Yellow** | `#FCD34D` | Breaking news ticker, World Cup banner |
| **Brand Navy** | `#0F172A` | Hero cards, country headers, dark sections |
| **Surface** | `#F8FAFC` | Page background |

### Typography

- **Body:** Inter (Google Fonts)
- **Display headings:** Playfair Display (bold, sports-news style)

### Reusable UI Primitives (`components/ui/`)

| Component | File | Purpose |
|-----------|------|---------|
| `Badge` | `Badge.tsx` | Status labels (Live, Featured, category) — variants: red, yellow, navy, outline, live, muted |
| `Button` | `Button.tsx` | Primary / secondary / outline / ghost / danger × sm/md/lg |
| `Skeleton`, `SkeletonCard`, `SkeletonList` | `Skeleton.tsx` | Loading placeholders |
| `Tabs` | `Tabs.tsx` | Filter tab groups (news categories) |
| `ErrorState` | `ErrorState.tsx` | Friendly error with retry button |
| `EmptyState` | `EmptyState.tsx` | Empty-list message |
| `Tag` | `Tag.tsx` | Colored news-tag pill |
| `RelativeTime` | `RelativeTime.tsx` | Client-only relative time (avoids hydration mismatch) |
| `HydrationSafeButton` | `HydrationSafeButton.tsx` | Button wrapper with `suppressHydrationWarning` |

### Loading / Empty / Error States

Every client component that fetches data handles all four async states explicitly:

- **Idle:** Initial render — `useEffect` dispatches the thunk
- **Loading:** `Skeleton` placeholders (no blank screen)
- **Succeeded + empty:** `EmptyState` with a friendly message
- **Failed:** `ErrorState` with a Retry button that re-dispatches the thunk

Components following this pattern: `HomeNewsClient`, `NewsListingClient`, `CountryNewsClient`, `MatchesClient`, `StandingsClient`, `LiveScoresWidget`, `StandingsTable`, `TopScorersWidget`. The localized strings live under the `states` namespace in `messages/{es,en}.json`.

---

## 12. Development & Build Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Run production build locally
npm run start

# Lint check
npm run lint
```

### Image Domains (`next.config.mjs`)

Remote images are allowed from:

- `**.marca.com`
- `**.as.com`
- `**.mundodeportivo.com`
- `**.elpais.com`
- `**.ole.com.ar`
- `crests.football-data.org`
- `media.api-sports.io`
- `images.unsplash.com`
- `i.imgur.com`

### Deployment (Vercel)

1. Push to GitHub: `ankur1touch/spanishwebsite`
2. Vercel → Import project (auto-detects Next.js)
3. Add environment variables: `FOOTBALL_DATA_TOKEN`, `NEXT_PUBLIC_SITE_URL`
4. Deploy — `vercel.json` pins the region to `fra1` (Frankfurt) for European users
5. Site goes live with ISR enabled per page (`revalidate` values from 60 s to 600 s)

### Build Output

```
Route (app)                          Size   First Load JS  Revalidate
○ /[locale]                       12.3 kB        173 kB         5m
● /[locale]/country/[id]          4.06 kB        161 kB         5m  (× 5 countries × 2 locales)
● /[locale]/news                    128 B        162 kB         5m
● /[locale]/news/[slug]           2.15 kB        115 kB        10m  (× 7 articles × 2 locales)
● /[locale]/world-cup               128 B        162 kB         5m
● /[locale]/matches               3.05 kB        160 kB         1m
● /[locale]/standings             2.53 kB        159 kB        10m
ƒ /api/news, /matches, /rankings, /countries, /country/[id]
○ /rss.xml, /sitemap.xml, /robots.txt

50 pages · 5 API routes · 0 lint errors · build passes
```

---

## 13. Known Limitations & Future Roadmap

### Current Limitations

| Issue | Detail |
|-------|--------|
| **Limited original content** | Only 7 seed MDX articles — expand `content/articles/` to grow the internal archive |
| **External news depends on third-party RSS** | If MARCA / AS / Mundo Deportivo / Olé change their feeds or rate-limit, the homepage may show fewer items until cache refreshes |
| **Country keywords are simple substring matches** | `data/countries.json` uses lowercased substring matches — sophisticated NLP categorization is not implemented |
| **No authentication** | No login / user accounts / saved-article functionality |
| **No real-time scores** | Live matches refresh on a 60-second cache, not via WebSocket |
| **Search not implemented** | The header search icon is a placeholder — there is no `/search` page yet |
| **Highlights are static** | Three sample highlight cards on the homepage are hard-coded; no YouTube / video provider integration |

### Future Roadmap

1. **Search page** — `/search` with full-text search across MDX and aggregated RSS items
2. **Authentication** — User accounts with saved articles and per-country preferences
3. **Real-time match updates** — Replace polling with a WebSocket feed for live scores
4. **More country hubs** — Add Chile, Uruguay, Ecuador, Venezuela by extending `data/countries.json` and `NAV_LINKS`
5. **Video highlights** — Integrate a video provider (YouTube embeds or custom CDN)
6. **Newsletter backend** — Wire `NewsletterCTA` to a real ESP (Mailchimp, Resend, etc.)
7. **More languages** — Extend `next-intl` beyond Spanish / English (e.g. Portuguese for Brazilian audiences)
8. **Editor CMS adapter** — Optional MDX editor UI for non-developer contributors

---

## 14. Quick Reference — Which File to Edit

| If you want to change… | Edit This File |
|------------------------|----------------|
| Header navigation links | `components/layout/Nav.tsx` (mobile menu reads the same `NAV_LINKS`) |
| Footer links | `components/layout/Footer.tsx` |
| Colors / fonts | `tailwind.config.ts`, `app/globals.css` |
| Spanish UI text | `messages/es.json` |
| English UI text | `messages/en.json` |
| Homepage hero / latest news | `components/home/HomeNewsClient.tsx` |
| Live scores widget | `components/sidebar/LiveScoresWidget.tsx` |
| Standings sidebar | `components/sidebar/StandingsTable.tsx` |
| Top scorers sidebar | `components/sidebar/TopScorersWidget.tsx` |
| News listing filters | `components/news/NewsListingClient.tsx` → `FILTER_MATCHERS` |
| Country hub design | `components/country/CountryHeader.tsx`, `CountryNewsClient.tsx` |
| Matches page | `components/matches/MatchesClient.tsx` |
| Standings page | `components/matches/StandingsClient.tsx` |
| RSS feed sources | `lib/rss.ts` → `FEED_SOURCES` |
| Football-Data integration | `lib/football-api.ts` |
| Country list / keywords | `data/countries.json` |
| Add a new article | `content/articles/*.mdx` |
| Add a new page | `app/[locale]/your-page/page.tsx` |
| API endpoint logic | `app/api/[domain]/route.ts` |
| Redux slice (state shape) | `store/features/[domain]Slice.ts` |
| TypeScript domain types | `types/[domain].ts` |
| Axios client config | `lib/client.ts` |
| Class-name utility | `lib/utils.ts` |
| Allowed image domains | `next.config.mjs` |
| Permanent URL redirects | `next.config.mjs` → `redirects()` |
| Site RSS output format | `lib/rss-feed.ts` |
| Sitemap entries | `app/sitemap.ts` |

---

## Design Reference

The visual design follows the classic Spanish sports-news look popularized by MARCA and AS:

- **Header:** Brand-red bar with white logo and primary nav, plus a yellow breaking-news ticker
- **Hero:** Dark navy card with image overlay, exclusive badge, and Playfair Display headline
- **News cards:** Clean white cards with image thumbnail, category tag, headline, and timestamp
- **Country pages:** Full-width navy gradient header with the country flag and league badges
- **World Cup page:** Amber-gold gradient hero echoing FIFA's tournament branding
- **Sidebar widgets:** Compact white cards with live status pips and Tailwind tabular numerals
- **Typography:** Inter for body text, Playfair Display for headlines — tight, sports-news style

---

**Document version:** 2.0
**Project:** FútHoy (`spanishwebsite`)
**Last updated:** May 2026

*Share this document with any developer, client, or reviewer — the complete technical picture of the project in one place.*
