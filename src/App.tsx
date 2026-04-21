import { useEffect, useMemo, useState } from 'preact/hooks';
import type { PortfolioData, Entry, Lang } from './types';
import { loadPortfolioData } from './data';
import { filterAndSort, type FilterState, type SortKey } from './filter';
import { MESSAGES, detectDefaultLang } from './i18n';
import { GitHubIcon, XIcon, QiitaIcon, DevToIcon } from './icons';

type Status =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: PortfolioData };

export function App() {
  const [status, setStatus] = useState<Status>({ kind: 'loading' });
  const [lang, setLang] = useState<Lang>(() => readLangFromQuery() ?? detectDefaultLang());
  const [filter, setFilter] = useState<FilterState>(() => readQuery());

  useEffect(() => {
    let cancelled = false;
    loadPortfolioData()
      .then((data) => {
        if (!cancelled) setStatus({ kind: 'ready', data });
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setStatus({ kind: 'error', message: e instanceof Error ? e.message : String(e) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    writeQuery(filter, lang);
  }, [filter, lang]);

  const m = MESSAGES[lang];

  if (status.kind === 'loading') {
    return <LoadingView message={m.loadingLabel} />;
  }
  if (status.kind === 'error') {
    return <ErrorView message={`${m.errorLabel}: ${status.message}`} />;
  }

  return (
    <Ready data={status.data} lang={lang} setLang={setLang} filter={filter} setFilter={setFilter} />
  );
}

function LoadingView({ message }: { message: string }) {
  return <div className="state state-loading">{message}</div>;
}

function ErrorView({ message }: { message: string }) {
  return <div className="state state-error">{message}</div>;
}

function Ready({
  data,
  lang,
  setLang,
  filter,
  setFilter,
}: {
  data: PortfolioData;
  lang: Lang;
  setLang: (l: Lang) => void;
  filter: FilterState;
  setFilter: (f: FilterState) => void;
}) {
  const m = MESSAGES[lang];
  const visible = useMemo(
    () => filterAndSort(data.entries, filter, lang),
    [data.entries, filter, lang]
  );
  const stackMap = useMemo(() => new Map(data.stacks.map((s) => [s.id, s])), [data.stacks]);
  const stageMap = useMemo(() => new Map(data.stages.map((s) => [s.id, s])), [data.stages]);
  const categoryMap = useMemo(
    () => new Map(data.categories.map((c) => [c.id, c])),
    [data.categories]
  );

  return (
    <>
      <header className="site-header">
        <div className="header-top">
          <a className="home-link" href="/">
            {m.homeLabel}
          </a>
          <div className="lang-switch">
            <label>{m.langLabel}</label>
            <select value={lang} onChange={(e) => setLang((e.target as HTMLSelectElement).value as Lang)}>
              <option value="ja">JA</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
        <h1>{m.title}</h1>
        <p className="subtitle">{m.subtitle}</p>
        <p className="meta">
          {m.totalCount(data.entries.length)}　·　{m.lastUpdated(data.updatedAt)}
        </p>
      </header>

      <main>
        <section className="controls">
          <input
            type="text"
            className="search"
            placeholder={m.searchPlaceholder}
            value={filter.query}
            onInput={(e) => setFilter({ ...filter, query: (e.target as HTMLInputElement).value })}
          />

          <div className="filters">
            <Select
              label={m.categoryLabel}
              value={filter.category}
              onChange={(v) => setFilter({ ...filter, category: v })}
              options={[
                { value: 'all', label: m.allLabel },
                ...data.categories.map((c) => ({ value: c.id, label: c.name[lang] })),
              ]}
            />
            <Select
              label={m.stackLabel}
              value={filter.stack}
              onChange={(v) => setFilter({ ...filter, stack: v })}
              options={[
                { value: 'all', label: m.allLabel },
                ...data.stacks.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
            <Select
              label={m.stageLabel}
              value={filter.stage}
              onChange={(v) => setFilter({ ...filter, stage: v })}
              options={[
                { value: 'all', label: m.allLabel },
                ...data.stages.map((s) => ({ value: s.id, label: `${s.icon} ${s.name[lang]}` })),
              ]}
            />
            <Select
              label={m.sortLabel}
              value={filter.sort}
              onChange={(v) => setFilter({ ...filter, sort: v as SortKey })}
              options={[
                { value: 'newest', label: m.sortNewest },
                { value: 'oldest', label: m.sortOldest },
                { value: 'number', label: m.sortNumber },
                { value: 'name', label: m.sortName },
              ]}
            />
          </div>

          <div className="result-count">{m.filteredCount(visible.length, data.entries.length)}</div>
        </section>

        {visible.length === 0 ? (
          <p className="empty">{m.noResults}</p>
        ) : (
          <section className="grid">
            {visible.map((entry) => (
              <EntryCard
                key={entry.slug}
                entry={entry}
                lang={lang}
                stackMap={stackMap}
                stageMap={stageMap}
                categoryMap={categoryMap}
              />
            ))}
          </section>
        )}
      </main>

      <footer className="site-footer">
        <span>SEN 合同会社 · Preact (Vite + TypeScript) implementation · entry 030</span>
      </footer>
    </>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="select-wrap">
      <span className="select-label">{label}</span>
      <select value={value} onChange={(e) => onChange((e.target as HTMLSelectElement).value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EntryCard({
  entry,
  lang,
  stackMap,
  stageMap,
  categoryMap,
}: {
  entry: Entry;
  lang: Lang;
  stackMap: Map<string, { id: string; name: string; color: string }>;
  stageMap: Map<string, { id: string; icon: string; name: { ja: string; en: string } }>;
  categoryMap: Map<string, { id: string; name: { ja: string; en: string } }>;
}) {
  const m = MESSAGES[lang];
  const stage = stageMap.get(entry.stage);
  const category = categoryMap.get(entry.category);

  return (
    <article className="card">
      <div className="card-head">
        <span className="entry-number">#{String(entry.number).padStart(3, '0')}</span>
        {stage && (
          <span className="stage-badge" title={stage.name[lang]}>
            {stage.icon} {stage.name[lang]}
          </span>
        )}
      </div>

      <h2 className="entry-name">{entry.name[lang]}</h2>

      {category && <div className="category">{category.name[lang]}</div>}

      <p className="pitch">{entry.pitch[lang]}</p>

      <div className="tech-row">
        {entry.tech.map((techId) => {
          const stack = stackMap.get(techId);
          if (!stack) return null;
          return (
            <span key={techId} className="tech-chip" style={{ borderLeftColor: stack.color }}>
              {stack.name}
            </span>
          );
        })}
      </div>

      <div className="actions">
        {entry.demo && (
          <a href={entry.demo} className="action-btn primary" target="_blank" rel="noopener">
            ↗ {m.demoLabel}
          </a>
        )}
        <IconLinks entry={entry} lang={lang} />
        {entry.testCount !== undefined && entry.testCount > 0 && (
          <span className="tests-badge">{m.testsLabel(entry.testCount)}</span>
        )}
      </div>
    </article>
  );
}

function IconLinks({ entry, lang }: { entry: Entry; lang: Lang }) {
  const qiita = entry.articles.find((a) => a.platform === 'qiita');
  const devto = entry.articles.find((a) => a.platform === 'devto');
  const sen = entry.articles.find((a) => a.platform === 'sen');
  const twitter = entry.social?.twitter;

  if (!entry.github && !twitter && !qiita && !devto && !sen) return null;

  return (
    <div className="icon-links">
      {entry.github && (
        <a
          href={entry.github}
          className="icon-link"
          target="_blank"
          rel="noopener"
          title="GitHub"
        >
          <GitHubIcon />
        </a>
      )}
      {twitter && (
        <a
          href={twitter}
          className="icon-link"
          target="_blank"
          rel="noopener"
          title="X (Twitter)"
        >
          <XIcon />
        </a>
      )}
      {qiita && (
        <a
          href={qiita.url}
          className="icon-link"
          target="_blank"
          rel="noopener"
          title="Qiita"
        >
          <QiitaIcon />
        </a>
      )}
      {devto && (
        <a
          href={devto.url}
          className="icon-link"
          target="_blank"
          rel="noopener"
          title="dev.to"
        >
          <DevToIcon />
        </a>
      )}
      {sen && !qiita && (
        <a
          href={sen.url}
          className="article-badge"
          target="_blank"
          rel="noopener"
          title={lang === 'ja' ? 'JA 記事' : 'Japanese article'}
        >
          {lang === 'ja' ? '記事' : 'JA'}
        </a>
      )}
    </div>
  );
}

// ---- URL query sync ------------------------------------------------------

function readLangFromQuery(): Lang | null {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  const v = q.get('lang');
  return v === 'ja' || v === 'en' ? v : null;
}

function readQuery(): FilterState {
  if (typeof window === 'undefined') return defaultFilter();
  const q = new URLSearchParams(window.location.search);
  return {
    query: q.get('q') ?? '',
    category: q.get('category') ?? 'all',
    stack: q.get('stack') ?? 'all',
    stage: q.get('stage') ?? 'all',
    sort: (q.get('sort') as SortKey) ?? 'number',
  };
}

function writeQuery(filter: FilterState, lang: Lang) {
  if (typeof window === 'undefined') return;
  const q = new URLSearchParams();
  if (filter.query) q.set('q', filter.query);
  if (filter.category !== 'all') q.set('category', filter.category);
  if (filter.stack !== 'all') q.set('stack', filter.stack);
  if (filter.stage !== 'all') q.set('stage', filter.stage);
  if (filter.sort !== 'number') q.set('sort', filter.sort);
  q.set('lang', lang);
  const qs = q.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, '', url);
}

function defaultFilter(): FilterState {
  return { query: '', category: 'all', stack: 'all', stage: 'all', sort: 'number' };
}
