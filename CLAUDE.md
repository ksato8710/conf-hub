# ConfHub - 技術カンファレンス一覧サービス

## プロジェクト概要
日本のエンジニア・デザイナー向け技術カンファレンス一覧サイト。
柔軟なフィルタリング、カレンダー連携、ニュースレター機能を提供。

## 技術スタック
- **フロントエンド**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **データベース**: Supabase (PostgreSQL)
- **ホスティング**: Vercel
- **パッケージマネージャー**: pnpm

## コマンド
```bash
pnpm dev      # 開発サーバー起動 (localhost:3000)
pnpm build    # プロダクションビルド
pnpm lint     # ESLint実行
```

## ディレクトリ構成
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # トップページ
│   ├── events/            # イベント一覧・詳細
│   ├── calendar/          # カレンダービュー
│   └── api/               # API Routes
├── components/            # 再利用可能なコンポーネント
│   ├── ui/               # 基本UIコンポーネント
│   ├── events/           # イベント関連
│   └── filters/          # フィルタリング関連
├── lib/                   # ユーティリティ
│   ├── supabase/         # Supabaseクライアント
│   └── utils/            # 汎用関数
└── types/                # TypeScript型定義
```

## データモデル

### events テーブル
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- 日時
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  timezone TEXT DEFAULT 'Asia/Tokyo',
  
  -- 場所
  format TEXT CHECK (format IN ('online', 'offline', 'hybrid')),
  venue TEXT,
  address TEXT,
  region TEXT,
  online_url TEXT,
  
  -- 分類
  target_roles TEXT[] DEFAULT '{}',
  tech_categories TEXT[] DEFAULT '{}',
  design_categories TEXT[] DEFAULT '{}',
  
  -- 参加情報
  capacity INTEGER,
  price INTEGER DEFAULT 0,
  early_bird_price INTEGER,
  early_bird_deadline TIMESTAMPTZ,
  
  -- リンク
  official_url TEXT NOT NULL,
  ticket_url TEXT,
  twitter_hashtag TEXT,
  
  -- メタ
  source TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_format ON events(format);
CREATE INDEX idx_events_target_roles ON events USING GIN(target_roles);
CREATE INDEX idx_events_tech_categories ON events USING GIN(tech_categories);
```

## フィルタリング項目
- **職種**: エンジニア / デザイナー / PM / マーケター / 全般
- **技術領域**: フロントエンド / バックエンド / インフラ / AI・ML / モバイル / セキュリティ / データ
- **デザイン領域**: UI/UX / グラフィック / ブランディング / プロダクトデザイン
- **形式**: オンライン / オフライン / ハイブリッド
- **規模**: 小規模（〜100人）/ 中規模（100-500人）/ 大規模（500人〜）
- **参加費**: 無料 / 有料 / 早割あり
- **地域**: 東京 / 大阪 / 名古屋 / 福岡 / その他 / オンライン
- **時期**: 今週 / 来週 / 今月 / 来月 / カスタム

## MVP要件（Phase 1）
1. [x] Next.jsプロジェクト初期化
2. [ ] Supabaseセットアップ
3. [ ] 基本UIコンポーネント作成
4. [ ] イベント一覧ページ（フィルタリング付き）
5. [ ] イベント詳細ページ
6. [ ] Googleカレンダー追加ボタン
7. [ ] connpass APIからのデータ収集スクリプト

## 収益モデル
- スポンサー枠（月額）
- プレミアム掲載（カンファレンス主催者向け）
- アフィリエイト（転職、スクール、Udemy、書籍、旅行）
- ニュースレター広告

## 環境変数
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## 開発ルール
- コンポーネントは機能単位でフォルダ分け
- 型定義は `types/` に集約
- Server Componentsをデフォルトで使用、必要な部分のみClient Components
- Tailwind CSSのユーティリティクラスを活用
