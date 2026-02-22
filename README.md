# ConfHub

日本の技術カンファレンス情報を集約する Next.js アプリです。  
イベント情報はローカル SQLite（`data/confhub.sqlite`）を唯一の参照元として管理します。

## セットアップ

```bash
pnpm dev
```

初回のみ、SQLite 初期化（モックデータ投入）を実行してください。

```bash
pnpm events:init
```

## イベントデータ運用

```bash
pnpm events:init            # スキーマ作成 + モックデータ upsert
pnpm events:sync            # connpass 収集 + SQLite upsert
pnpm events:sync --seed-mock
pnpm events:sync --skip-connpass
pnpm events:collect:json    # connpass 収集結果をJSONで標準出力
```

`events:sync` の対象月はデフォルトで「当月から6ヶ月」です。  
明示する場合は `--months=YYYYMM,YYYYMM` を指定します。

## DBファイルの場所

- デフォルト: `data/confhub.sqlite`
- 環境変数で変更: `CONFHUB_DB_PATH`
  - 例: `CONFHUB_DB_PATH=/tmp/confhub.sqlite pnpm events:init`

## 参照仕様

詳細は `docs/event-data-sqlite.md` を参照してください。

## 開発コマンド

```bash
pnpm dev
pnpm lint
pnpm build
```
