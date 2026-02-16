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
  format,
} from 'date-fns';
import { CalendarNavigation } from './CalendarNavigation';
import { DateCell } from './DateCell';
import { EventsPanel } from './EventsPanel';
import type { Event } from '@/types/event';

interface CalendarGridProps {
  year: number;
  month: number;
  eventsByDate: Record<string, Event[]>;
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export function CalendarGrid({ year, month, eventsByDate }: CalendarGridProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const currentMonthDate = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(currentMonthDate);
  const monthEnd = endOfMonth(currentMonthDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedEvents = selectedDateKey ? (eventsByDate[selectedDateKey] || []) : [];

  // 月内の総イベント数を計算
  const totalEvents = Object.values(eventsByDate).reduce((sum, events) => sum + events.length, 0);

  return (
    <div>
      <CalendarNavigation year={year} month={month} />

      {/* カレンダー情報バー */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-zinc-500">
          {totalEvents > 0 ? `${totalEvents}件のイベント` : 'イベントなし'}
        </p>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            今日
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            カテゴリ
          </span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 bg-zinc-50/80 border-b border-zinc-200">
          {WEEKDAY_LABELS.map((label, index) => (
            <div
              key={label}
              className={`
                py-2.5 text-center text-xs font-semibold tracking-wider uppercase
                ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-zinc-500'}
              `}
            >
              {label}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date) => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayEvents = eventsByDate[dateKey] || [];
            const eventCount = dayEvents.length;
            const categories = dayEvents.flatMap(e => e.tech_categories);

            return (
              <DateCell
                key={dateKey}
                date={date}
                isCurrentMonth={isSameMonth(date, currentMonthDate)}
                isToday={isToday(date)}
                isSelected={selectedDate ? isSameDay(date, selectedDate) : false}
                eventCount={eventCount}
                categories={categories}
                onClick={() => setSelectedDate(
                  selectedDate && isSameDay(date, selectedDate) ? null : date
                )}
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
