import type { Metadata } from 'next';
import { getEventsGroupedByDate } from '@/lib/data/events';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';

interface CalendarPageProps {
  searchParams: Promise<{ month?: string }>;
}

export const metadata: Metadata = {
  title: 'カレンダー',
};

/**
 * カレンダーページ
 * クエリパラメータ month（YYYY-MM形式）から表示月を取得し、
 * その月のイベントをカレンダー形式で表示する
 */
export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const monthParam = params.month;

  // 現在の年月をデフォルト値として取得
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1; // 0-11 を 1-12 に変換

  // month パラメータが存在する場合はパース
  if (monthParam) {
    const match = monthParam.match(/^(\d{4})-(\d{2})$/);
    if (match) {
      const parsedYear = parseInt(match[1], 10);
      const parsedMonth = parseInt(match[2], 10);

      // 有効な年月かチェック（月は1-12の範囲）
      if (parsedMonth >= 1 && parsedMonth <= 12) {
        year = parsedYear;
        month = parsedMonth;
      }
    }
  }

  // 指定月のイベントを日付別にグルーピングして取得
  const eventsByDate = await getEventsGroupedByDate(year, month);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <CalendarGrid year={year} month={month} eventsByDate={eventsByDate} />
    </div>
  );
}
