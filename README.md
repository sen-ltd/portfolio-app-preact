# portfolio-app-preact

[![Demo](https://img.shields.io/badge/demo-sen.ltd%2Fportfolio%2Fportfolio--app--preact%2F-7cc4ff)](https://sen.ltd/portfolio/portfolio-app-preact/)

SEN Portfolio ブラウザの **Preact 実装**。React API 互換の超軽量ランタイム（3 kB）で、比較シリーズ第 10 弾。

**Live demo**: https://sen.ltd/portfolio/portfolio-app-preact/

## バンドルサイズ比較（更新）

| 実装 | main JS | gzip | 対 React |
|---|---|---|---|
| React 18 (021) | 151.01 kB | 48.84 kB | — |
| Vue 3 (022) | 73.65 kB | 28.76 kB | −41% |
| Svelte 5 (023) | 49.78 kB | 18.92 kB | −61% |
| SolidJS (024) | 21.97 kB | 8.33 kB | −83% |
| Nuxt 3 (025) | — | — | — |
| SvelteKit (026) | — | — | — |
| Qwik (027) | — | — | — |
| Astro (028) | — | — | — |
| Lit (029) | — | — | — |
| **Preact 10 (030)** | **22.16 kB** | **8.75 kB** | **−82%** |

Preact はアプリコードが同じでもランタイムが約 3 kB のため、React の 151 kB に対して 22 kB という劇的な差が出ます。SolidJS と同等のバンドルサイズを、React とほぼ同じコードで実現します。

## 共通コード

`src/types.ts`, `src/filter.ts`, `src/data.ts`, `src/style.css`, `tests/filter.test.ts` は他の実装と byte-identical。差分は `App.tsx` と `main.tsx` と `i18n.ts`（framework 名のみ差分）。

## Preact 独自のポイント

### React API 互換レイヤー
Preact は `useState`, `useEffect`, `useMemo`, `useCallback` など React Hooks API をそのまま実装しています。`preact/hooks` からインポートするだけで、React コードをほぼそのまま動かせます。今回の移植で変更が必要だったのは以下のみです:

- `import { ... } from 'react'` → `import { ... } from 'preact/hooks'`
- `import { render } from 'react-dom'` → `import { render } from 'preact'`
- `<input onChange>` の `e.target` の型キャスト（TypeScript が厳密になるため）
- `<input value onChange>` → `<input value onInput>`（Preact では `onInput` が controlled input のイベント）

### 3 kB ランタイム
React の virtual DOM 実装は約 45 kB。Preact は同じ virtual DOM アプローチを採りながら 3 kB に収めています。実装の最適化（minification + dead code elimination）により、アプリコードが同じでもバンドルが 7 分の 1 になります。

### Signals — useState の代替
`@preact/signals` パッケージを使うと、Solid の `createSignal` に近い fine-grained reactivity が得られます:

```tsx
import { signal, computed } from '@preact/signals';

const count = signal(0);
const doubled = computed(() => count.value * 2);

// コンポーネント内で .value を読むと自動購読
function Counter() {
  return <button onClick={() => count.value++}>{count.value}</button>;
}
```

Signals を使うと `useState` の再レンダリングが不要になり、さらに小さい更新粒度を実現できます。今回の実装では `preact/hooks` の `useState` を使っていますが、signals への移行も容易です。

### `preact/compat` — Drop-in React 置換
既存の React アプリを Preact に移行する場合、`vite.config.ts` に 1 行追加するだけで `react` / `react-dom` を `preact/compat` にエイリアスできます:

```ts
resolve: {
  alias: {
    'react': 'preact/compat',
    'react-dom': 'preact/compat',
  }
}
```

これにより、React 向けに書かれたサードパーティライブラリも含めてそのまま動作します。

### Preact vs React — いつ選ぶか

| シナリオ | 推奨 |
|---|---|
| バンドルサイズが最優先（CDN コスト、低帯域） | Preact |
| 既存 React コードベースの移行 | Preact + `preact/compat` |
| React エコシステム（Next.js、RSC）が必要 | React |
| fine-grained reactivity が欲しい | SolidJS または Preact Signals |
| React Hooks の学習コストをゼロにしたい | Preact（API 互換） |

## ローカル起動

```sh
npm install
npm run dev
# → http://localhost:5173/portfolio/portfolio-app-preact/
```

Vite の middleware が `portfolio/data/entries.json` を `/data.json` として serve するので、
S3 にデプロイせずローカルで実データ確認が可能です。

## テスト

```sh
npm test
```

14 vitest ケース（共有の `filter.ts` を node environment で実行）。

## ライセンス

MIT. See [LICENSE](./LICENSE).

---

Part of the [SEN portfolio series](https://sen.ltd/portfolio/). Entry 030.
