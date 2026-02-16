'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { getPrimaryCategoryColor } from '@/lib/utils/category-colors';
import { formatEventDateShort } from '@/lib/utils/date';
import type { Event, EventFormat } from '@/types/event';

interface EventsPanelProps {
  date: Date | null;
  events: Event[];
}

const formatBadgeConfig: Record<EventFormat, { label: string; variant: 'success' | 'warning' | 'primary' }> = {
  online: { label: 'オンライン', variant: 'success' },
  offline: { label: 'オフライン', variant: 'warning' },
  hybrid: { label: 'ハイブリッド', variant: 'primary' },
};

export function EventsPanel({ date, events }: EventsPanelProps) {
  if (!date) {
    return (
      <div className="mt-6 p-8 border border-dashed border-zinc-300 rounded-xl bg-zinc-50/50">
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <Calendar className="w-8 h-8" />
          <p className="text-sm">日付をクリックしてイベントを表示</p>
        </div>
      </div>
    );
  }

  const dateText = format(date, 'M月d日（E）', { locale: ja });

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-zinc-900">
          {dateText}
          {events.length > 0 && (
            <span className="ml-2 text-sm font-normal text-zinc-400">
              {events.length}件のイベント
            </span>
          )}
        </h3>
      </div>

      {events.length === 0 ? (
        <div className="p-8 border border-dashed border-zinc-300 rounded-xl bg-zinc-50/50">
          <p className="text-center text-sm text-zinc-400">
            この日のイベントはありません
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {events.map((event) => {
            const formatConfig = formatBadgeConfig[event.format];
            const categoryColor = getPrimaryCategoryColor(event.tech_categories);

            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className={`
                  block border border-zinc-200 rounded-xl p-4 pl-0 overflow-hidden
                  transition-all duration-200
                  hover:-translate-y-0.5 hover:shadow-lg hover:border-zinc-300
                  group
                `}
              >
                <div className="flex">
                  {/* カテゴリ色の左ボーダー */}
                  <div className={`w-1 shrink-0 rounded-l-xl ${categoryColor.dot}`} />

                  <div className="pl-4 flex-1 min-w-0">
                    {/* バッジ行 */}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={formatConfig.variant} size="sm">
                        {formatConfig.label}
                      </Badge>
                      {event.is_featured && (
                        <Badge variant="warning" size="sm">注目</Badge>
                      )}
                      {event.price === 0 && (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          無料
                        </span>
                      )}
                    </div>

                    {/* タイトル */}
                    <h4 className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                      {event.title}
                    </h4>

                    {/* メタ情報 */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatEventDateShort(event.start_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.venue || 'オンライン'}
                      </span>
                      {event.price > 0 && (
                        <span className="font-medium text-zinc-700">
                          ¥{event.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* カテゴリタグ */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {[...event.target_roles.slice(0, 1), ...event.tech_categories.slice(0, 2)].map((tag) => (
                        <span key={tag} className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 矢印 */}
                  <div className="flex items-center px-3 text-zinc-300 group-hover:text-blue-500 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
