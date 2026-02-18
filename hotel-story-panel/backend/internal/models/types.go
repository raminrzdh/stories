package models

import (
	"time"
)

type User struct {
	ID           int       `db:"id" json:"id"`
	Email        string    `db:"email" json:"email"`
	PasswordHash string    `db:"password_hash" json:"-"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}

type StoryGroup struct {
	ID        int       `db:"id" json:"id"`
	CitySlug  string    `db:"city_slug" json:"city_slug"`
	TitleFa   string    `db:"title_fa" json:"title_fa"`
	ShortCode string    `db:"short_code" json:"short_code"`
	Active    bool      `db:"active" json:"active"`
	ViewCount int       `db:"view_count" json:"view_count"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	Slides    []StorySlide `db:"-" json:"slides,omitempty"` // populated manually
}

type StorySlide struct {
	ID           int       `db:"id" json:"id"`
	GroupID      int       `db:"group_id" json:"group_id"`
	ImageURL     string    `db:"image_url" json:"image_url"`
	ThumbnailURL *string   `db:"thumbnail_url" json:"thumbnail_url"`
	CaptionFa    string    `db:"caption_fa" json:"caption_fa"`
	SortOrder    int       `db:"sort_order" json:"sort_order"`
	OpenCount    int       `db:"open_count" json:"open_count"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}
