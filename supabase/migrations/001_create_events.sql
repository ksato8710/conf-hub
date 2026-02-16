CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- 日時
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  timezone TEXT DEFAULT 'Asia/Tokyo',

  -- 場所
  format TEXT CHECK (format IN ('online', 'offline', 'hybrid')),
  venue TEXT,
  address TEXT,
  region TEXT,
  online_url TEXT,

  -- 分類
  target_roles TEXT[] DEFAULT '{}',
  tech_categories TEXT[] DEFAULT '{}',
  design_categories TEXT[] DEFAULT '{}',

  -- 参加情報
  capacity INTEGER,
  price INTEGER DEFAULT 0,
  early_bird_price INTEGER,
  early_bird_deadline TIMESTAMPTZ,

  -- リンク
  official_url TEXT NOT NULL,
  ticket_url TEXT,
  twitter_hashtag TEXT,

  -- メタ
  source TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_format ON events(format);
CREATE INDEX idx_events_target_roles ON events USING GIN(target_roles);
CREATE INDEX idx_events_tech_categories ON events USING GIN(tech_categories);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
