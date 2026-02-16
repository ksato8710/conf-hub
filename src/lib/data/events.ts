import { parseISO, compareAsc } from 'date-fns';
import { mockEvents } from '@/lib/data/mock-events';
import { applyFilters } from '@/lib/utils/filters';
import type { Event, EventFilters } from '@/types/event';

export async function getEvents(filters?: Partial<EventFilters>): Promise<Event[]> {
  const sorted = [...mockEvents].sort((a, b) =>
    compareAsc(parseISO(a.start_date), parseISO(b.start_date))
  );

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
  return mockEvents.find((e) => e.slug === slug) ?? null;
}

export async function getFeaturedEvents(): Promise<Event[]> {
  return mockEvents
    .filter((e) => e.is_featured)
    .sort((a, b) => compareAsc(parseISO(a.start_date), parseISO(b.start_date)));
}

export async function getUpcomingEvents(limit: number = 8): Promise<Event[]> {
  const now = new Date();
  return mockEvents
    .filter((e) => parseISO(e.start_date) >= now)
    .sort((a, b) => compareAsc(parseISO(a.start_date), parseISO(b.start_date)))
    .slice(0, limit);
}
