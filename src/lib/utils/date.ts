import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, addMonths, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { TimePeriod } from '@/types/event';

export function formatEventDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'yyyy年M月d日(E)', { locale: ja });
}

export function formatEventDateTime(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'yyyy年M月d日(E) HH:mm', { locale: ja });
}

export function formatEventDateShort(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'M/d(E)', { locale: ja });
}

export function getDateRange(period: TimePeriod): { start: Date; end: Date } {
  const now = new Date();

  switch (period) {
    case 'this_week':
      return {
        start: startOfWeek(now, { locale: ja }),
        end: endOfWeek(now, { locale: ja }),
      };
    case 'next_week': {
      const nextWeek = addWeeks(now, 1);
      return {
        start: startOfWeek(nextWeek, { locale: ja }),
        end: endOfWeek(nextWeek, { locale: ja }),
      };
    }
    case 'this_month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
    case 'next_month': {
      const nextMonth = addMonths(now, 1);
      return {
        start: startOfMonth(nextMonth),
        end: endOfMonth(nextMonth),
      };
    }
  }
}
