// Data-fetching layer. In production the URL is always '/portfolio/data.json'
// (same origin as the landing page). In dev we fall back to the local copy
// under ../data/entries.json so the app works offline without a deployed
// data file.

import type { PortfolioData } from './types';

const PROD_URL = '/portfolio/data.json';
const DEV_URL = import.meta.env.DEV ? '/data.json' : PROD_URL;

export async function loadPortfolioData(): Promise<PortfolioData> {
  const url = import.meta.env.DEV ? DEV_URL : PROD_URL;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch portfolio data: ${res.status}`);
  }
  const raw = (await res.json()) as unknown;
  assertPortfolioData(raw);
  return raw;
}

function assertPortfolioData(raw: unknown): asserts raw is PortfolioData {
  if (typeof raw !== 'object' || raw === null) throw new Error('invalid data: not an object');
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.entries)) throw new Error('invalid data: entries missing');
  if (!Array.isArray(obj.categories)) throw new Error('invalid data: categories missing');
  if (!Array.isArray(obj.stacks)) throw new Error('invalid data: stacks missing');
  if (!Array.isArray(obj.stages)) throw new Error('invalid data: stages missing');
}
