import { getFeaturedEvents } from '@/lib/data/events';
import { EventCard } from '@/components/events/EventCard';

export async function FeaturedEvents() {
  const events = await getFeaturedEvents();

  if (events.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">注目イベント</h2>
        <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4">
          {events.map((event) => (
            <div key={event.id} className="min-w-[300px] snap-start shrink-0">
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
