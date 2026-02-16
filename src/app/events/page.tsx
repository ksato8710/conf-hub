import { Suspense } from 'react';
import Link from 'next/link';
import { getEvents } from '@/lib/data/events';
import { parseFiltersFromParams } from '@/lib/utils/filters';
import { EventList } from '@/components/events/EventList';
import { FilterBar } from '@/components/filters/FilterBar';

interface EventsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata = {
  title: 'イベント一覧',
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      urlParams.set(key, value);
    } else if (Array.isArray(value)) {
      urlParams.set(key, value.join(','));
    }
  }

  const filters = parseFiltersFromParams(urlParams);
  const events = await getEvents(filters);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">イベント一覧</h1>

      <Suspense fallback={null}>
        <FilterBar initialFilters={filters} />
      </Suspense>

      <div className="mt-6 mb-4">
        <p className="text-sm text-zinc-500">{events.length}件のイベント</p>
      </div>

      {events.length > 0 ? (
        <EventList events={events} />
      ) : (
        <div className="text-center py-16">
          <p className="text-zinc-500 mb-4">
            条件に一致するイベントが見つかりませんでした
          </p>
          <Link
            href="/events"
            className="inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            フィルタをリセット
          </Link>
        </div>
      )}
    </div>
  );
}
