import 'server-only';

import { parseISO, compareAsc, format, eachDayOfInterval } from 'date-fns';
import {
  ensureEventStore,
  findEventBySlugFromStore,
  listEventsFromStore,
} from '@/lib/db/events-repository';
import { applyFilters } from '@/lib/utils/filters';
import type { Event, EventFilters } from '@/types/event';

function sortByStartDateAsc(events: Event[]): Event[] {
  return [...events].sort((a, b) => compareAsc(parseISO(a.start_date), parseISO(b.start_date)));
}

export async function getEvents(filters?: Partial<EventFilters>): Promise<Event[]> {
  ensureEventStore({ seedFromMock: true });
  const sorted = sortByStartDateAsc(listEventsFromStore());

  if (!filters) return sorted;

  const fullFilters: EventFilters = {
    roles: filters.roles ?? [],
    techCategories: filters.techCategories ?? [],
    designCategories: filters.designCategories ?? [],
    format: filters.format ?? null,
    size: filters.size ?? null,
    priceType: filters.priceType ?? null,
    region: filters.region ?? null,
    period: filters.period ?? null,
    keyword: filters.keyword ?? '',
  };

  return applyFilters(sorted, fullFilters);
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  ensureEventStore({ seedFromMock: true });
  return findEventBySlugFromStore(slug);
}

export async function getFeaturedEvents(): Promise<Event[]> {
  ensureEventStore({ seedFromMock: true });
  return sortByStartDateAsc(listEventsFromStore().filter((event) => event.is_featured));
}

export async function getUpcomingEvents(limit: number = 8): Promise<Event[]> {
  ensureEventStore({ seedFromMock: true });
  const allEvents = listEventsFromStore();
  const now = new Date();
  return allEvents
    .filter((e) => parseISO(e.start_date) >= now)
    .sort((a, b) => compareAsc(parseISO(a.start_date), parseISO(b.start_date)))
    .slice(0, limit);
}

/**
 * 指定月のイベントを取得（start_dateがその月に含まれるもの）
 * @param year 年
 * @param month 月（1-12）
 * @returns その月のイベント一覧
 */
export async function getEventsByMonth(year: number, month: number): Promise<Event[]> {
  ensureEventStore({ seedFromMock: true });
  const allEvents = listEventsFromStore();

  // 月の開始日と終了日を計算
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  return allEvents
    .filter((event) => {
      const eventDate = parseISO(event.start_date);
      return eventDate >= monthStart && eventDate <= monthEnd;
    })
    .sort((a, b) => compareAsc(parseISO(a.start_date), parseISO(b.start_date)));
}

/**
 * 日付別にグルーピング（キーは "YYYY-MM-DD" 形式の文字列）
 * @param year 年
 * @param month 月（1-12）
 * @returns 日付をキーとしたイベントのマップ
 */
export async function getEventsGroupedByDate(
  year: number,
  month: number
): Promise<Record<string, Event[]>> {
  const events = await getEventsByMonth(year, month);
  const grouped: Record<string, Event[]> = {};

  for (const event of events) {
    const eventDate = parseISO(event.start_date);
    const dateKey = format(eventDate, 'yyyy-MM-dd');

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  }

  return grouped;
}

/**
 * 指定期間のイベントを日付別にグルーピング
 */
export async function getEventsGroupedByDateRange(
  start: Date,
  end: Date
): Promise<Record<string, Event[]>> {
  ensureEventStore({ seedFromMock: true });
  const allEvents = listEventsFromStore();
  const grouped: Record<string, Event[]> = {};

  const events = allEvents
    .filter((event) => {
      const eventDate = parseISO(event.start_date);
      return eventDate >= start && eventDate <= end;
    })
    .sort((a, b) => compareAsc(parseISO(a.start_date), parseISO(b.start_date)));

  for (const event of events) {
    const dateKey = format(parseISO(event.start_date), 'yyyy-MM-dd');
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  }

  return grouped;
}

/**
 * 今週+翌週の日付配列を取得（14日分）
 */
export function getTwoWeeksDays(): Date[] {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 13);
  return eachDayOfInterval({ start: today, end });
}
