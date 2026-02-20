package models

import (
	"encoding/json"
	"time"
)

type User struct {
	ID           int       `db:"id" json:"id"`
	Email        string    `db:"email" json:"email"`
	PasswordHash string    `db:"password_hash" json:"-"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}

type StoryGroup struct {
	ID         int          `db:"id" json:"id"`
	CitySlug   string       `db:"city_slug" json:"city_slug"`
	TitleFa    string       `db:"title_fa" json:"title_fa"`
	Caption    string       `db:"caption" json:"caption"`     // New field
	CoverURL   string       `db:"cover_url" json:"cover_url"` // New field
	ShortCode  string       `db:"short_code" json:"short_code"`
	Active     bool         `db:"active" json:"active"`
	ViewCount  int          `db:"view_count" json:"view_count"`
	CreatedAt  time.Time    `db:"created_at" json:"created_at"`
	StoryCount int64        `db:"story_count" json:"story_count"`
	Slides     []StorySlide `db:"-" json:"slides,omitempty"` // populated manually
}

type StorySlide struct {
	ID              int             `db:"id" json:"id"`
	GroupID         int             `db:"group_id" json:"group_id"`
	ImageURL        string          `db:"image_url" json:"image_url"`
	ThumbnailURL    *string         `db:"thumbnail_url" json:"thumbnail_url"`
	CaptionFa       string          `db:"caption_fa" json:"caption_fa"`
	Elements        json.RawMessage `db:"elements" json:"elements"` // JSONB
	SortOrder       int             `db:"sort_order" json:"sort_order"`
	OpenCount       int             `db:"open_count" json:"open_count"`
	Duration        int             `db:"duration" json:"duration"`
	BackgroundColor *string         `db:"background_color" json:"background_color"`
	CreatedAt       time.Time       `db:"created_at" json:"created_at"`
}

type DashboardStats struct {
	TotalGroups  int `json:"total_groups"`
	ActiveGroups int `json:"active_groups"`
	TotalSlides  int `json:"total_slides"`
	TotalViews   int `json:"total_views"`
	TotalCities  int `json:"total_cities"`
}
