import { describe, test, expect } from 'vitest';
import { filterAndSort, matchesQuery, sortEntries, type FilterState } from '../src/filter';
import type { Entry } from '../src/types';

function makeEntry(partial: Partial<Entry>): Entry {
  return {
    slug: 'slug',
    number: 1,
    name: { ja: '名前', en: 'Name' },
    pitch: { ja: 'ピッチ', en: 'Pitch' },
    stage: 'dev',
    category: 'dev-tool',
    tech: ['vanilla-js'],
    tags: [],
    github: null,
    demo: null,
    image: null,
    articles: [],
    createdAt: '2026-01-01',
    ...partial,
  };
}

describe('matchesQuery', () => {
  test('empty query matches everything', () => {
    expect(matchesQuery(makeEntry({}), '', 'en')).toBe(true);
    expect(matchesQuery(makeEntry({}), '   ', 'en')).toBe(true);
  });

  test('matches slug', () => {
    expect(matchesQuery(makeEntry({ slug: 'cron-tz-viewer' }), 'cron', 'en')).toBe(true);
  });

  test('matches English name', () => {
    expect(matchesQuery(makeEntry({ name: { ja: '時計', en: 'Clock' } }), 'clock', 'en')).toBe(true);
  });

  test('matches Japanese name even in en mode', () => {
    expect(matchesQuery(makeEntry({ name: { ja: '時計', en: 'Clock' } }), '時計', 'en')).toBe(true);
  });

  test('matches tags', () => {
    expect(matchesQuery(makeEntry({ tags: ['cron', 'timezone'] }), 'timezone', 'en')).toBe(true);
  });

  test('non-matching returns false', () => {
    expect(matchesQuery(makeEntry({}), 'zzzzz', 'en')).toBe(false);
  });
});

describe('filterAndSort', () => {
  const entries: Entry[] = [
    makeEntry({ slug: 'a', number: 1, category: 'dev-tool', createdAt: '2026-01-01', name: { ja: 'A', en: 'A' } }),
    makeEntry({ slug: 'b', number: 2, category: 'calc', createdAt: '2026-02-01', name: { ja: 'B', en: 'B' } }),
    makeEntry({ slug: 'c', number: 3, category: 'dev-tool', tech: ['react'], createdAt: '2026-03-01', name: { ja: 'C', en: 'C' } }),
  ];

  test('all filter', () => {
    const state: FilterState = { query: '', category: 'all', stack: 'all', stage: 'all', sort: 'number' };
    expect(filterAndSort(entries, state, 'en')).toHaveLength(3);
  });

  test('category filter', () => {
    const state: FilterState = { query: '', category: 'calc', stack: 'all', stage: 'all', sort: 'number' };
    const r = filterAndSort(entries, state, 'en');
    expect(r).toHaveLength(1);
    expect(r[0].slug).toBe('b');
  });

  test('stack filter', () => {
    const state: FilterState = { query: '', category: 'all', stack: 'react', stage: 'all', sort: 'number' };
    const r = filterAndSort(entries, state, 'en');
    expect(r).toHaveLength(1);
    expect(r[0].slug).toBe('c');
  });

  test('combined filters', () => {
    const state: FilterState = { query: '', category: 'dev-tool', stack: 'vanilla-js', stage: 'all', sort: 'number' };
    const r = filterAndSort(entries, state, 'en');
    expect(r).toHaveLength(1);
    expect(r[0].slug).toBe('a');
  });
});

describe('sortEntries', () => {
  const entries: Entry[] = [
    makeEntry({ slug: 'a', number: 2, createdAt: '2026-01-01', name: { ja: 'B', en: 'B' } }),
    makeEntry({ slug: 'b', number: 1, createdAt: '2026-03-01', name: { ja: 'A', en: 'A' } }),
    makeEntry({ slug: 'c', number: 3, createdAt: '2026-02-01', name: { ja: 'C', en: 'C' } }),
  ];

  test('sort by number', () => {
    const r = sortEntries(entries, 'number', 'en');
    expect(r.map((e) => e.slug)).toEqual(['b', 'a', 'c']);
  });

  test('sort by newest', () => {
    const r = sortEntries(entries, 'newest', 'en');
    expect(r.map((e) => e.slug)).toEqual(['b', 'c', 'a']);
  });

  test('sort by oldest', () => {
    const r = sortEntries(entries, 'oldest', 'en');
    expect(r.map((e) => e.slug)).toEqual(['a', 'c', 'b']);
  });

  test('sort by name', () => {
    const r = sortEntries(entries, 'name', 'en');
    expect(r.map((e) => e.slug)).toEqual(['b', 'a', 'c']); // A=b, B=a, C=c
  });
});
