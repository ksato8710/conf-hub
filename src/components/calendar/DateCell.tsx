'use client';

import { format } from 'date-fns';

interface DateCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  eventCount: number;
  onClick: () => void;
}

export function DateCell({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  eventCount,
  onClick,
}: DateCellProps) {
  const dayNumber = format(date, 'd');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative min-h-[80px] p-2 border border-zinc-200 rounded-lg
        transition-all cursor-pointer
        hover:shadow-sm
        ${isToday ? 'bg-blue-50 font-semibold' : 'bg-white'}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
        ${!isCurrentMonth ? 'opacity-40' : ''}
      `}
      aria-label={`${format(date, 'yyyy年M月d日')} ${eventCount > 0 ? `${eventCount}件のイベント` : ''}`}
    >
      <div className="flex flex-col h-full">
        <span
          className={`
            text-sm mb-1
            ${isToday ? 'text-blue-700' : isCurrentMonth ? 'text-zinc-900' : 'text-zinc-300'}
          `}
        >
          {dayNumber}
        </span>

        {eventCount > 0 && isCurrentMonth && (
          <div className="mt-auto flex items-center justify-center">
            {eventCount <= 2 ? (
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(eventCount, 2) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-blue-500"
                  />
                ))}
              </div>
            ) : (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {eventCount}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
