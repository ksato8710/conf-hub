import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatEventDateShort } from '@/lib/utils/date';
import type { Event, EventFormat } from '@/types/event';

interface EventCardProps {
  event: Event;
}

const formatBadgeConfig: Record<EventFormat, { label: string; variant: 'success' | 'warning' | 'primary' }> = {
  online: { label: 'オンライン', variant: 'success' },
  offline: { label: 'オフライン', variant: 'warning' },
  hybrid: { label: 'ハイブリッド', variant: 'primary' },
};

export function EventCard({ event }: EventCardProps) {
  const formatConfig = formatBadgeConfig[event.format];

  const allCategories = [
    ...event.target_roles,
    ...event.tech_categories,
  ];
  const visibleCategories = allCategories.slice(0, 3);
  const remainingCount = allCategories.length - 3;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="block border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-2 mb-3">
        <Badge variant={formatConfig.variant} size="sm">
          {formatConfig.label}
        </Badge>
        {event.is_featured && (
          <Badge variant="warning" size="sm">
            注目
          </Badge>
        )}
      </div>

      <h3 className="text-lg font-semibold line-clamp-2 mb-3">{event.title}</h3>

      <div className="flex items-center gap-1.5 text-sm text-zinc-500 mb-1.5">
        <Calendar className="w-4 h-4 shrink-0" />
        <span>{formatEventDateShort(event.start_date)}</span>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-zinc-500 mb-3">
        <MapPin className="w-4 h-4 shrink-0" />
        <span>{event.venue || 'オンライン'}</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {visibleCategories.map((cat) => (
          <Badge key={cat} variant="default" size="sm">
            {cat}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <span className="text-xs text-zinc-400">+{remainingCount}</span>
        )}
      </div>

      <div className="text-right text-sm font-medium text-zinc-700">
        {event.price === 0 ? '無料' : `¥${event.price.toLocaleString()}`}
      </div>
    </Link>
  );
}
