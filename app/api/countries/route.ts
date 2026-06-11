import { NextResponse } from 'next/server';
import countriesData from '@/data/countries.json';
import type { Country } from '@/types';

export const runtime = 'nodejs';

const countries = countriesData as Country[];

export async function POST() {
  return NextResponse.json(countries, {
    headers: { 'Cache-Control': 'public, s-maxage=3600' },
  });
}

export async function GET() {
  return NextResponse.json(countries);
}
// my routes