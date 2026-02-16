export type EventFormat = 'online' | 'offline' | 'hybrid';

export type TargetRole = 'エンジニア' | 'デザイナー' | 'PM' | 'マーケター' | '全般';

export type TechCategory =
  | 'フロントエンド'
  | 'バックエンド'
  | 'インフラ'
  | 'AI・ML'
  | 'モバイル'
  | 'セキュリティ'
  | 'データ';

export type DesignCategory =
  | 'UI/UX'
  | 'グラフィック'
  | 'ブランディング'
  | 'プロダクトデザイン';

export type Region = '東京' | '大阪' | '名古屋' | '福岡' | 'その他' | 'オンライン';

export type EventSize = 'small' | 'medium' | 'large';

export type PriceType = 'free' | 'paid' | 'early_bird';

export type TimePeriod = 'this_week' | 'next_week' | 'this_month' | 'next_month';

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  timezone: string;
  format: EventFormat;
  venue: string | null;
  address: string | null;
  region: string | null;
  online_url: string | null;
  target_roles: TargetRole[];
  tech_categories: TechCategory[];
  design_categories: DesignCategory[];
  capacity: number | null;
  price: number;
  early_bird_price: number | null;
  early_bird_deadline: string | null;
  official_url: string;
  ticket_url: string | null;
  twitter_hashtag: string | null;
  source: string | null;
  is_premium: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventFilters {
  roles: TargetRole[];
  techCategories: TechCategory[];
  designCategories: DesignCategory[];
  format: EventFormat | null;
  size: EventSize | null;
  priceType: PriceType | null;
  region: Region | null;
  period: TimePeriod | null;
  keyword: string;
}

export const DEFAULT_FILTERS: EventFilters = {
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
