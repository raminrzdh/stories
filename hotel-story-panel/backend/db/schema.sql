-- Users (Admins)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story Groups (e.g., "Tehran Norouz Promo")
CREATE TABLE IF NOT EXISTS story_groups (
    id SERIAL PRIMARY KEY,
    city_slug VARCHAR(100) NOT NULL, -- e.g., 'tehran', 'shiraz'
    title_fa VARCHAR(255), -- Persian title, e.g., 'تخفیف‌های تهران'
    caption VARCHAR(255) DEFAULT '', -- Label under the circle
    cover_url TEXT DEFAULT '', -- Custom cover image
    short_code VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'tehran-promo-1404'
    active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story Slides
CREATE TABLE IF NOT EXISTS story_slides (
    id SERIAL PRIMARY KEY,
    group_id INT REFERENCES story_groups(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT, -- 1:1 cropped
    caption_fa TEXT, -- Persian caption
    sort_order INT DEFAULT 0,
    open_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by city
CREATE INDEX IF NOT EXISTS idx_story_groups_city ON story_groups(city_slug) WHERE active = TRUE;
