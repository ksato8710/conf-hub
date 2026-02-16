'use client';

import { format } from 'date-fns';
import type { TechCategory } from '@/types/event';
import { getCategoryColor } from '@/lib/utils/category-colors';

interface DateCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  eventCount: number;
  categories: TechCategory[];
  onClick: () => void;
}

export function DateCell({
  date,
  isCurrentMonth,
  isToday: today,
  isSelected,
  eventCount,
  categories,
  onClick,
}: DateCellProps) {
  const dayNumber = format(date, 'd');
  const dayOfWeek = date.getDay();
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;

  // カテゴリごとのユニーク色ドット（最大3つ）
  const uniqueCategories = [...new Set(categories)].slice(0, 3);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative min-h-[84px] md:min-h-[96px] p-2 transition-all duration-200
        border-b border-r border-zinc-100
        ${isSelected
          ? 'bg-blue-50 ring-2 ring-inset ring-blue-500 z-10'
          : today
            ? 'bg-amber-50/50'
            : 'bg-white hover:bg-zinc-50'
        }
        ${!isCurrentMonth ? 'opacity-30' : 'cursor-pointer'}
      `}
      aria-label={`${format(date, 'yyyy年M月d日')} ${eventCount > 0 ? `${eventCount}件のイベント` : ''}`}
    >
      <div className="flex flex-col items-center h-full">
        {/* 日付番号 */}
        <span
          className={`
            inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full
            ${today
              ? 'bg-blue-600 text-white font-bold'
              : isSelected
                ? 'text-blue-700 font-bold'
                : isSunday && isCurrentMonth
                  ? 'text-red-500'
                  : isSaturday && isCurrentMonth
                    ? 'text-blue-500'
                    : isCurrentMonth
                      ? 'text-zinc-800'
                      : 'text-zinc-300'
            }
          `}
        >
          {dayNumber}
        </span>

        {/* カテゴリ色ドット */}
        {eventCount > 0 && isCurrentMonth && (
          <div className="mt-auto flex flex-col items-center gap-1">
            {eventCount <= 3 ? (
              <div className="flex gap-0.5">
                {uniqueCategories.map((cat, i) => {
                  const color = getCategoryColor(cat);
                  return (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${color.dot} transition-transform hover:scale-125`}
                    />
                  );
                })}
              </div>
            ) : (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {eventCount}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
