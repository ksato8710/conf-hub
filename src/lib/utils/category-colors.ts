import type { TechCategory } from '@/types/event';

export interface CategoryColor {
  dot: string;       // ドット用 bg-xxx
  border: string;    // 左ボーダー用 border-l-xxx
  bg: string;        // 背景用 bg-xxx
  text: string;      // テキスト用 text-xxx
}

const CATEGORY_COLOR_MAP: Record<TechCategory, CategoryColor> = {
  'フロントエンド': { dot: 'bg-blue-500', border: 'border-l-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  'バックエンド': { dot: 'bg-emerald-500', border: 'border-l-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'インフラ': { dot: 'bg-amber-500', border: 'border-l-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  'AI・ML': { dot: 'bg-violet-500', border: 'border-l-violet-500', bg: 'bg-violet-50', text: 'text-violet-700' },
  'モバイル': { dot: 'bg-pink-500', border: 'border-l-pink-500', bg: 'bg-pink-50', text: 'text-pink-700' },
  'セキュリティ': { dot: 'bg-red-500', border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  'データ': { dot: 'bg-teal-500', border: 'border-l-teal-500', bg: 'bg-teal-50', text: 'text-teal-700' },
};

const DEFAULT_COLOR: CategoryColor = {
  dot: 'bg-zinc-400', border: 'border-l-zinc-400', bg: 'bg-zinc-50', text: 'text-zinc-600',
};

export function getCategoryColor(category: TechCategory): CategoryColor {
  return CATEGORY_COLOR_MAP[category] ?? DEFAULT_COLOR;
}

export function getPrimaryCategory(categories: TechCategory[]): TechCategory | null {
  return categories.length > 0 ? categories[0] : null;
}

export function getPrimaryCategoryColor(categories: TechCategory[]): CategoryColor {
  const primary = getPrimaryCategory(categories);
  return primary ? getCategoryColor(primary) : DEFAULT_COLOR;
}
