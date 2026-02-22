/**
 * connpass API からカンファレンス情報を収集し、JSON で出力する。
 *
 * Usage:
 *   pnpm events:collect:json
 *   pnpm events:collect:json --months=202603,202604
 */

import { buildTargetMonths, collectConnpassConferences, parseTargetMonths } from '@/lib/data/connpass';

function parseMonthsFromArgv(argv: string[]): string[] {
  const monthsArg = argv.find((arg) => arg.startsWith('--months='));
  if (!monthsArg) {
    return buildTargetMonths(new Date(), 6);
  }

  const [, value = ''] = monthsArg.split('=');
  const parsed = parseTargetMonths(value);
  return parsed.length > 0 ? parsed : buildTargetMonths(new Date(), 6);
}

async function main() {
  const targetMonths = parseMonthsFromArgv(process.argv.slice(2));
  console.error(`[collect] targetMonths=${targetMonths.join(',')}`);

  const events = await collectConnpassConferences(targetMonths);
  console.error(`[collect] mapped events=${events.length}`);

  console.log(JSON.stringify(events, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
