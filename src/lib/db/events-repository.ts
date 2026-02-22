import { mockEvents } from '@/lib/data/mock-events';
import { getSqliteDb } from '@/lib/db/sqlite';
import type { SQLInputValue } from 'node:sqlite';
import type { DesignCategory, Event, EventFormat, TargetRole, TechCategory } from '@/types/event';

interface EventRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  timezone: string;
  format: EventFormat;
  venue: string | null;
  address: string | null;
  region: string | null;
  online_url: string | null;
  target_roles: string;
  tech_categories: string;
  design_categories: string;
  capacity: number | null;
  price: number;
  early_bird_price: number | null;
  early_bird_deadline: string | null;
  official_url: string;
  ticket_url: string | null;
  twitter_hashtag: string | null;
  source: string | null;
  is_premium: number;
  is_featured: number;
  created_at: string;
  updated_at: string;
}

const SELECT_COLUMNS = `
  id,
  slug,
  title,
  description,
  start_date,
  end_date,
  timezone,
  format,
  venue,
  address,
  region,
  online_url,
  target_roles,
  tech_categories,
  design_categories,
  capacity,
  price,
  early_bird_price,
  early_bird_deadline,
  official_url,
  ticket_url,
  twitter_hashtag,
  source,
  is_premium,
  is_featured,
  created_at,
  updated_at
`;

const UPSERT_SQL = `
INSERT INTO events (
  id,
  slug,
  title,
  description,
  start_date,
  end_date,
  timezone,
  format,
  venue,
  address,
  region,
  online_url,
  target_roles,
  tech_categories,
  design_categories,
  capacity,
  price,
  early_bird_price,
  early_bird_deadline,
  official_url,
  ticket_url,
  twitter_hashtag,
  source,
  is_premium,
  is_featured,
  created_at,
  updated_at
) VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
ON CONFLICT(slug) DO UPDATE SET
  id = excluded.id,
  title = excluded.title,
  description = excluded.description,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  timezone = excluded.timezone,
  format = excluded.format,
  venue = excluded.venue,
  address = excluded.address,
  region = excluded.region,
  online_url = excluded.online_url,
  target_roles = excluded.target_roles,
  tech_categories = excluded.tech_categories,
  design_categories = excluded.design_categories,
  capacity = excluded.capacity,
  price = excluded.price,
  early_bird_price = excluded.early_bird_price,
  early_bird_deadline = excluded.early_bird_deadline,
  official_url = excluded.official_url,
  ticket_url = excluded.ticket_url,
  twitter_hashtag = excluded.twitter_hashtag,
  source = excluded.source,
  is_premium = excluded.is_premium,
  is_featured = excluded.is_featured,
  updated_at = excluded.updated_at
`;

interface EnsureStoreOptions {
  seedFromMock?: boolean;
}

function parseJsonArray<T extends string>(value: string): T[] {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is T => typeof item === 'string');
  } catch {
    return [];
  }
}

function normalizeTimestamp(value: string | null | undefined, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function toStatementValues(event: Event): SQLInputValue[] {
  const nowIso = new Date().toISOString();
  const createdAt = normalizeTimestamp(event.created_at, nowIso);
  const updatedAt = normalizeTimestamp(event.updated_at, nowIso);

  return [
    event.id || crypto.randomUUID(),
    event.slug,
    event.title,
    event.description ?? null,
    event.start_date,
    event.end_date ?? null,
    event.timezone,
    event.format,
    event.venue ?? null,
    event.address ?? null,
    event.region ?? null,
    event.online_url ?? null,
    JSON.stringify(event.target_roles ?? []),
    JSON.stringify(event.tech_categories ?? []),
    JSON.stringify(event.design_categories ?? []),
    event.capacity ?? null,
    event.price,
    event.early_bird_price ?? null,
    event.early_bird_deadline ?? null,
    event.official_url,
    event.ticket_url ?? null,
    event.twitter_hashtag ?? null,
    event.source ?? null,
    event.is_premium ? 1 : 0,
    event.is_featured ? 1 : 0,
    createdAt,
    updatedAt,
  ];
}

function mapRowToEvent(row: EventRow): Event {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    start_date: row.start_date,
    end_date: row.end_date,
    timezone: row.timezone,
    format: row.format,
    venue: row.venue,
    address: row.address,
    region: row.region,
    online_url: row.online_url,
    target_roles: parseJsonArray<TargetRole>(row.target_roles),
    tech_categories: parseJsonArray<TechCategory>(row.tech_categories),
    design_categories: parseJsonArray<DesignCategory>(row.design_categories),
    capacity: row.capacity,
    price: row.price,
    early_bird_price: row.early_bird_price,
    early_bird_deadline: row.early_bird_deadline,
    official_url: row.official_url,
    ticket_url: row.ticket_url,
    twitter_hashtag: row.twitter_hashtag,
    source: row.source,
    is_premium: row.is_premium === 1,
    is_featured: row.is_featured === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function upsertEventsToStore(events: Event[]): number {
  if (events.length === 0) {
    return 0;
  }

  const db = getSqliteDb();
  const upsertStatement = db.prepare(UPSERT_SQL);

  db.exec('BEGIN IMMEDIATE');
  try {
    for (const event of events) {
      upsertStatement.run(...toStatementValues(event));
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return events.length;
}

export function getStoredEventCount(): number {
  const db = getSqliteDb();
  const row = db.prepare('SELECT COUNT(*) AS count FROM events').get() as { count: number };
  return row.count;
}

export function ensureEventStore(options?: EnsureStoreOptions): void {
  const seedFromMock = options?.seedFromMock ?? true;
  getSqliteDb();

  if (!seedFromMock) {
    return;
  }

  if (getStoredEventCount() === 0) {
    upsertEventsToStore(mockEvents);
  }
}

export function listEventsFromStore(): Event[] {
  const db = getSqliteDb();
  const rows = db
    .prepare(`SELECT ${SELECT_COLUMNS} FROM events`)
    .all() as unknown as EventRow[];

  return rows.map(mapRowToEvent);
}

export function findEventBySlugFromStore(slug: string): Event | null {
  const db = getSqliteDb();
  const row = db
    .prepare(`SELECT ${SELECT_COLUMNS} FROM events WHERE slug = ? LIMIT 1`)
    .get(slug) as unknown as EventRow | undefined;

  if (!row) {
    return null;
  }

  return mapRowToEvent(row);
}
