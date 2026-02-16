'use client';

import { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  format,
} from 'date-fns';
import { CalendarNavigation } from './CalendarNavigation';
import { DateCell } from './DateCell';
import { EventsPanel } from './EventsPanel';
import type { Event } from '@/types/event';

interface CalendarGridProps {
  year: number;
  month: number; // 1-12
  eventsByDate: Record<string, Event[]>; // "2026-03-15" → Event[]
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export function CalendarGrid({ year, month, eventsByDate }: CalendarGridProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const currentMonthDate = new Date(year, month - 1, 1);

  // カレンダーの開始日と終了日を計算（前月・次月含む）
  const monthStart = startOfMonth(currentMonthDate);
  const monthEnd = endOfMonth(currentMonthDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 日曜始まり
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // カレンダーに表示する全日付を取得
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // 選択日のイベントを取得
  const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedEvents = selectedDateKey ? (eventsByDate[selectedDateKey] || []) : [];

  return (
    <div>
      <CalendarNavigation year={year} month={month} />

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 bg-zinc-50 border-b border-zinc-200">
          {WEEKDAY_LABELS.map((label, index) => (
            <div
              key={label}
              className={`
                py-3 text-center text-sm font-medium
                ${index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-zinc-700'}
              `}
            >
              {label}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7 gap-0">
          {calendarDays.map((date) => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const eventCount = eventsByDate[dateKey]?.length || 0;

            return (
              <DateCell
                key={dateKey}
                date={date}
                isCurrentMonth={isSameMonth(date, currentMonthDate)}
                isToday={isToday(date)}
                isSelected={selectedDate ? isSameDay(date, selectedDate) : false}
                eventCount={eventCount}
                onClick={() => setSelectedDate(date)}
              />
            );
          })}
        </div>
      </div>

      {/* イベント一覧パネル */}
      <EventsPanel date={selectedDate} events={selectedEvents} />
    </div>
  );
}
