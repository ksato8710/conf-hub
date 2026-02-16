import { parseISO, addHours, format } from 'date-fns';
import type { Event } from '@/types/event';

function toGoogleCalendarDatetime(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
}

export function buildGoogleCalendarUrl(event: Event): string {
  const startDate = parseISO(event.start_date);
  const endDate = event.end_date ? parseISO(event.end_date) : addHours(startDate, 1);

  const startUtc = new Date(startDate.toISOString());
  const endUtc = new Date(endDate.toISOString());

  const details = [event.description, event.official_url].filter(Boolean).join('\n\n');

  const location = [event.venue, event.address].filter(Boolean).join(' ');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toGoogleCalendarDatetime(startUtc)}/${toGoogleCalendarDatetime(endUtc)}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
