import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, ExternalLink, Tag, Ticket } from 'lucide-react';
import { getEventBySlug } from '@/lib/data/events';
import { formatEventDateTime } from '@/lib/utils/date';
import { buildGoogleCalendarUrl } from '@/lib/utils/calendar';
import { Badge } from '@/components/ui/Badge';
import type { Metadata } from 'next';
import type { EventFormat } from '@/types/event';

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: 'イベントが見つかりません' };

  return {
    title: event.title,
    description: event.description?.slice(0, 120) ?? '',
    openGraph: {
      title: `${event.title} | ConfHub`,
      description: event.description?.slice(0, 120) ?? '',
      type: 'website',
    },
  };
}

const formatLabels: Record<EventFormat, { label: string; variant: 'success' | 'warning' | 'primary' }> = {
  online: { label: 'オンライン', variant: 'success' },
  offline: { label: 'オフライン', variant: 'warning' },
  hybrid: { label: 'ハイブリッド', variant: 'primary' },
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  const formatConfig = formatLabels[event.format];
  const calendarUrl = buildGoogleCalendarUrl(event);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
        <Link href="/" className="hover:text-zinc-700 transition-colors">
          ホーム
        </Link>
        <span>/</span>
        <Link href="/events" className="hover:text-zinc-700 transition-colors">
          イベント一覧
        </Link>
        <span>/</span>
        <span className="text-zinc-700 truncate">{event.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={formatConfig.variant} size="md">
            {formatConfig.label}
          </Badge>
          {event.is_premium && (
            <Badge variant="warning" size="md">
              プレミアム
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold">{event.title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-8">
          {/* Date */}
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              日時
            </h2>
            <p className="text-zinc-700">
              {formatEventDateTime(event.start_date)}
              {event.end_date && (
                <> 〜 {formatEventDateTime(event.end_date)}</>
              )}
            </p>
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Calendar className="w-4 h-4" />
              Googleカレンダーに追加
            </a>
          </section>

          {/* Location */}
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              場所
            </h2>
            {(event.format === 'offline' || event.format === 'hybrid') && event.venue && (
              <div className="text-zinc-700">
                <p className="font-medium">{event.venue}</p>
                {event.address && <p className="text-sm text-zinc-500">{event.address}</p>}
              </div>
            )}
            {(event.format === 'online' || event.format === 'hybrid') && (
              <div className={event.format === 'hybrid' ? 'mt-2' : ''}>
                <p className="text-zinc-700">オンライン開催</p>
                {event.online_url && (
                  <a
                    href={event.online_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    配信URLを確認
                  </a>
                )}
              </div>
            )}
          </section>

          {/* Description */}
          {event.description && (
            <section>
              <h2 className="text-lg font-semibold mb-3">概要</h2>
              <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </section>
          )}

          {/* Categories */}
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              カテゴリ
            </h2>
            <div className="space-y-2">
              {event.target_roles.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-zinc-500 w-16">職種</span>
                  {event.target_roles.map((role) => (
                    <Badge key={role} variant="primary" size="sm">
                      {role}
                    </Badge>
                  ))}
                </div>
              )}
              {event.tech_categories.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-zinc-500 w-16">技術</span>
                  {event.tech_categories.map((cat) => (
                    <Badge key={cat} variant="default" size="sm">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
              {event.design_categories.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-zinc-500 w-16">デザイン</span>
                  {event.design_categories.map((cat) => (
                    <Badge key={cat} variant="default" size="sm">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participation Info */}
          <div className="border border-zinc-200 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              参加情報
            </h3>

            <div>
              <span className="text-sm text-zinc-500">参加費</span>
              <p className="text-lg font-bold">
                {event.price === 0 ? '無料' : `¥${event.price.toLocaleString()}`}
              </p>
            </div>

            {event.early_bird_price !== null && event.early_bird_deadline && (
              <div>
                <span className="text-sm text-zinc-500">早割</span>
                <p className="font-medium text-green-700">
                  ¥{event.early_bird_price.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-400">
                  {formatEventDateTime(event.early_bird_deadline)}まで
                </p>
              </div>
            )}

            {event.capacity && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-700">{event.capacity}名</span>
              </div>
            )}
          </div>

          {/* Links */}
          <div className="space-y-3">
            <a
              href={event.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              公式サイトを見る
            </a>

            {event.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full border border-blue-600 text-blue-600 rounded-lg px-4 py-3 font-medium hover:bg-blue-50 transition-colors"
              >
                <Ticket className="w-4 h-4" />
                チケットを購入
              </a>
            )}

            {event.twitter_hashtag && (
              <a
                href={`https://twitter.com/search?q=${encodeURIComponent(event.twitter_hashtag)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full text-sm text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                {event.twitter_hashtag}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
