'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useCallback, useMemo } from 'react';
import { Search } from 'lucide-react';
import { FilterChip } from '@/components/ui/FilterChip';
import { parseFiltersFromParams, buildFilterParams } from '@/lib/utils/filters';
import type {
  EventFilters,
  TargetRole,
  TechCategory,
  DesignCategory,
  EventFormat,
  Region,
  PriceType,
  TimePeriod,
} from '@/types/event';

interface FilterBarProps {
  initialFilters: EventFilters;
}

const TARGET_ROLES: TargetRole[] = ['エンジニア', 'デザイナー', 'PM', 'マーケター', '全般'];
const TECH_CATEGORIES: TechCategory[] = ['フロントエンド', 'バックエンド', 'インフラ', 'AI・ML', 'モバイル', 'セキュリティ', 'データ'];
const DESIGN_CATEGORIES: DesignCategory[] = ['UI/UX', 'グラフィック', 'ブランディング', 'プロダクトデザイン'];
const EVENT_FORMATS: { value: EventFormat; label: string }[] = [
  { value: 'online', label: 'オンライン' },
  { value: 'offline', label: 'オフライン' },
  { value: 'hybrid', label: 'ハイブリッド' },
];
const REGIONS: Region[] = ['東京', '大阪', '名古屋', '福岡', 'その他', 'オンライン'];
const PRICE_TYPES: { value: PriceType; label: string }[] = [
  { value: 'free', label: '無料' },
  { value: 'paid', label: '有料' },
  { value: 'early_bird', label: '早割あり' },
];
const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 'this_week', label: '今週' },
  { value: 'next_week', label: '来週' },
  { value: 'this_month', label: '今月' },
  { value: 'next_month', label: '来月' },
];

export function FilterBar({ initialFilters }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentFilters = useMemo(
    () => parseFiltersFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  const [filters, setFilters] = useState<EventFilters>(initialFilters);
  const [keyword, setKeyword] = useState(initialFilters.keyword);

  // Sync filters from URL without useEffect + setState
  if (
    JSON.stringify(currentFilters) !== JSON.stringify(filters) &&
    JSON.stringify(currentFilters) !== JSON.stringify(initialFilters)
  ) {
    setFilters(currentFilters);
    setKeyword(currentFilters.keyword);
  }

  const pushFilters = useCallback(
    (newFilters: EventFilters) => {
      const params = buildFilterParams(newFilters);
      router.push(params ? `${pathname}?${params}` : pathname);
    },
    [router, pathname]
  );

  const handleKeywordChange = useCallback(
    (value: string) => {
      setKeyword(value);
      const timer = setTimeout(() => {
        const newFilters = { ...filters, keyword: value };
        setFilters(newFilters);
        pushFilters(newFilters);
      }, 300);
      return () => clearTimeout(timer);
    },
    [filters, pushFilters]
  );

  const toggleMulti = <T extends string>(
    key: 'roles' | 'techCategories' | 'designCategories',
    value: T
  ) => {
    const current = filters[key] as T[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const newFilters = { ...filters, [key]: next };
    setFilters(newFilters);
    pushFilters(newFilters);
  };

  const toggleSingle = <T extends string>(
    key: 'format' | 'region' | 'priceType' | 'period',
    value: T
  ) => {
    const newFilters = {
      ...filters,
      [key]: filters[key] === value ? null : value,
    };
    setFilters(newFilters);
    pushFilters(newFilters);
  };

  const clearAll = () => {
    const cleared: EventFilters = {
      roles: [],
      techCategories: [],
      designCategories: [],
      format: null,
      size: null,
      priceType: null,
      region: null,
      period: null,
      keyword: '',
    };
    setFilters(cleared);
    setKeyword('');
    pushFilters(cleared);
  };

  const hasActiveFilters =
    filters.roles.length > 0 ||
    filters.techCategories.length > 0 ||
    filters.designCategories.length > 0 ||
    filters.format !== null ||
    filters.priceType !== null ||
    filters.region !== null ||
    filters.period !== null ||
    filters.keyword !== '';

  return (
    <div className="space-y-4 bg-white border border-zinc-200 rounded-xl p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="キーワード検索..."
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <FilterSection label="職種">
        {TARGET_ROLES.map((role) => (
          <FilterChip
            key={role}
            label={role}
            selected={filters.roles.includes(role)}
            onClick={() => toggleMulti('roles', role)}
          />
        ))}
      </FilterSection>

      <FilterSection label="技術">
        {TECH_CATEGORIES.map((cat) => (
          <FilterChip
            key={cat}
            label={cat}
            selected={filters.techCategories.includes(cat)}
            onClick={() => toggleMulti('techCategories', cat)}
          />
        ))}
      </FilterSection>

      <FilterSection label="デザイン">
        {DESIGN_CATEGORIES.map((cat) => (
          <FilterChip
            key={cat}
            label={cat}
            selected={filters.designCategories.includes(cat)}
            onClick={() => toggleMulti('designCategories', cat)}
          />
        ))}
      </FilterSection>

      <FilterSection label="形式">
        {EVENT_FORMATS.map(({ value, label }) => (
          <FilterChip
            key={value}
            label={label}
            selected={filters.format === value}
            onClick={() => toggleSingle('format', value)}
          />
        ))}
      </FilterSection>

      <FilterSection label="地域">
        {REGIONS.map((region) => (
          <FilterChip
            key={region}
            label={region}
            selected={filters.region === region}
            onClick={() => toggleSingle('region', region)}
          />
        ))}
      </FilterSection>

      <FilterSection label="参加費">
        {PRICE_TYPES.map(({ value, label }) => (
          <FilterChip
            key={value}
            label={label}
            selected={filters.priceType === value}
            onClick={() => toggleSingle('priceType', value)}
          />
        ))}
      </FilterSection>

      <FilterSection label="時期">
        {TIME_PERIODS.map(({ value, label }) => (
          <FilterChip
            key={value}
            label={label}
            selected={filters.period === value}
            onClick={() => toggleSingle('period', value)}
          />
        ))}
      </FilterSection>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            フィルタをクリア
          </button>
        </div>
      )}
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-sm font-medium text-zinc-500 w-16 shrink-0 pt-1.5">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
