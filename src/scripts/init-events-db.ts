/**
 * SQLite の events テーブルを初期化し、モックデータを投入する。
 *
 * Usage:
 *   pnpm events:init
 */

import { mockEvents } from '@/lib/data/mock-events';
import { ensureEventStore, getStoredEventCount, upsertEventsToStore } from '@/lib/db/events-repository';
import { getSqliteDbPath } from '@/lib/db/sqlite';

function main() {
  ensureEventStore({ seedFromMock: false });

  const upserted = upsertEventsToStore(mockEvents);
  const total = getStoredEventCount();

  console.error(`[init] db=${getSqliteDbPath()}`);
  console.error(`[init] upserted mock events=${upserted}`);
  console.error(`[init] total events=${total}`);
}

main();
