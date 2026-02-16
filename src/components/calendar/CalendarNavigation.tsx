'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface CalendarNavigationProps {
  year: number;
  month: number;
}

export function CalendarNavigation({ year, month }: CalendarNavigationProps) {
  const router = useRouter();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const isCurrentMonth = year === currentYear && month === currentMonth;

  const displayDate = new Date(year, month - 1, 1);
  const yearText = format(displayDate, 'yyyy', { locale: ja });
  const monthText = format(displayDate, 'M月', { locale: ja });

  const handlePrevMonth = () => {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    router.push(`/calendar?month=${prevYear}-${String(prevMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    router.push(`/calendar?month=${nextYear}-${String(nextMonth).padStart(2, '0')}`);
  };

  const handleToday = () => {
    router.push('/calendar');
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
          aria-label="前月へ"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </button>

        <div className="min-w-[160px] text-center">
          <span className="text-sm text-zinc-400 block leading-tight">{yearText}</span>
          <span className="text-2xl font-bold text-zinc-900 leading-tight">{monthText}</span>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
          aria-label="次月へ"
        >
          <ChevronRight className="w-5 h-5 text-zinc-600" />
        </button>
      </div>

      {!isCurrentMonth && (
        <button
          type="button"
          onClick={handleToday}
          className="px-4 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-full transition-colors"
        >
          今月に戻る
        </button>
      )}
    </div>
  );
}
