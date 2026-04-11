// Types for the SEN portfolio data. These mirror data/schema.json and are
// the single source of truth consumed by sen.ltd/portfolio/ and every
// mini-app rendering of the portfolio.

export type Lang = 'ja' | 'en';

export type LocalizedText = {
  ja: string;
  en: string;
};

export type StageId =
  | 'planned'
  | 'dev'
  | 'published'
  | 'articled'
  | 'listed'
  | 'done';

export type Article = {
  platform: 'zenn' | 'devto' | 'note' | 'qiita' | 'medium';
  url: string;
  lang: Lang;
};

export type Entry = {
  slug: string;
  number: number;
  name: LocalizedText;
  pitch: LocalizedText;
  stage: StageId;
  category: string;
  tech: string[];
  tags?: string[];
  github: string | null;
  demo: string | null;
  image: string | null;
  articles: Article[];
  testCount?: number;
  createdAt: string;
};

export type Category = {
  id: string;
  name: LocalizedText;
};

export type Stack = {
  id: string;
  name: string;
  color: string;
};

export type Stage = {
  id: StageId;
  name: LocalizedText;
  icon: string;
};

export type PortfolioData = {
  version: string;
  updatedAt: string;
  entries: Entry[];
  categories: Category[];
  stacks: Stack[];
  stages: Stage[];
};
