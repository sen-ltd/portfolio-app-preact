import type { Lang } from './types';

export const MESSAGES: Record<Lang, {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  categoryLabel: string;
  stackLabel: string;
  stageLabel: string;
  sortLabel: string;
  sortNewest: string;
  sortOldest: string;
  sortNumber: string;
  sortName: string;
  allLabel: string;
  noResults: string;
  totalCount: (n: number) => string;
  filteredCount: (shown: number, total: number) => string;
  githubLabel: string;
  demoLabel: string;
  articlesLabel: string;
  testsLabel: (n: number) => string;
  langLabel: string;
  loadingLabel: string;
  errorLabel: string;
  lastUpdated: (iso: string) => string;
  homeLabel: string;
  framework: string;
}> = {
  ja: {
    title: 'SEN Portfolio',
    subtitle: 'SEN 合同会社の公開作品集（Preact 実装）',
    searchPlaceholder: '名前やピッチで検索',
    categoryLabel: 'カテゴリ',
    stackLabel: 'スタック',
    stageLabel: 'ステージ',
    sortLabel: '並び順',
    sortNewest: '新しい順',
    sortOldest: '古い順',
    sortNumber: '番号順',
    sortName: '名前順',
    allLabel: 'すべて',
    noResults: '該当する作品がありません',
    totalCount: (n) => `全 ${n} 件`,
    filteredCount: (shown, total) => `${shown} / ${total} 件`,
    githubLabel: 'GitHub',
    demoLabel: 'Demo',
    articlesLabel: '記事',
    testsLabel: (n) => `${n} tests`,
    langLabel: '言語',
    loadingLabel: '読み込み中…',
    errorLabel: 'データの読み込みに失敗しました',
    lastUpdated: (iso) => `最終更新: ${iso.slice(0, 10)}`,
    homeLabel: 'SEN ホームへ',
    framework: 'Preact 10 + TypeScript + Vite',
  },
  en: {
    title: 'SEN Portfolio',
    subtitle: "SEN LLC's open-source portfolio (Preact implementation)",
    searchPlaceholder: 'Search by name or pitch',
    categoryLabel: 'Category',
    stackLabel: 'Stack',
    stageLabel: 'Stage',
    sortLabel: 'Sort',
    sortNewest: 'Newest',
    sortOldest: 'Oldest',
    sortNumber: 'By number',
    sortName: 'By name',
    allLabel: 'All',
    noResults: 'No matching entries',
    totalCount: (n) => `${n} total`,
    filteredCount: (shown, total) => `${shown} / ${total}`,
    githubLabel: 'GitHub',
    demoLabel: 'Demo',
    articlesLabel: 'Articles',
    testsLabel: (n) => `${n} tests`,
    langLabel: 'Language',
    loadingLabel: 'Loading…',
    errorLabel: 'Failed to load portfolio data',
    lastUpdated: (iso) => `Updated: ${iso.slice(0, 10)}`,
    homeLabel: '← SEN Home',
    framework: 'Preact 10 + TypeScript + Vite',
  },
};

export function detectDefaultLang(): Lang {
  if (typeof navigator !== 'undefined' && navigator.language?.startsWith('ja')) return 'ja';
  return 'en';
}
