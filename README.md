# Conf Hub

**日本のエンジニア・デザイナー向け技術カンファレンス集約サービス**

[![Deploy](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://conf-hub.craftgarden.studio)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)

> **Live**: [conf-hub.craftgarden.studio](https://conf-hub.craftgarden.studio)

![Conf Hub Screenshot](screenshot.png)

---

## 概要

日本国内の技術カンファレンスは connpass、Doorkeeper、Peatix など複数プラットフォームに分散しており、自分の職種・関心領域に合ったイベントを横断的に探すのが困難です。Conf Hub は**多軸フィルタリング**と**カレンダービュー**で、エンジニア・デザイナーが最適なカンファレンスを見つけるためのワンストップサービスを目指します。

- **多軸イベントフィルタリング** -- 職種 / 技術カテゴリ / 開催形式 / 地域 / 参加費 / 時期の 6 軸で絞り込み
- **Google Calendar 連携** -- 気になるイベントをワンクリックで Google Calendar に追加
- **connpass API データ収集** -- connpass API からイベント情報を自動収集し SQLite に同期
- **カレンダービュー** -- 月間・週間のカレンダー形式でイベントを俯瞰
- **プレミアム / 注目イベント表示** -- スポンサー枠・注目イベントのハイライト表示
- **早割価格表示** -- early_bird_price 対応で早期申込のメリットを可視化
- **収益モデル内蔵** -- スポンサー枠、プレミアム掲載、アフィリエイト、ニュースレター広告

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript |
| DB (Production) | Supabase (PostgreSQL) |
| DB (Local/Sync) | SQLite (`data/confhub.sqlite`) |
| Icons | Lucide React |
| Date | date-fns |
| Package Manager | pnpm |
| Deploy | Vercel |

## セットアップ

### 前提条件

- Node.js >= 20
- pnpm 9+
- Supabase プロジェクト（本番環境用）

### インストール

```bash
git clone https://github.com/ksato8710/conf-hub.git
cd conf-hub
pnpm install
```

### 環境変数

`.env.local` を作成し、以下を設定:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# DB パス（デフォルト: data/confhub.sqlite）
CONFHUB_DB_PATH=data/confhub.sqlite

# connpass API（オプション）
CONNPASS_API_KEY=your_api_key
```

### 起動

```bash
# 1. ローカル DB 初期化（スキーマ作成 + モックデータ投入）
pnpm events:init

# 2. connpass からイベント収集 + SQLite に同期
pnpm events:sync

# 3. 開発サーバー起動
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く。

## アーキテクチャ

### ディレクトリ構成

```
conf-hub/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # トップページ（イベント一覧 + フィルタ）
│   │   ├── layout.tsx               # ルートレイアウト
│   │   ├── events/
│   │   │   ├── page.tsx             # イベント一覧ページ
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # イベント詳細ページ
│   │   ├── calendar/
│   │   │   └── page.tsx             # カレンダービュー
│   │   └── api/
│   │       └── events/
│   │           └── route.ts         # イベント API エンドポイント
│   ├── components/
│   │   ├── EventCard.tsx            # イベントカードコンポーネント
│   │   ├── FilterBar.tsx            # 多軸フィルタ UI
│   │   └── CalendarView.tsx         # カレンダー表示
│   ├── lib/
│   │   ├── supabase.ts             # Supabase クライアント
│   │   ├── sqlite.ts               # SQLite ローカル DB
│   │   └── types.ts                # 型定義
│   ├── types/
│   │   └── event.ts                # Event 型定義
│   └── scripts/
│       ├── init-events-db.ts       # DB 初期化スクリプト
│       ├── sync-events-sqlite.ts   # SQLite 同期スクリプト
│       └── collect-connpass.ts     # connpass データ収集
├── data/
│   └── confhub.sqlite              # ローカル SQLite DB
├── docs/
│   └── event-data-sqlite.md        # DB 設計仕様書
├── package.json
├── pnpm-lock.yaml
└── next.config.ts
```

### DB スキーマ (events)

| カラム | 型 | 説明 |
|-------|-----|------|
| slug | TEXT (PK) | URL スラッグ |
| title | TEXT | イベント名 |
| start_date / end_date | DATETIME | 開催期間 |
| format | TEXT | online / offline / hybrid |
| venue / region | TEXT | 会場名 / 地域 |
| target_roles | TEXT[] | 対象職種 |
| tech_categories | TEXT[] | 技術カテゴリ |
| design_categories | TEXT[] | デザインカテゴリ |
| capacity | INTEGER | 定員 |
| price / early_bird_price | INTEGER | 参加費 / 早割価格 |
| official_url / ticket_url | TEXT | 公式 URL / チケット URL |
| twitter_hashtag | TEXT | Twitter ハッシュタグ |

### フィルタリング項目

| 軸 | 選択肢 |
|----|--------|
| 職種 | エンジニア / デザイナー / PM / マーケター / 全般 |
| 技術領域 | フロントエンド / バックエンド / インフラ / AI・ML / モバイル / セキュリティ / データ |
| デザイン領域 | UI/UX / グラフィック / ブランディング / プロダクトデザイン |
| 形式 | オンライン / オフライン / ハイブリッド |
| 規模 | 小規模（~100人）/ 中規模（100-500人）/ 大規模（500人~） |
| 参加費 | 無料 / 有料 / 早割あり |

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 (next dev) |
| `pnpm build` | プロダクションビルド (next build) |
| `pnpm lint` | ESLint 実行 |
| `pnpm events:init` | SQLite DB 初期化（スキーマ作成 + モックデータ upsert） |
| `pnpm events:sync` | connpass 収集 + SQLite upsert（デフォルト: 当月~6ヶ月） |
| `pnpm events:sync --seed-mock` | モックデータ付きで同期 |
| `pnpm events:sync --months=YYYYMM` | 対象月を明示指定して同期 |
| `pnpm events:collect:json` | connpass 収集結果を JSON で標準出力 |

## デプロイ

Vercel にデプロイ済み。`main` ブランチへの push で自動デプロイが実行されます。

```bash
# 手動デプロイ
vercel --prod
```

- **本番 URL**: https://conf-hub.craftgarden.studio
- **サブドメイン管理**: Vercel + AWS Route 53

### CI/CD

- Vercel Preview Deploy: PR ごとにプレビュー環境を自動生成
- Vercel Production Deploy: `main` マージで本番自動デプロイ

## テスト

テストフレームワークは未設定です。ESLint による静的解析を実施しています。

```bash
pnpm lint
```

## 関連プロジェクト

[craftgarden.studio](https://craftgarden.studio) エコシステムの一部として、他プロジェクトと連携しています。

| プロジェクト | 説明 |
|-------------|------|
| [product-hub](https://github.com/ksato8710/product-hub) | プロダクトエコシステム管理ダッシュボード |
| [content-studio](https://github.com/ksato8710/content-studio) | コンテンツ管理・マルチプラットフォーム投稿 |
| [ai-solo-craft](https://github.com/ksato8710/ai-solo-craft) | AI ソロビルダー向けニュースキュレーション |
| [api-catalog-jp](https://github.com/ksato8710/api-catalog-jp) | 日本語 API カタログ |

## 開発ガイド

- コンポーネントは機能単位でフォルダ分け
- 型定義は `types/` に集約
- Server Components をデフォルトで使用、必要な部分のみ Client Components
- Tailwind CSS のユーティリティクラスを活用
- Issue や Pull Request は歓迎です。大きな変更の場合は、先に Issue で議論をお願いします

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-02 | 初期リリース -- connpass データ収集パイプライン、多軸フィルタ、カレンダービュー、SQLite ベースのローカル DB |

## ロードマップ

- [ ] Doorkeeper / Peatix API 対応
- [ ] ユーザーお気に入り・ブックマーク機能
- [ ] 週次ダイジェストメール配信
- [ ] イベント主催者向け管理画面
- [ ] PWA 対応（オフラインカレンダー）
- [ ] レコメンドエンジン（参加履歴ベース）
- [ ] Supabase 本番 DB への完全移行

## ライセンス

MIT
