import Link from 'next/link';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          ConfHub
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/events"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
          >
            イベント一覧
          </Link>
          <Link
            href="/calendar"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
          >
            カレンダー
          </Link>
        </nav>
      </div>
    </header>
  );
}
