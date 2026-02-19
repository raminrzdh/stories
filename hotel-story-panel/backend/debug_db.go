package main

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func main() {
	dsn := "postgres://ramin:@localhost:5432/hotel_story?sslmode=disable"
	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		log.Fatalln(err)
	}

	var groups []struct {
		ID       int    `db:"id"`
		CitySlug string `db:"city_slug"`
		TitleFa  string `db:"title_fa"`
		Active   bool   `db:"active"`
	}
	err = db.Select(&groups, "SELECT id, city_slug, title_fa, active FROM story_groups")
	if err != nil {
		log.Println("Error fetching groups:", err)
	}
	fmt.Println("--- Groups ---")
	for _, g := range groups {
		fmt.Printf("%+v\n", g)
	}

	var slides []struct {
		ID       int    `db:"id"`
		GroupID  int    `db:"group_id"`
		ImageURL string `db:"image_url"`
		Elements []byte `db:"elements"`
	}
	err = db.Select(&slides, "SELECT id, group_id, image_url, elements FROM story_slides")
	if err != nil {
		log.Println("Error fetching slides:", err)
	}
	fmt.Println("--- Slides ---")
	for _, s := range slides {
		fmt.Printf("ID: %d, GroupID: %d, Image: %s, Elements: %s\n", s.ID, s.GroupID, s.ImageURL, string(s.Elements))
	}
}
