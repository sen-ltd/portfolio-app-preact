// Pure filter / sort helpers. Kept outside of React components so they
// can be unit-tested with vitest and reused in other framework ports.

import type { Entry, Lang } from './types';

export type SortKey = 'newest' | 'oldest' | 'number' | 'name';

export type FilterState = {
  query: string;
  category: string; // 'all' or category id
  stack: string;    // 'all' or stack id
  stage: string;    // 'all' or stage id
  sort: SortKey;
};

export function matchesQuery(entry: Entry, query: string, lang: Lang): boolean {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (entry.slug.toLowerCase().includes(q)) return true;
  if (entry.name[lang].toLowerCase().includes(q)) return true;
  if (entry.name.ja.toLowerCase().includes(q)) return true;
  if (entry.name.en.toLowerCase().includes(q)) return true;
  if (entry.pitch[lang].toLowerCase().includes(q)) return true;
  if ((entry.tags ?? []).some((t) => t.toLowerCase().includes(q))) return true;
  return false;
}

export function filterAndSort(entries: Entry[], state: FilterState, lang: Lang): Entry[] {
  const filtered = entries.filter((e) => {
    if (state.category !== 'all' && e.category !== state.category) return false;
    if (state.stack !== 'all' && !e.tech.includes(state.stack)) return false;
    if (state.stage !== 'all' && e.stage !== state.stage) return false;
    if (!matchesQuery(e, state.query, lang)) return false;
    return true;
  });
  return sortEntries(filtered, state.sort, lang);
}

export function sortEntries(entries: Entry[], sort: SortKey, lang: Lang): Entry[] {
  const copy = entries.slice();
  switch (sort) {
    case 'newest':
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.number - a.number);
    case 'oldest':
      return copy.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.number - b.number);
    case 'number':
      return copy.sort((a, b) => a.number - b.number);
    case 'name':
      return copy.sort((a, b) => a.name[lang].localeCompare(b.name[lang]));
  }
}
