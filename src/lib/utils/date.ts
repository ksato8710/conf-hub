import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, addMonths, parseISO, eachDayOfInterval } from 'date-fns';
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

/**
 * カレンダーグリッド用の日付配列を生成（6行×7列=42日分）
 * 前月末・次月初日を含む
 * @param year 年（例: 2026）
 * @param month 月（1-12）
 * @returns 42日分の日付配列
 */
export function getCalendarDays(year: number, month: number): Date[] {
  // month は 1-12 なので、Date コンストラクタ用に 0-11 に変換
  const targetDate = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);

  // 月の開始日を含む週の日曜日
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  // 月の終了日を含む週の土曜日
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // カレンダーに表示する全ての日付を取得
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

/**
 * "2026年3月" 形式のフォーマット
 * @param year 年
 * @param month 月（1-12）
 * @returns フォーマットされた年月文字列
 */
export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return format(date, 'yyyy年M月', { locale: ja });
}
