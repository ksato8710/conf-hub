# イベント情報参照・保存方式（SQLite）

## 1. 目的

ConfHub のイベント情報を「どこから参照し、どう更新するか」を固定化し、  
運用時のブレをなくす。

## 2. 基本方針

- **唯一の参照元（Source of Truth）** はローカル SQLite
- UI / ページは **必ず** `src/lib/data/events.ts` 経由でイベントを読む
- 外部データ取り込みは `src/scripts/sync-events-sqlite.ts` で行い、SQLiteへ upsert する
- `src/lib/data/mock-events.ts` は初期投入用のフォールバックデータとしてのみ使う

## 3. ファイルと責務

- `src/lib/db/sqlite.ts`
  - SQLite 接続確立
  - `events` テーブル作成とインデックス作成
- `src/lib/db/events-repository.ts`
  - `events` の upsert / count / select（slug検索含む）
  - 初回空DB時のモックシード
- `src/lib/data/events.ts`
  - 画面側が呼ぶデータ取得API
  - 既存のフィルタ仕様を維持
- `src/lib/data/connpass.ts`
  - connpass API 取得・正規化・イベント型マッピング
- `src/scripts/init-events-db.ts`
  - DB初期化 + モックイベント投入
- `src/scripts/sync-events-sqlite.ts`
  - connpass取得 + SQLite upsert

## 4. 参照フロー（アプリ実行時）

1. ページコンポーネントが `src/lib/data/events.ts` を呼ぶ  
2. `events.ts` が `ensureEventStore()` を実行  
3. DBが空なら `mock-events` を初期投入  
4. SQLite の `events` テーブルから読み出し、既存フィルタを適用して返す

## 5. 更新フロー（運用時）

1. 初期構築時に `pnpm events:init` を実行  
2. 定期または手動で `pnpm events:sync` を実行  
3. 収集したイベントを `slug` キーで upsert（重複更新）  
4. UIは次回参照時から SQLite の最新状態を表示

## 6. upsertルール

- 競合キー: `slug`（UNIQUE）
- `slug` が同じ場合は既存レコードを更新
- `created_at` は初回挿入値を維持
- `updated_at` は upsert 側の値で更新
- 配列項目（`target_roles` など）は JSON 文字列として保存

## 7. 実行コマンド

```bash
pnpm events:init
pnpm events:sync
pnpm events:sync --months=202603,202604
pnpm events:sync --seed-mock
pnpm events:sync --skip-connpass
pnpm events:collect:json --months=202603
```

## 8. DBパス

- デフォルト: `data/confhub.sqlite`
- 上書き: `CONFHUB_DB_PATH` 環境変数
  - 相対パス指定時はプロジェクトルート基準
  - 絶対パス指定も可能

## 9. 運用上の注意

- `node:sqlite` は Node 標準機能だが、実行時に experimental warning が出る
- connpass API 側で `403` が返るケースがあるため、同期時はログを確認する
- DBファイル（`data/*.sqlite*`）は `.gitignore` 対象
