import Link from 'next/link';
import { FeaturedEvents } from '@/components/events/FeaturedEvents';
import { EventCard } from '@/components/events/EventCard';
import { getUpcomingEvents } from '@/lib/data/events';
import type { TechCategory } from '@/types/event';

const TECH_CATEGORY_CARDS: { category: TechCategory; icon: string }[] = [
  { category: 'フロントエンド', icon: '🖥' },
  { category: 'バックエンド', icon: '⚙' },
  { category: 'インフラ', icon: '☁' },
  { category: 'AI・ML', icon: '🤖' },
  { category: 'モバイル', icon: '📱' },
  { category: 'セキュリティ', icon: '🔒' },
  { category: 'データ', icon: '📊' },
];

export default async function Home() {
  const upcomingEvents = await getUpcomingEvents(8);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            技術カンファレンスを、もっと見つけやすく。
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            職種・技術・形式・規模で自在にフィルタリング。気になるイベントはワンクリックでカレンダーに追加。
          </p>
          <Link
            href="/events"
            className="inline-block bg-white text-blue-600 rounded-full px-8 py-3 font-semibold hover:bg-blue-50 transition-colors"
          >
            イベントを探す →
          </Link>
        </div>
      </section>

      {/* Featured Events */}
      <FeaturedEvents />

      {/* Upcoming Events */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">直近開催</h2>
            <Link
              href="/events"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              すべてのイベントを見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Category Quick Access */}
      <section className="py-12 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">カテゴリから探す</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {TECH_CATEGORY_CARDS.map(({ category, icon }) => (
              <Link
                key={category}
                href={`/events?techCategories=${encodeURIComponent(category)}`}
                className="flex flex-col items-center gap-2 p-4 bg-white border border-zinc-200 rounded-xl hover:shadow-md transition-shadow text-center"
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-sm font-medium text-zinc-700">{category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
