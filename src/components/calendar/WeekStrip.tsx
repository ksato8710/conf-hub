'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  format,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar, ArrowRight } from 'lucide-react';
import { EventCard } from '@/components/events/EventCard';
import { getPrimaryCategoryColor } from '@/lib/utils/category-colors';
import type { Event } from '@/types/event';

interface WeekStripProps {
  days: Date[];
  eventsByDate: Record<string, Event[]>;
}

export function WeekStrip({ days, eventsByDate }: WeekStripProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedEvents = selectedDateKey ? (eventsByDate[selectedDateKey] || []) : [];

  // 当週の開始日と翌週の開始日を計算
  const midPoint = Math.floor(days.length / 2);

  return (
    <div>
      {/* 週ストリップ */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
        {days.map((date, index) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const events = eventsByDate[dateKey] || [];
          const today = isToday(date);
          const selected = selectedDate ? isSameDay(date, selectedDate) : false;

          // カテゴリ色ドット（最大3つ）
          const uniqueColors = [...new Set(
            events.flatMap(e => e.tech_categories).map(cat => getPrimaryCategoryColor([cat]).dot)
          )].slice(0, 3);

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(selected ? null : date)}
              className={`
                flex flex-col items-center min-w-[52px] py-2.5 px-2 rounded-xl transition-all
                ${index === midPoint ? 'ml-2' : ''}
                ${selected
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : today
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-white hover:bg-zinc-50 text-zinc-700'
                }
                ${selected ? '' : 'border border-zinc-200'}
              `}
            >
              <span className={`text-[10px] font-medium mb-0.5 ${
                selected ? 'text-blue-100' : 'text-zinc-400'
              }`}>
                {format(date, 'E', { locale: ja })}
              </span>
              <span className={`text-lg font-bold leading-tight ${
                today && !selected ? 'text-blue-600' : ''
              }`}>
                {format(date, 'd')}
              </span>
              {/* カテゴリ色ドット */}
              <div className="flex gap-0.5 mt-1 h-2">
                {uniqueColors.length > 0 ? (
                  uniqueColors.map((color, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${selected ? 'bg-white/80' : color}`}
                    />
                  ))
                ) : (
                  <div className="w-1.5 h-1.5" /> // スペーサー
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 選択日のイベント表示 */}
      {selectedDate && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="text-sm font-semibold text-zinc-700 mb-3">
            {format(selectedDate, 'M月d日（E）', { locale: ja })}のイベント
            {selectedEvents.length > 0 && (
              <span className="ml-1 text-zinc-400 font-normal">({selectedEvents.length}件)</span>
            )}
          </h4>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-zinc-400 py-4 text-center">この日のイベントはありません</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {selectedEvents.slice(0, 4).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* カレンダーへの導線 */}
      <div className="mt-4 flex justify-end">
        <Link
          href="/calendar"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group"
        >
          <Calendar className="w-4 h-4" />
          カレンダーで詳しく見る
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
