/**
 * connpass イベントを収集し、ローカル SQLite に upsert する。
 *
 * Usage:
 *   pnpm events:sync
 *   pnpm events:sync --months=202603,202604
 *   pnpm events:sync --seed-mock
 *   pnpm events:sync --skip-connpass
 */

import { buildTargetMonths, collectConnpassConferences, parseTargetMonths } from '@/lib/data/connpass';
import { ensureEventStore, getStoredEventCount, upsertEventsToStore } from '@/lib/db/events-repository';
import { getSqliteDbPath } from '@/lib/db/sqlite';
import { mockEvents } from '@/lib/data/mock-events';

interface SyncOptions {
  targetMonths: string[];
  seedMock: boolean;
  skipConnpass: boolean;
}

function parseSyncOptions(argv: string[]): SyncOptions {
  const seedMock = argv.includes('--seed-mock');
  const skipConnpass = argv.includes('--skip-connpass');
  const monthsArg = argv.find((arg) => arg.startsWith('--months='));

  if (!monthsArg) {
    return {
      targetMonths: buildTargetMonths(new Date(), 6),
      seedMock,
      skipConnpass,
    };
  }

  const [, value = ''] = monthsArg.split('=');
  const parsedMonths = parseTargetMonths(value);

  return {
    targetMonths: parsedMonths.length > 0 ? parsedMonths : buildTargetMonths(new Date(), 6),
    seedMock,
    skipConnpass,
  };
}

async function main() {
  const options = parseSyncOptions(process.argv.slice(2));
  ensureEventStore({ seedFromMock: false });

  console.error(`[sync] db=${getSqliteDbPath()}`);
  console.error(`[sync] targetMonths=${options.targetMonths.join(',')}`);

  if (options.seedMock) {
    const seeded = upsertEventsToStore(mockEvents);
    console.error(`[sync] seeded mock events=${seeded}`);
  }

  if (!options.skipConnpass) {
    const connpassEvents = await collectConnpassConferences(options.targetMonths);
    const upserted = upsertEventsToStore(connpassEvents);
    console.error(`[sync] upserted connpass events=${upserted}`);
  } else {
    console.error('[sync] skipped connpass sync');
  }

  const total = getStoredEventCount();
  console.error(`[sync] total events=${total}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
