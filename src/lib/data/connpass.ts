import { addMonths, format } from 'date-fns';
import type { Event, TechCategory, TargetRole } from '@/types/event';

interface ConnpassEvent {
  event_id: number;
  title: string;
  catch: string;
  description: string;
  event_url: string;
  started_at: string;
  ended_at: string;
  limit: number | null;
  address: string;
  place: string;
  lat: string | null;
  lon: string | null;
  owner_display_name: string;
  event_type: string;
  series: { id: number; title: string; url: string } | null;
  updated_at: string;
}

interface ConnpassResponse {
  results_returned: number;
  results_available: number;
  results_start: number;
  events: ConnpassEvent[];
}

const TECH_KEYWORDS: Record<TechCategory, string[]> = {
  フロントエンド: [
    'react',
    'vue',
    'angular',
    'next',
    'nuxt',
    'css',
    'html',
    'frontend',
    'フロントエンド',
    'svelte',
    'astro',
    'tailwind',
  ],
  バックエンド: [
    'node',
    'go',
    'rust',
    'python',
    'java',
    'ruby',
    'rails',
    'backend',
    'バックエンド',
    'api',
    'graphql',
    'django',
    'spring',
    'laravel',
    'php',
  ],
  インフラ: [
    'aws',
    'gcp',
    'azure',
    'docker',
    'kubernetes',
    'k8s',
    'terraform',
    'infrastructure',
    'インフラ',
    'sre',
    'devops',
    'cloud',
    'クラウド',
  ],
  'AI・ML': [
    'ai',
    'ml',
    'llm',
    'gpt',
    'machine learning',
    '機械学習',
    '生成ai',
    'deep learning',
    'chatgpt',
    'claude',
    'gemini',
    '人工知能',
  ],
  モバイル: ['ios', 'android', 'swift', 'kotlin', 'flutter', 'react native', 'モバイル', 'mobile'],
  セキュリティ: ['security', 'セキュリティ', 'owasp', '脆弱性', 'サイバー', 'cyber'],
  データ: ['data', 'bigquery', 'spark', 'analytics', 'データ分析', 'データベース', 'database', 'sql', 'etl'],
};

const ROLE_KEYWORDS: Record<TargetRole, string[]> = {
  エンジニア: ['エンジニア', 'engineer', 'developer', '開発', 'プログラ', 'コード', 'code', 'tech'],
  デザイナー: ['デザイン', 'design', 'ui', 'ux', 'figma', 'sketch'],
  PM: ['プロダクトマネ', 'product manager', 'pm', 'プロジェクトマネ'],
  マーケター: ['マーケ', 'market', 'growth', 'グロース'],
  全般: ['カンファレンス', 'conference', 'summit', 'fest'],
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u3000-\u9FFF\s-]/g, '')
    .replace(/[\s\u3000]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

function classifyTechCategories(title: string, description: string): TechCategory[] {
  const text = `${title} ${description}`.toLowerCase();
  const categories: TechCategory[] = [];

  for (const [category, keywords] of Object.entries(TECH_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      categories.push(category as TechCategory);
    }
  }

  return categories;
}

function classifyRoles(title: string, description: string): TargetRole[] {
  const text = `${title} ${description}`.toLowerCase();
  const roles: TargetRole[] = [];

  for (const [role, keywords] of Object.entries(ROLE_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      roles.push(role as TargetRole);
    }
  }

  return roles.length > 0 ? roles : ['全般'];
}

function guessRegion(address: string, place: string): string | null {
  const text = `${address} ${place}`;

  if (
    text.includes('東京') ||
    text.includes('渋谷') ||
    text.includes('新宿') ||
    text.includes('六本木') ||
    text.includes('品川') ||
    text.includes('秋葉原')
  ) {
    return '東京';
  }
  if (text.includes('大阪') || text.includes('梅田') || text.includes('難波')) {
    return '大阪';
  }
  if (text.includes('名古屋')) {
    return '名古屋';
  }
  if (text.includes('福岡') || text.includes('博多') || text.includes('天神')) {
    return '福岡';
  }
  if (text.includes('オンライン') || text.includes('online') || !address) {
    return 'オンライン';
  }

  return 'その他';
}

function guessFormat(address: string, place: string, description: string): 'online' | 'offline' | 'hybrid' {
  const text = `${address} ${place} ${description}`.toLowerCase();
  const hasOnline =
    text.includes('オンライン') ||
    text.includes('online') ||
    text.includes('zoom') ||
    text.includes('youtube');
  const hasOffline = address.length > 0 && !['オンライン', 'online'].some((kw) => address.toLowerCase().includes(kw));

  if (hasOnline && hasOffline) return 'hybrid';
  if (hasOnline) return 'online';
  return 'offline';
}

function isLikelyConference(title: string, limit: number | null): boolean {
  const confKeywords = ['カンファレンス', 'conference', 'conf', 'summit', 'fest', 'フォーラム', 'forum', 'day', 'week'];
  const titleLower = title.toLowerCase();
  const hasKeyword = confKeywords.some((keyword) => titleLower.includes(keyword));
  const isLargeEvent = limit !== null && limit >= 50;
  return hasKeyword || isLargeEvent;
}

function mapToEvent(connpassEvent: ConnpassEvent): Event {
  const title = connpassEvent.title;
  const description = connpassEvent.description.replace(/<[^>]*>/g, '').substring(0, 500);
  const slug = `${slugify(title)}-${connpassEvent.event_id}`;
  const nowIso = new Date().toISOString();

  return {
    id: `connpass-${connpassEvent.event_id}`,
    slug,
    title,
    description,
    start_date: connpassEvent.started_at,
    end_date: connpassEvent.ended_at || null,
    timezone: 'Asia/Tokyo',
    format: guessFormat(connpassEvent.address, connpassEvent.place, description),
    venue: connpassEvent.place || null,
    address: connpassEvent.address || null,
    region: guessRegion(connpassEvent.address, connpassEvent.place),
    online_url: null,
    target_roles: classifyRoles(title, description),
    tech_categories: classifyTechCategories(title, description),
    design_categories: [],
    capacity: connpassEvent.limit,
    price: 0,
    early_bird_price: null,
    early_bird_deadline: null,
    official_url: connpassEvent.event_url,
    ticket_url: connpassEvent.event_url,
    twitter_hashtag: null,
    source: 'connpass',
    is_premium: false,
    is_featured: false,
    created_at: nowIso,
    updated_at: nowIso,
  };
}

export function buildTargetMonths(baseDate: Date = new Date(), monthCount: number = 6): string[] {
  return Array.from({ length: monthCount }, (_, index) => format(addMonths(baseDate, index), 'yyyyMM'));
}

export function parseTargetMonths(text: string): string[] {
  const months = text
    .split(',')
    .map((value) => value.trim())
    .filter((value) => /^\d{6}$/.test(value));

  return Array.from(new Set(months));
}

export async function fetchConnpassEventsByMonth(ym: string): Promise<ConnpassEvent[]> {
  const params = new URLSearchParams({
    keyword: 'カンファレンス',
    keyword_or: 'conference,conf,summit,fest',
    count: '100',
    order: '2',
    ym,
  });

  const url = `https://connpass.com/api/v1/event/?${params}`;
  console.error(`[connpass] fetching ${url}`);

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'ConfHub/0.1 (+https://localhost)',
    },
  });
  if (!response.ok) {
    console.error(`[connpass] error ${response.status} ${response.statusText}`);
    return [];
  }

  const payload = (await response.json()) as ConnpassResponse;
  console.error(`[connpass] month=${ym} fetched=${payload.results_returned} available=${payload.results_available}`);
  return payload.events;
}

export async function collectConnpassConferences(
  targetMonths: string[],
  requestIntervalMs: number = 1000
): Promise<Event[]> {
  const allEvents: ConnpassEvent[] = [];

  for (const ym of targetMonths) {
    const events = await fetchConnpassEventsByMonth(ym);
    allEvents.push(...events);
    if (requestIntervalMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, requestIntervalMs));
    }
  }

  const conferences = allEvents.filter((event) => isLikelyConference(event.title, event.limit));
  const seen = new Set<number>();
  const unique = conferences.filter((event) => {
    if (seen.has(event.event_id)) {
      return false;
    }
    seen.add(event.event_id);
    return true;
  });

  return unique.map(mapToEvent);
}
