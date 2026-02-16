'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { EventCard } from '@/components/events/EventCard';
import type { Event } from '@/types/event';

interface EventsPanelProps {
  date: Date | null;
  events: Event[];
}

export function EventsPanel({ date, events }: EventsPanelProps) {
  if (!date) {
    return (
      <div className="mt-8 p-8 border border-zinc-200 rounded-xl bg-zinc-50">
        <p className="text-center text-zinc-500">
          日付を選択してイベントを表示
        </p>
      </div>
    );
  }

  const dateText = format(date, 'yyyy年M月d日（E）', { locale: ja });

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-zinc-900 mb-4">
        {dateText}のイベント
        {events.length > 0 && (
          <span className="ml-2 text-sm font-normal text-zinc-500">
            ({events.length}件)
          </span>
        )}
      </h3>

      {events.length === 0 ? (
        <div className="p-8 border border-zinc-200 rounded-xl bg-zinc-50">
          <p className="text-center text-zinc-500">
            この日のイベントはありません
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
