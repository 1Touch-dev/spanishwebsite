# FútHoy — Spanish Football News Portal

A modern Spanish football (fútbol) news portal built with Next.js 15, focused on La Liga, Champions League, and Spanish-speaking football audiences.

## Documentation

**Full project guide (structure, stack, patterns, features, API setup):** [`PROJECT_GUIDE.md`](PROJECT_GUIDE.md)

Also see [`CODEBASE_OVERVIEW.md`](CODEBASE_OVERVIEW.md) for a shorter reference.

## Stack

- **Next.js 15** (App Router, RSC, ISR)
- **TypeScript** (strict)
- **Tailwind CSS** v3 + **Redux Toolkit**
- **next-intl** for Spanish/English i18n
- **rss-parser** for aggregating MARCA, AS, Mundo Deportivo, Olé
- **next-mdx-remote** for original articles
- **API-Football CMS proxy** for live scores, standings, match/player/team detail (see `PROJECT_GUIDE.md`)

## Quick Start

```bash
npm install
cp .env.example .env.local
# Optional: FOOTBALL_API_BASE_URL, FOOTBALL_API_SEASON, FOOTBALL_DATA_TOKEN, NEXT_PUBLIC_SITE_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Writing Articles

Create `.mdx` files in `content/articles/`:

```mdx
---
title: "Mbappé anota un gol olímpico en el Clásico"
slug: "mbappe-gol-olimpico-clasico"
date: "2026-05-19"
author: "Carlos Jiménez"
tag: "La Liga"
image: "/images/articles/mbappe-clasico.jpg"
excerpt: "El delantero francés decidió el encuentro con un golazo de córner directo."
exclusive: true
---

Article body in **MDX**. You can use components, images, code, etc.
```

## Structure

- `app/[locale]/` — localized pages (es default)
- `components/` — UI components organized by purpose
- `lib/` — RSS, football API, MDX utilities
- `content/articles/` — original articles (MDX)
- `messages/` — i18n translations

## Deployment

### AWS Amplify (recommended)

1. Push this repo to GitHub and open [AWS Amplify Console](https://console.aws.amazon.com/amplify/).
2. **Create new app → Host web app** → connect `ankur1touch/spanishwebsite`, branch `main`.
3. Amplify auto-detects **Next.js SSR**; `amplify.yml` in the repo root defines the build.
4. Under **Environment variables**, set at minimum:

   | Variable | Example |
   |----------|---------|
   | `NEXT_PUBLIC_SITE_URL` | `https://main.dxxxxxxxx.amplifyapp.com` (or your custom domain) |
   | `FOOTBALL_API_SEASON` | `2025` |
   | `FOOTBALL_DATA_TOKEN` | *(optional fallback)* |

5. Save and deploy. Every push to `main` triggers a new build.

### Vercel

```bash
vercel
```

Set `FOOTBALL_DATA_TOKEN` and `NEXT_PUBLIC_SITE_URL` in Vercel project settings.

## Legal

RSS items are aggregated headlines that link out to source sites (MARCA, AS, Mundo Deportivo, Olé) per fair-use / standard RSS practice. Only original MDX articles are hosted as full content.
