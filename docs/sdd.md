# ConfHub - Software Design Document (SDD)

## 1. 概要

ConfHubは日本のエンジニア・デザイナー向け技術カンファレンス一覧サイト。
本ドキュメントはMVP（Phase 1）の設計仕様を定義する。

### 1.1 技術スタック
- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Supabase (PostgreSQL) — MVP時点ではモックデータで動作
- Vercel (デプロイ)
- pnpm (パッケージマネージャー)
- lucide-react (アイコン)
- date-fns (日付処理)

### 1.2 設計原則
- Server Components をデフォルトで使用し、インタラクティブな部分のみ `'use client'`
- コンポーネントは機能単位でフォルダ分け
- 型定義は `src/types/` に集約
- パスエイリアス `@/*` → `./src/*`
- Tailwind CSS のユーティリティクラスを活用
- モバイルファーストのレスポンシブデザイン

---

## 2. ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx              # ルートレイアウト（Header + Footer）
│   ├── page.tsx                # トップページ
│   ├── events/
│   │   ├── page.tsx            # イベント一覧（フィルタリング付き）
│   │   └── [slug]/
│   │       └── page.tsx        # イベント詳細
│   └── api/
│       └── events/
│           └── route.ts        # イベントAPI
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # ヘッダー
│   │   └── Footer.tsx          # フッター
│   ├── ui/
│   │   ├── Badge.tsx           # バッジ（タグ表示用）
│   │   └── FilterChip.tsx      # フィルタ用チップ（トグル選択）
│   ├── events/
│   │   ├── EventCard.tsx       # イベントカード
│   │   ├── EventList.tsx       # イベント一覧グリッド
│   │   └── FeaturedEvents.tsx  # 注目イベントセクション
│   └── filters/
│       └── FilterBar.tsx       # フィルタバー（全フィルタ統合）
├── lib/
│   ├── supabase/
│   │   └── client.ts           # Supabaseクライアント（既存）
│   ├── utils/
│   │   ├── calendar.ts         # Googleカレンダー URL生成
│   │   ├── date.ts             # 日付フォーマット
│   │   └── filters.ts          # フィルタロジック（URLパラメータ同期）
│   └── data/
│       ├── mock-events.ts      # モックイベントデータ（50件以上）
│       └── events.ts           # データ取得関数（モック → 将来Supabase切替）
├── types/
│   └── event.ts                # 型定義（既存）
└── scripts/
    └── collect-connpass.ts     # connpass APIデータ収集スクリプト
```

---

## 3. データ層仕様

### 3.1 データ取得関数 — `src/lib/data/events.ts`

```typescript
// イベント一覧取得（フィルタリング対応）
export async function getEvents(filters?: Partial<EventFilters>): Promise<Event[]>

// イベント詳細取得（slug指定）
export async function getEventBySlug(slug: string): Promise<Event | null>

// 注目イベント取得
export async function getFeaturedEvents(): Promise<Event[]>

// 直近開催イベント取得
export async function getUpcomingEvents(limit?: number): Promise<Event[]>
```

- MVP時点では `mock-events.ts` のデータをメモリ内でフィルタリングして返す
- フィルタリングロジック: 全条件をANDで結合
- ソート: `start_date` 昇順（直近開催順）

### 3.2 モックデータ — `src/lib/data/mock-events.ts`

50件以上の日本の技術カンファレンスのリアルなモックデータを用意する。

**データ要件:**
- 各カテゴリ（フロントエンド、バックエンド、AI/ML等）のイベントを含む
- online / offline / hybrid を均等に含む
- 無料・有料・早割ありを含む
- 東京・大阪・名古屋・福岡・オンラインを含む
- 2026年3月〜8月の日付範囲
- `is_featured: true` のイベントを5件含む
- slug は `kebab-case` で一意

### 3.3 SQLマイグレーション — `supabase/migrations/001_create_events.sql`

CLAUDE.md記載のCREATE TABLE文 + インデックスをそのまま使用する。
追加で `updated_at` の自動更新トリガーを含める。

---

## 4. ページ仕様

### 4.1 ルートレイアウト — `src/app/layout.tsx`

**メタデータ:**
```typescript
metadata = {
  title: { default: 'ConfHub - 技術カンファレンス一覧', template: '%s | ConfHub' },
  description: '日本の技術カンファレンスを職種・技術・形式・規模で検索。Googleカレンダー連携対応。',
  openGraph: { ... }
}
```

**レイアウト構成:**
- `<Header />` — ロゴ + ナビゲーション
- `{children}` — ページコンテンツ
- `<Footer />` — コピーライト + リンク

**言語:** `lang="ja"`

### 4.2 トップページ — `src/app/page.tsx`

Server Component。

**セクション構成:**
1. **ヒーローセクション**
   - キャッチコピー: 「技術カンファレンスを、もっと見つけやすく。」
   - サブコピー: 「職種・技術・形式・規模で自在にフィルタリング。気になるイベントはワンクリックでカレンダーに追加。」
   - CTAボタン: 「イベントを探す →」 → `/events` へリンク
   - 背景: グラデーション（青〜紫系）

2. **注目イベントセクション** — `<FeaturedEvents />`
   - `is_featured: true` のイベントを最大5件表示
   - 横スクロール可能なカード列

3. **直近開催セクション**
   - 直近8件のイベントを `<EventCard />` で表示
   - 「すべてのイベントを見る →」リンク

4. **カテゴリクイックアクセス**
   - 技術カテゴリ（フロントエンド、バックエンド等）をカード形式で表示
   - クリックで `/events?techCategories=xxx` に遷移

### 4.3 イベント一覧ページ — `src/app/events/page.tsx`

**URLパラメータ（searchParams）:**
```
/events?roles=エンジニア&techCategories=フロントエンド,バックエンド&format=online&region=東京&period=this_month&keyword=react
```

**構成:**
1. ページタイトル: 「イベント一覧」
2. `<FilterBar />` — フィルタ操作UI
3. 結果件数表示: 「XX件のイベント」
4. `<EventList events={filteredEvents} />` — フィルタ済み一覧
5. 0件時: 「条件に一致するイベントが見つかりませんでした」+ フィルタリセットボタン

**データフロー:**
- searchParams からフィルタ条件を抽出
- `getEvents(filters)` でフィルタ済みデータ取得
- Server Component としてレンダリング

### 4.4 イベント詳細ページ — `src/app/events/[slug]/page.tsx`

Server Component。

**メタデータ:** 動的生成（`generateMetadata`）
```typescript
title: `${event.title} | ConfHub`
description: event.description の先頭120文字
openGraph: { title, description, type: 'website' }
```

**構成:**
1. **パンくずリスト**: ホーム > イベント一覧 > イベント名
2. **イベントヘッダー**
   - タイトル（h1）
   - 形式バッジ（オンライン/オフライン/ハイブリッド）
   - プレミアムバッジ（`is_premium: true` の場合）
3. **日時セクション**
   - 開始日時（`YYYY年M月D日(曜日) HH:mm`）
   - 終了日時（ある場合）
   - **Googleカレンダーに追加** ボタン
4. **場所セクション**
   - オフライン: 会場名 + 住所
   - オンライン: 「オンライン開催」+ 配信URL（ある場合）
   - ハイブリッド: 両方表示
5. **参加情報セクション**
   - 参加費: 「無料」または「¥X,XXX」
   - 早割: 「早割 ¥X,XXX（YYYY/MM/DDまで）」
   - 定員: 「XXX名」
6. **カテゴリセクション**
   - 対象職種バッジ
   - 技術カテゴリバッジ
   - デザインカテゴリバッジ
7. **説明文** — event.description をそのまま表示
8. **リンクセクション**
   - 「公式サイトを見る」ボタン → `official_url`
   - 「チケットを購入」ボタン → `ticket_url`（ある場合）
   - Twitterハッシュタグリンク（ある場合）

---

## 5. コンポーネント仕様

### 5.1 Header — `src/components/layout/Header.tsx`

Server Component。

```
┌──────────────────────────────────────────┐
│ 🎯 ConfHub          イベント一覧         │
└──────────────────────────────────────────┘
```

- ロゴ: テキスト「ConfHub」→ `/` リンク
- ナビ: 「イベント一覧」→ `/events` リンク
- レスポンシブ: モバイルでもそのまま表示（ハンバーガー不要、項目が少ないため）

### 5.2 Footer — `src/components/layout/Footer.tsx`

Server Component。

```
┌──────────────────────────────────────────┐
│ © 2026 ConfHub. All rights reserved.     │
└──────────────────────────────────────────┘
```

### 5.3 Badge — `src/components/ui/Badge.tsx`

Server Component。

**Props:**
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  size?: 'sm' | 'md';
}
```

**スタイル:**
- `default`: `bg-zinc-100 text-zinc-700`
- `primary`: `bg-blue-100 text-blue-700`
- `success`: `bg-green-100 text-green-700`
- `warning`: `bg-amber-100 text-amber-700`
- `sm`: `text-xs px-2 py-0.5`
- `md`: `text-sm px-2.5 py-0.5`
- 共通: `rounded-full font-medium inline-flex items-center`

### 5.4 FilterChip — `src/components/ui/FilterChip.tsx`

Client Component (`'use client'`)。

**Props:**
```typescript
interface FilterChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}
```

**スタイル:**
- 未選択: `border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50`
- 選択中: `border-blue-500 bg-blue-50 text-blue-700`
- 共通: `rounded-full px-3 py-1.5 text-sm cursor-pointer transition-colors`

### 5.5 EventCard — `src/components/events/EventCard.tsx`

Server Component。

**Props:**
```typescript
interface EventCardProps {
  event: Event;
}
```

**レイアウト:**
```
┌─────────────────────────────────┐
│ [オンライン]  [注目]              │
│ カンファレンス名                  │
│ 📅 2026年3月15日(日) 10:00      │
│ 📍 東京・渋谷ヒカリエ            │
│ [フロントエンド] [React]          │
│                    無料 →        │
└─────────────────────────────────┘
```

- カード全体が `/events/{slug}` へのリンク
- 上部: 形式バッジ + is_featured 時「注目」バッジ
- タイトル: `text-lg font-semibold` 2行まで `line-clamp-2`
- 日時: lucide-react の `Calendar` アイコン + フォーマット済み日時
- 場所: lucide-react の `MapPin` アイコン + venue or 「オンライン」
- カテゴリ: `<Badge>` で target_roles / tech_categories を表示（最大3つ + 「+N」）
- 価格: 「無料」or 「¥X,XXX」 右下に配置
- ホバー: `hover:shadow-md transition-shadow`
- ボーダー: `border border-zinc-200 rounded-xl p-5`

### 5.6 EventList — `src/components/events/EventList.tsx`

Server Component。

**Props:**
```typescript
interface EventListProps {
  events: Event[];
}
```

- グリッドレイアウト: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- 各カードを `<EventCard event={event} />` でレンダリング

### 5.7 FeaturedEvents — `src/components/events/FeaturedEvents.tsx`

Server Component。

- `getFeaturedEvents()` で注目イベント取得
- 横スクロールカルーセル: `flex overflow-x-auto gap-4 snap-x`
- 各カードは幅固定 `min-w-[300px]`

### 5.8 FilterBar — `src/components/filters/FilterBar.tsx`

Client Component (`'use client'`)。

**Props:**
```typescript
interface FilterBarProps {
  initialFilters: EventFilters;
}
```

**レイアウト:**
```
┌──────────────────────────────────────────────┐
│ 🔍 キーワード検索 ...                          │
├──────────────────────────────────────────────┤
│ 職種:  [エンジニア] [デザイナー] [PM] ...       │
│ 技術:  [フロントエンド] [バックエンド] [AI] ... │
│ 形式:  [オンライン] [オフライン] [ハイブリッド]  │
│ 地域:  [東京] [大阪] [名古屋] ...              │
│ 参加費: [無料] [有料] [早割あり]                 │
│ 時期:  [今週] [来週] [今月] [来月]              │
│                              [フィルタをクリア] │
└──────────────────────────────────────────────┘
```

**機能:**
- 各フィルタ行は `<FilterChip>` のグループ
- 職種・技術カテゴリ: 複数選択可能（トグル）
- 形式・地域・参加費・時期: 単一選択（再クリックで解除）
- キーワード: テキスト入力、300ms debounce
- フィルタ変更時、URLの searchParams を `router.push` で更新
- 「フィルタをクリア」ボタンで全解除

**URL同期ロジック（`src/lib/utils/filters.ts`）:**
```typescript
// searchParams → EventFilters
export function parseFiltersFromParams(params: URLSearchParams): EventFilters

// EventFilters → searchParams文字列
export function buildFilterParams(filters: EventFilters): string
```

---

## 6. ユーティリティ仕様

### 6.1 Googleカレンダー連携 — `src/lib/utils/calendar.ts`

```typescript
export function buildGoogleCalendarUrl(event: Event): string
```

GoogleカレンダーのURL形式:
```
https://calendar.google.com/calendar/render?action=TEMPLATE
  &text={title}
  &dates={startISO}/{endISO}
  &details={description + official_url}
  &location={venue + address}
```

- 日時は UTC の `YYYYMMDDTHHmmssZ` 形式
- end_date が null の場合、start_date + 1時間 をデフォルト
- details に公式URLを含める
- 新しいタブで開く（`target="_blank"`）

### 6.2 日付フォーマット — `src/lib/utils/date.ts`

```typescript
// "2026年3月15日(土)" 形式
export function formatEventDate(dateStr: string): string

// "2026年3月15日(土) 10:00" 形式
export function formatEventDateTime(dateStr: string): string

// "3/15(土)" 短縮形式
export function formatEventDateShort(dateStr: string): string

// 時期フィルタ用の日付範囲取得
export function getDateRange(period: TimePeriod): { start: Date; end: Date }
```

date-fns の `ja` ロケールを使用。

### 6.3 フィルタロジック — `src/lib/utils/filters.ts`

```typescript
// URLパラメータ → EventFilters
export function parseFiltersFromParams(params: URLSearchParams): EventFilters

// EventFilters → URLパラメータ文字列
export function buildFilterParams(filters: EventFilters): string

// イベント配列にフィルタを適用（メモリ内フィルタリング）
export function applyFilters(events: Event[], filters: EventFilters): Event[]
```

**フィルタリングルール:**
- `roles`: 配列のいずれかが `event.target_roles` に含まれる（OR）
- `techCategories`: 配列のいずれかが `event.tech_categories` に含まれる（OR）
- `designCategories`: 配列のいずれかが `event.design_categories` に含まれる（OR）
- `format`: 完全一致
- `size`: capacity が `small: ≤100`, `medium: 101-500`, `large: >500`（null は除外しない）
- `priceType`: `free: price===0`, `paid: price>0`, `early_bird: early_bird_price !== null`
- `region`: 完全一致
- `period`: start_date が該当期間内
- `keyword`: title または description に含まれる（大文字小文字無視）
- 全条件をAND結合

---

## 7. API仕様

### 7.1 GET /api/events

**クエリパラメータ:** EventFilters の各フィールドに対応

**レスポンス:**
```json
{
  "events": Event[],
  "total": number
}
```

**ステータス:**
- 200: 正常
- 500: サーバーエラー

> MVP時点ではページルートで直接 `getEvents()` を呼ぶため、APIルートはオプション。
> 将来のクライアントサイドフィルタリングや外部連携用に定義しておく。

---

## 8. connpassデータ収集スクリプト仕様

### 8.1 `src/scripts/collect-connpass.ts`

**connpass API エンドポイント:**
```
GET https://connpass.com/api/v1/event/
  ?keyword=カンファレンス
  &keyword_or=conference,conf,summit,fest
  &count=100
  &order=2 (開催日時順)
  &ym=202603,202604,202605,202606
```

**処理フロー:**
1. connpass APIからイベント取得
2. 各イベントを `Event` 型にマッピング
3. slug生成（タイトルからkebab-case）
4. カテゴリ推定（タイトル・説明文のキーワードマッチング）
5. 結果をJSON出力（コンソールまたはファイル）

**カテゴリ推定ルール（キーワードマッチング）:**
```typescript
const TECH_KEYWORDS: Record<TechCategory, string[]> = {
  'フロントエンド': ['react', 'vue', 'angular', 'next', 'nuxt', 'css', 'html', 'frontend', 'フロントエンド'],
  'バックエンド': ['node', 'go', 'rust', 'python', 'java', 'ruby', 'rails', 'backend', 'バックエンド', 'api'],
  'インフラ': ['aws', 'gcp', 'azure', 'docker', 'kubernetes', 'k8s', 'terraform', 'infrastructure', 'インフラ', 'sre', 'devops'],
  'AI・ML': ['ai', 'ml', 'llm', 'gpt', 'machine learning', '機械学習', '生成ai', 'deep learning'],
  'モバイル': ['ios', 'android', 'swift', 'kotlin', 'flutter', 'react native', 'モバイル'],
  'セキュリティ': ['security', 'セキュリティ', 'owasp', '脆弱性'],
  'データ': ['data', 'bigquery', 'spark', 'analytics', 'データ分析', 'データベース'],
};
```

---

## 9. デザイントークン

### 9.1 カラー

| 用途 | Light | 説明 |
|------|-------|------|
| Background | `#ffffff` | ページ背景 |
| Foreground | `#171717` | テキスト |
| Muted | `#f4f4f5` | セクション背景 |
| Border | `#e4e4e7` | ボーダー |
| Primary | `#2563eb` | CTAボタン、アクセント |
| Primary Light | `#dbeafe` | バッジ背景 |

### 9.2 タイポグラフィ

- フォント: `Geist Sans`（既にlayout.tsxで設定済み）+ `Noto Sans JP`（日本語）
- h1: `text-3xl font-bold` / `text-4xl font-bold`（デスクトップ）
- h2: `text-2xl font-bold`
- h3: `text-xl font-semibold`
- body: `text-base text-zinc-700`
- small: `text-sm text-zinc-500`

### 9.3 スペーシング

- セクション間: `py-12` / `py-16`（デスクトップ）
- コンテンツ最大幅: `max-w-6xl mx-auto px-4`
- カード間: `gap-4` / `gap-6`

---

## 10. 実装担当の分割

### チーム A: フロントエンド担当
1. `src/components/layout/Header.tsx`
2. `src/components/layout/Footer.tsx`
3. `src/components/ui/Badge.tsx`
4. `src/components/ui/FilterChip.tsx`
5. `src/components/events/EventCard.tsx`
6. `src/components/events/EventList.tsx`
7. `src/components/events/FeaturedEvents.tsx`
8. `src/components/filters/FilterBar.tsx`
9. `src/app/layout.tsx`（更新）
10. `src/app/page.tsx`（トップページ）
11. `src/app/events/page.tsx`（一覧ページ）
12. `src/app/events/[slug]/page.tsx`（詳細ページ）
13. `src/app/globals.css`（更新 — Noto Sans JP追加）

### チーム B: バックエンド + データ担当
1. `src/lib/utils/calendar.ts`
2. `src/lib/utils/date.ts`
3. `src/lib/utils/filters.ts`
4. `src/lib/data/mock-events.ts`（50件以上）
5. `src/lib/data/events.ts`（データ取得関数）
6. `src/scripts/collect-connpass.ts`
7. `supabase/migrations/001_create_events.sql`
8. `src/app/api/events/route.ts`
