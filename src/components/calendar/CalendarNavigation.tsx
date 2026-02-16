'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface CalendarNavigationProps {
  year: number;
  month: number; // 1-12
}

export function CalendarNavigation({ year, month }: CalendarNavigationProps) {
  const router = useRouter();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const isCurrentMonth = year === currentYear && month === currentMonth;

  const displayDate = new Date(year, month - 1, 1);
  const displayText = format(displayDate, 'yyyy年M月', { locale: ja });

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
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          aria-label="前月へ"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-700" />
        </button>

        <h2 className="text-xl font-semibold text-zinc-900 min-w-[140px] text-center">
          {displayText}
        </h2>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          aria-label="次月へ"
        >
          <ChevronRight className="w-5 h-5 text-zinc-700" />
        </button>
      </div>

      {!isCurrentMonth && (
        <button
          type="button"
          onClick={handleToday}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          今月に戻る
        </button>
      )}
    </div>
  );
}
